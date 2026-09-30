import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { NutChinh } from '../components/NutChinh';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { dinhDangNgayGio, layNhanKetQuaSuaChua } from '../utils/dinhDang';
import { layHoSoSuaChuaCuoi } from '../utils/nghiepVuCongViec';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'KetQuaCongViec'>;

export function RepairSuccessScreen({ navigation, route }: Props) {
  const { congViec, duLieuHoanThanh } = route.params;
  const hoSoCuoi = layHoSoSuaChuaCuoi(congViec);
  return (
    <SafeAreaView style={styles.anToan}>
      <ScrollView contentContainerStyle={styles.noiDung}>
        <View style={styles.bieuTuong}>
          <CheckCircle2 color={mauSac.thanhCong} size={42} strokeWidth={2.2} />
        </View>
        <View style={styles.dauTrang}>
          <Text style={styles.tieuDe}>Đã gửi kết quả sửa chữa</Text>
          <Text style={styles.moTa}>
            Kết quả sửa chữa đã được lưu. Đang chờ nhân viên vận hành kiểm tra và xác nhận máy hoạt động.
          </Text>
        </View>
        <View style={styles.khuVuc}>
          <DongThongTin nhan="Mã sự cố" noiDung={congViec.maSuCo} />
          <DongThongTin
            nhan="Thiết bị"
            noiDung={
              congViec.thietBi
                ? `${congViec.thietBi.tenThietBi} · ${congViec.thietBi.maThietBi}`
                : undefined
            }
          />
          <DongThongTin
            nhan="Nguyên nhân"
            noiDung={duLieuHoanThanh.nguyenNhan}
          />
          <DongThongTin
            nhan="Thời gian bắt đầu"
            noiDung={dinhDangNgayGio(hoSoCuoi?.thoiGianBatDau)}
          />
          <DongThongTin
            nhan="Thời gian hoàn thành"
            noiDung={dinhDangNgayGio(
              congViec.thoiGianHoanThanh ?? hoSoCuoi?.thoiGianHoanThanh,
            )}
          />
          <DongThongTin
            nhan="Phương án xử lý"
            noiDung={duLieuHoanThanh.cachXuLy}
          />
          <DongThongTin
            nhan="Tình trạng thiết bị"
            noiDung={layNhanKetQuaSuaChua(duLieuHoanThanh.ketQua)}
          />
          <DongThongTin
            nhan="Linh kiện đã thay"
            noiDung={
              duLieuHoanThanh.linhKienThayThe.length
                ? duLieuHoanThanh.linhKienThayThe
                    .map(linhKien =>
                      `${linhKien.tenLinhKien} × ${linhKien.soLuong} ${
                        linhKien.donVi ?? ''
                      }`.trim(),
                    )
                    .join('\n')
                : 'Không thay linh kiện'
            }
          />
          <DongThongTin
            nhan="Kết quả chạy thử / Ghi chú"
            noiDung={duLieuHoanThanh.ghiChu}
          />
        </View>
        <NutChinh
          nhan="Về Công việc của tôi"
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'KyThuatVien', params: { screen: 'CongViec' } }],
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
