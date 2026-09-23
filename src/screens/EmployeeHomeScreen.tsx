import React, { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Bell, ChevronRight, QrCode, Wrench } from 'lucide-react-native';
import { useFocusEffect, type NavigationProp } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TheSuCo } from '../components/TheSuCo';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, kichThuocCham, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabNhanVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachSuCoCuaToi } from '../services/suCoService';
import type { SuCo } from '../types';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'TrangChu'>;

export function EmployeeHomeScreen({ navigation }: Props) {
  const { nguoiDung } = useAuth();
  const [danhSachSuCo, setDanhSachSuCo] = useState<SuCo[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);
  const [loi, setLoi] = useState<string>();

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

  const dangXuLy = danhSachSuCo.filter(suCo =>
    ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY'].includes(suCo.trangThai),
  ).length;
  const hoanThanh = danhSachSuCo.filter(
    suCo => suCo.trangThai === 'DA_XU_LY',
  ).length;
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <ScrollView
        contentContainerStyle={styles.noiDung}
        refreshControl={
          <RefreshControl
            refreshing={dangLamMoi}
            onRefresh={() => taiDuLieu(true)}
            tintColor={mauSac.chinh}
          />
        }
      >
        <TieuDeManHinh
          tieuDe={`Xin chào, ${nguoiDung?.hoTen ?? 'Nhân viên'}`}
          moTa={
            nguoiDung?.boPhan || nguoiDung?.maNhanVien || 'Nhân viên vận hành'
          }
          benPhai={
            <Pressable
              accessibilityLabel="Mở thông báo"
              onPress={() => navigation.navigate('ThongBao')}
              style={styles.nutBieuTuong}
            >
              <Bell color={mauSac.chuChinh} size={23} />
            </Pressable>
          }
        />

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('QuetQR')}
          style={({ pressed }) => [styles.quetQr, pressed && styles.dangNhan]}
        >
          <View style={styles.quetQrIcon}>
            <QrCode color={mauSac.trang} size={32} strokeWidth={2.2} />
          </View>
          <View style={styles.quetQrNoiDung}>
            <Text style={styles.quetQrNhan}>QUÉT QR THIẾT BỊ</Text>
            <Text style={styles.quetQrMoTa}>
              Tra cứu nhanh và báo sự cố tại hiện trường
            </Text>
          </View>
          <ChevronRight color={mauSac.trang} size={24} />
        </Pressable>

        <View style={styles.khuVuc}>
          <View style={styles.dauKhuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Sự cố của tôi</Text>
            <Pressable
              onPress={() => navigation.navigate('SuCoCuaToi')}
              hitSlop={8}
            >
              <Text style={styles.lienKet}>Xem tất cả</Text>
            </Pressable>
          </View>

          {dangTai ? (
            <TrangThaiDuLieu loai="dangTai" moTa="Đang tổng hợp sự cố..." />
          ) : loi ? (
            <TrangThaiDuLieu
              loai="loi"
              moTa={loi}
              onThuLai={() => taiDuLieu()}
            />
          ) : (
            <>
              <View style={styles.tongQuan}>
                <Pressable
                  style={styles.soLieu}
                  onPress={() => navigation.navigate('SuCoCuaToi')}
                >
                  <Text style={styles.soLieuGiaTri}>{dangXuLy}</Text>
                  <Text style={styles.soLieuNhan}>Đang xử lý</Text>
                </Pressable>
                <View style={styles.phanCach} />
                <Pressable
                  style={styles.soLieu}
                  onPress={() => navigation.navigate('SuCoCuaToi')}
                >
                  <Text style={styles.soLieuGiaTri}>{hoanThanh}</Text>
                  <Text style={styles.soLieuNhan}>Hoàn thành</Text>
                </Pressable>
              </View>

              <View style={styles.danhSachGanDay}>
                <View style={styles.nhanGanDay}>
                  <Wrench color={mauSac.chuPhu} size={18} />
                  <Text style={styles.tieuDeNho}>Cập nhật gần đây</Text>
                </View>
                {danhSachSuCo.length === 0 ? (
                  <TrangThaiDuLieu
                    loai="trong"
                    tieuDe="Bạn chưa báo sự cố nào"
                    moTa="Quét mã QR trên thiết bị để bắt đầu khi phát hiện bất thường."
                  />
                ) : (
                  danhSachSuCo.slice(0, 3).map(suCo => (
                    <TheSuCo
                      key={suCo.id}
                      suCo={suCo}
                      onPress={() =>
                        dieuHuongGoc?.navigate('ChiTietSuCo', {
                          suCoId: suCo.id,
                        })
                      }
                    />
                  ))
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 32, gap: 24 },
  nutBieuTuong: {
    width: kichThuocCham,
    height: kichThuocCham,
    borderRadius: 24,
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quetQr: {
    minHeight: 118,
    padding: 18,
    borderRadius: boGoc.lon,
    backgroundColor: mauSac.chinh,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quetQrIcon: {
    width: 56,
    height: 56,
    borderRadius: boGoc.vua,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quetQrNoiDung: { flex: 1, gap: 5 },
  quetQrNhan: { color: mauSac.trang, fontSize: 17, fontWeight: '800' },
  quetQrMoTa: { color: '#DDF1EB', fontSize: 13, lineHeight: 19 },
  dangNhan: { opacity: 0.82 },
  khuVuc: { gap: 14 },
  dauKhuVuc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tieuDeKhuVuc: { color: mauSac.chuChinh, fontSize: 18, fontWeight: '800' },
  lienKet: { color: mauSac.chinh, fontSize: 14, fontWeight: '700' },
  tongQuan: {
    flexDirection: 'row',
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingVertical: 18,
  },
  soLieu: { flex: 1, alignItems: 'center', gap: 4 },
  soLieuGiaTri: { color: mauSac.chuChinh, fontSize: 26, fontWeight: '800' },
  soLieuNhan: { color: mauSac.chuPhu, fontSize: 13 },
  phanCach: { width: 1, backgroundColor: mauSac.vien },
  danhSachGanDay: { gap: 12 },
  nhanGanDay: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tieuDeNho: { color: mauSac.chuPhu, fontSize: 14, fontWeight: '700' },
});
