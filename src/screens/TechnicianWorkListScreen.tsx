import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect, type NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TheSuCo } from '../components/TheSuCo';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabKyThuatVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachCongViecCuaToi } from '../services/congViecService';
import type { SuCo } from '../types';
import { sapXepCongViec } from '../utils/nghiepVuCongViec';

type Props = BottomTabScreenProps<ThamSoTabKyThuatVien, 'CongViec'>;
type BoLocCongViec =
  | 'CAN_XU_LY'
  | 'TAT_CA'
  | 'DA_PHAN_CONG'
  | 'DANG_XU_LY'
  | 'CHO_LINH_KIEN'
  | 'DA_XU_LY';

const CAC_BO_LOC: { giaTri: BoLocCongViec; nhan: string }[] = [
  { giaTri: 'CAN_XU_LY', nhan: 'Cần xử lý' },
  { giaTri: 'TAT_CA', nhan: 'Tất cả' },
  { giaTri: 'DA_PHAN_CONG', nhan: 'Mới' },
  { giaTri: 'DANG_XU_LY', nhan: 'Đang xử lý' },
  { giaTri: 'CHO_LINH_KIEN', nhan: 'Chờ linh kiện' },
  { giaTri: 'DA_XU_LY', nhan: 'Hoàn thành' },
];

function KhoangCachDanhSach() {
  return <View style={styles.khoangTrong} />;
}

export function TechnicianWorkListScreen({ navigation }: Props) {
  const [danhSachCongViec, setDanhSachCongViec] = useState<SuCo[]>([]);
  const [boLoc, setBoLoc] = useState<BoLocCongViec>('CAN_XU_LY');
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);
  const [loi, setLoi] = useState<string>();
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  const taiDuLieu = useCallback(async (laLamMoi = false) => {
    laLamMoi ? setDangLamMoi(true) : setDangTai(true);
    setLoi(undefined);
    try {
      const ketQua = await layDanhSachCongViecCuaToi({ gioiHan: 50 });
      setDanhSachCongViec(sapXepCongViec(ketQua.danhSach));
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
      setDangLamMoi(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  const danhSachDaLoc = useMemo(
    () =>
      danhSachCongViec.filter(congViec => {
        if (boLoc === 'TAT_CA') return true;
        if (boLoc === 'CAN_XU_LY') {
          return ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN'].includes(
            congViec.trangThai,
          );
        }
        return congViec.trangThai === boLoc;
      }),
    [boLoc, danhSachCongViec],
  );

  const soCanXuLy = danhSachCongViec.filter(congViec =>
    ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN'].includes(
      congViec.trangThai,
    ),
  ).length;
  const soKhanCap = danhSachCongViec.filter(
    congViec =>
      congViec.mucDo === 'NGHIEM_TRONG' &&
      !['DA_XU_LY', 'DA_HUY'].includes(congViec.trangThai),
  ).length;
  const soDangXuLy = danhSachCongViec.filter(
    congViec => congViec.trangThai === 'DANG_XU_LY',
  ).length;

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <FlatList
        data={danhSachDaLoc}
        keyExtractor={congViec => String(congViec.id)}
        contentContainerStyle={styles.noiDung}
        ItemSeparatorComponent={KhoangCachDanhSach}
        refreshControl={
          <RefreshControl
            refreshing={dangLamMoi}
            onRefresh={() => taiDuLieu(true)}
            tintColor={mauSac.chinh}
          />
        }
        ListHeaderComponent={
          <View style={styles.dauDanhSach}>
            <TieuDeManHinh
              tieuDe="Công việc của tôi"
              moTa="Ưu tiên công việc khẩn cấp và đang xử lý."
            />
            <View style={styles.tongQuan}>
              <View style={styles.soLieu}>
                <Text style={styles.soLieuGiaTri}>{soCanXuLy}</Text>
                <Text style={styles.soLieuNhan}>Cần xử lý</Text>
              </View>
              <View style={styles.phanCach} />
              <View style={styles.soLieu}>
                <Text
                  style={[
                    styles.soLieuGiaTri,
                    soKhanCap > 0 && styles.soLieuKhanCap,
                  ]}
                >
                  {soKhanCap}
                </Text>
                <Text style={styles.soLieuNhan}>Khẩn cấp</Text>
              </View>
              <View style={styles.phanCach} />
              <View style={styles.soLieu}>
                <Text style={styles.soLieuGiaTri}>{soDangXuLy}</Text>
                <Text style={styles.soLieuNhan}>Đang xử lý</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.boLoc}
            >
              {CAC_BO_LOC.map(luaChon => (
                <Pressable
                  key={luaChon.giaTri}
                  onPress={() => setBoLoc(luaChon.giaTri)}
                  style={[
                    styles.nutLoc,
                    boLoc === luaChon.giaTri && styles.nutLocDangChon,
                  ]}
                >
                  <Text
                    style={[
                      styles.nhanLoc,
                      boLoc === luaChon.giaTri && styles.nhanLocDangChon,
                    ]}
                  >
                    {luaChon.nhan}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          dangTai ? (
            <TrangThaiDuLieu
              loai="dangTai"
              moTa="Đang tải công việc được phân công..."
            />
          ) : loi ? (
            <TrangThaiDuLieu
              loai="loi"
              moTa={loi}
              onThuLai={() => taiDuLieu()}
            />
          ) : (
            <TrangThaiDuLieu
              loai="trong"
              tieuDe="Hiện tại chưa có công việc cần xử lý"
              moTa="Kéo xuống để kiểm tra phân công mới."
            />
          )
        }
        renderItem={({ item: congViec }) => (
          <TheSuCo
            suCo={congViec}
            onPress={() =>
              dieuHuongGoc?.navigate('ChiTietCongViec', {
                congViecId: congViec.id,
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  dauDanhSach: { gap: 18, marginBottom: 16 },
  tongQuan: {
    flexDirection: 'row',
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingVertical: 16,
  },
  soLieu: { flex: 1, alignItems: 'center', gap: 4 },
  soLieuGiaTri: { color: mauSac.chuChinh, fontSize: 24, fontWeight: '800' },
  soLieuKhanCap: { color: mauSac.loi },
  soLieuNhan: { color: mauSac.chuPhu, fontSize: 12 },
  phanCach: { width: 1, backgroundColor: mauSac.vien },
  boLoc: { gap: 8, paddingRight: 8 },
  nutLoc: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: boGoc.tron,
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutLocDangChon: { backgroundColor: mauSac.chinh, borderColor: mauSac.chinh },
  nhanLoc: { color: mauSac.chuPhu, fontSize: 13, fontWeight: '600' },
  nhanLocDangChon: { color: mauSac.trang },
  khoangTrong: { height: 12 },
});
