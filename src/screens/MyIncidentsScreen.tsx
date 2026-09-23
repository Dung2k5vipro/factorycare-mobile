import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
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
  ThamSoTabNhanVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachSuCoCuaToi } from '../services/suCoService';
import type { SuCo } from '../types';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'SuCoCuaToi'>;
type BoLocNhan = 'TAT_CA' | 'DANG_XU_LY' | 'HOAN_THANH';

const CAC_BO_LOC: { giaTri: BoLocNhan; nhan: string }[] = [
  { giaTri: 'TAT_CA', nhan: 'Tất cả' },
  { giaTri: 'DANG_XU_LY', nhan: 'Đang xử lý' },
  { giaTri: 'HOAN_THANH', nhan: 'Hoàn thành' },
];

function KhoangCachDanhSach() {
  return <View style={styles.khoangTrong} />;
}

export function MyIncidentsScreen({ navigation }: Props) {
  const [danhSachSuCo, setDanhSachSuCo] = useState<SuCo[]>([]);
  const [boLoc, setBoLoc] = useState<BoLocNhan>('TAT_CA');
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);
  const [loi, setLoi] = useState<string>();
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  const taiDuLieu = useCallback(async (laLamMoi = false) => {
    laLamMoi ? setDangLamMoi(true) : setDangTai(true);
    setLoi(undefined);
    try {
      const ketQua = await layDanhSachSuCoCuaToi({ gioiHan: 50 });
      setDanhSachSuCo(ketQua.danhSach);
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

  const danhSachDaLoc = danhSachSuCo.filter(suCo => {
    if (boLoc === 'TAT_CA') return true;
    if (boLoc === 'HOAN_THANH') return suCo.trangThai === 'DA_XU_LY';
    return ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY'].includes(suCo.trangThai);
  });

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <FlatList
        data={danhSachDaLoc}
        keyExtractor={suCo => String(suCo.id)}
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
              tieuDe="Sự cố của tôi"
              moTa="Theo dõi các sự cố bạn đã gửi."
            />
            <View style={styles.boLoc}>
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
            </View>
          </View>
        }
        ListEmptyComponent={
          dangTai ? (
            <TrangThaiDuLieu loai="dangTai" />
          ) : loi ? (
            <TrangThaiDuLieu
              loai="loi"
              moTa={loi}
              onThuLai={() => taiDuLieu()}
            />
          ) : (
            <TrangThaiDuLieu
              loai="trong"
              tieuDe={
                boLoc === 'TAT_CA'
                  ? 'Bạn chưa báo sự cố nào'
                  : 'Không có sự cố phù hợp'
              }
              moTa="Danh sách sẽ được cập nhật khi có dữ liệu."
            />
          )
        }
        renderItem={({ item: suCo }) => (
          <TheSuCo
            suCo={suCo}
            onPress={() =>
              dieuHuongGoc?.navigate('ChiTietSuCo', { suCoId: suCo.id })
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
  boLoc: { flexDirection: 'row', gap: 8 },
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
