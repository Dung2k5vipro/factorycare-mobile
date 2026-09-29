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
import { TheBaoTri } from '../components/TheBaoTri';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabKyThuatVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachPhieuBaoTriCuaToi } from '../services/baoTriService';
import type { PhieuBaoTri } from '../types';
import {
  kiemTraNgayHomNay,
  kiemTraNgaySapToi,
  sapXepPhieuBaoTri,
} from '../utils/nghiepVuBaoTri';

type Props = BottomTabScreenProps<ThamSoTabKyThuatVien, 'BaoTri'>;
type BoLocBaoTri = 'CAN_LAM' | 'HOM_NAY' | 'SAP_TOI' | 'QUA_HAN' | 'HOAN_THANH';

const CAC_BO_LOC: { giaTri: BoLocBaoTri; nhan: string }[] = [
  { giaTri: 'CAN_LAM', nhan: 'Cần làm' },
  { giaTri: 'HOM_NAY', nhan: 'Hôm nay' },
  { giaTri: 'SAP_TOI', nhan: 'Sắp tới' },
  { giaTri: 'QUA_HAN', nhan: 'Quá hạn' },
  { giaTri: 'HOAN_THANH', nhan: 'Hoàn thành' },
];

function KhoangCachDanhSach() {
  return <View style={styles.khoangTrong} />;
}

export function MaintenanceListScreen({ navigation }: Props) {
  const [danhSachPhieu, setDanhSachPhieu] = useState<PhieuBaoTri[]>([]);
  const [boLoc, setBoLoc] = useState<BoLocBaoTri>('CAN_LAM');
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);
  const [loi, setLoi] = useState<string>();
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  const taiDuLieu = useCallback(async (dangYeuCauLamMoi = false) => {
    dangYeuCauLamMoi ? setDangLamMoi(true) : setDangTai(true);
    setLoi(undefined);
    try {
      const ketQua = await layDanhSachPhieuBaoTriCuaToi({ gioiHan: 50 });
      setDanhSachPhieu(sapXepPhieuBaoTri(ketQua.danhSach));
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
      danhSachPhieu.filter(phieu => {
        if (boLoc === 'CAN_LAM') {
          return ['CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN'].includes(
            phieu.trangThai,
          );
        }
        if (boLoc === 'HOM_NAY') {
          return (
            kiemTraNgayHomNay(phieu.ngayDuKien) &&
            !['HOAN_THANH', 'DA_HUY'].includes(phieu.trangThai)
          );
        }
        if (boLoc === 'SAP_TOI') {
          return (
            kiemTraNgaySapToi(phieu.ngayDuKien) &&
            !['HOAN_THANH', 'DA_HUY'].includes(phieu.trangThai)
          );
        }
        return phieu.trangThai === boLoc;
      }),
    [boLoc, danhSachPhieu],
  );

  const soHomNay = danhSachPhieu.filter(
    phieu =>
      kiemTraNgayHomNay(phieu.ngayDuKien) &&
      !['HOAN_THANH', 'DA_HUY'].includes(phieu.trangThai),
  ).length;
  const soQuaHan = danhSachPhieu.filter(
    phieu => phieu.trangThai === 'QUA_HAN',
  ).length;

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <FlatList
        data={danhSachDaLoc}
        keyExtractor={phieu => String(phieu.id)}
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
              tieuDe="Bảo trì của tôi"
              moTa="Các phiếu bảo trì được phân công cho bạn."
            />
            <View style={styles.tongQuan}>
              <View style={styles.soLieu}>
                <Text style={styles.soLieuGiaTri}>{soHomNay}</Text>
                <Text style={styles.soLieuNhan}>Hôm nay</Text>
              </View>
              <View style={styles.phanCach} />
              <View style={styles.soLieu}>
                <Text
                  style={[
                    styles.soLieuGiaTri,
                    soQuaHan > 0 && styles.soLieuQuaHan,
                  ]}
                >
                  {soQuaHan}
                </Text>
                <Text style={styles.soLieuNhan}>Quá hạn</Text>
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
            {loi && danhSachDaLoc.length ? (
              <Pressable onPress={() => taiDuLieu()} style={styles.loiLamMoi}>
                <Text style={styles.loiLamMoiChu}>{loi} Chạm để thử lại.</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          dangTai ? (
            <TrangThaiDuLieu
              loai="dangTai"
              moTa="Đang tải công việc bảo trì..."
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
              tieuDe="Không có phiếu bảo trì phù hợp"
              moTa="Kéo xuống để kiểm tra phân công mới."
            />
          )
        }
        renderItem={({ item: phieu }) => (
          <TheBaoTri
            phieuBaoTri={phieu}
            onPress={() =>
              dieuHuongGoc?.navigate('ChiTietBaoTri', {
                phieuBaoTriId: phieu.id,
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
  soLieuQuaHan: { color: mauSac.loi },
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
  loiLamMoi: {
    padding: 12,
    borderRadius: boGoc.nho,
    backgroundColor: mauSac.loiNhat,
  },
  loiLamMoiChu: { color: mauSac.loi, fontSize: 13, lineHeight: 18 },
  khoangTrong: { height: 12 },
});
