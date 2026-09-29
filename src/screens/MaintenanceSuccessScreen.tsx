import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { NutChinh } from '../components/NutChinh';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { dinhDangNgayGio, layNhanTrangThaiThietBi } from '../utils/dinhDang';
import { layDanhSachHangMucBaoTri } from '../utils/nghiepVuBaoTri';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'KetQuaBaoTri'>;

export function MaintenanceSuccessScreen({ navigation, route }: Props) {
  const { phieuBaoTri } = route.params;
  const danhSachHangMuc = layDanhSachHangMucBaoTri(phieuBaoTri);
  const soHangMucDat = danhSachHangMuc.filter(
    hangMuc => hangMuc.trangThai === 'TOT',
  ).length;
  const soHangMucKhongDat = danhSachHangMuc.filter(
    hangMuc => hangMuc.trangThai === 'KHONG_TOT',
  ).length;

  return (
    <SafeAreaView style={styles.anToan}>
      <ScrollView contentContainerStyle={styles.noiDung}>
        <View style={styles.bieuTuong}>
          <CheckCircle2 color={mauSac.thanhCong} size={42} strokeWidth={2.2} />
        </View>
        <View style={styles.dauTrang}>
          <Text style={styles.tieuDe}>Bảo trì đã hoàn thành</Text>
          <Text style={styles.moTa}>
            Kết quả bảo trì đã được ghi nhận trên hệ thống.
          </Text>
        </View>
        <View style={styles.khuVuc}>
          <DongThongTin
            nhan="Phiếu bảo trì"
            noiDung={phieuBaoTri.maPhieu || `Phiếu bảo trì #${phieuBaoTri.id}`}
          />
          <DongThongTin
            nhan="Thiết bị"
            noiDung={
              phieuBaoTri.thietBi
                ? `${phieuBaoTri.thietBi.tenThietBi} · ${phieuBaoTri.thietBi.maThietBi}`
                : undefined
            }
          />
          <DongThongTin
            nhan="Thời gian bắt đầu"
            noiDung={dinhDangNgayGio(phieuBaoTri.thoiGianBatDau)}
          />
          <DongThongTin
            nhan="Thời gian hoàn thành"
            noiDung={dinhDangNgayGio(phieuBaoTri.thoiGianHoanThanh)}
          />
          <DongThongTin
            nhan="Checklist"
            noiDung={`${soHangMucDat} đạt · ${soHangMucKhongDat} không đạt · ${danhSachHangMuc.length} tổng cộng`}
          />
          <DongThongTin
            nhan="Nội dung đã thực hiện"
            noiDung={phieuBaoTri.ketQuaBaoTri}
          />
          <DongThongTin nhan="Ghi chú" noiDung={phieuBaoTri.ghiChu} />
          <DongThongTin
            nhan="Tình trạng thiết bị"
            noiDung={layNhanTrangThaiThietBi(
              phieuBaoTri.trangThaiThietBi ?? phieuBaoTri.thietBi?.trangThai,
            )}
          />
          <DongThongTin
            nhan="Linh kiện đã thay"
            noiDung={
              phieuBaoTri.linhKienThayThe?.length
                ? phieuBaoTri.linhKienThayThe
                    .map(linhKien => `${linhKien.ten} × ${linhKien.soLuong}`)
                    .join('\n')
                : 'Không thay linh kiện'
            }
          />
        </View>
        <NutChinh
          nhan="Về Bảo trì của tôi"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'KyThuatVien', params: { screen: 'BaoTri' } }],
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { flexGrow: 1, padding: 20, paddingBottom: 36, gap: 20 },
  bieuTuong: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: mauSac.thanhCongNhat,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  dauTrang: { alignItems: 'center', gap: 6 },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  moTa: {
    color: mauSac.chuPhu,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingHorizontal: 16,
  },
});
