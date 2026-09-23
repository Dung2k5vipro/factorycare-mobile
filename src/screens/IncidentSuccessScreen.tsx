import React from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'BaoSuCoThanhCong'>;

export function IncidentSuccessScreen({ navigation, route }: Props) {
  const { suCo } = route.params;

  React.useEffect(() => {
    const dangKy = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => dangKy.remove();
  }, []);

  return (
    <SafeAreaView style={styles.anToan}>
      <ScrollView contentContainerStyle={styles.noiDung}>
        <View style={styles.bieuTuong}>
          <CheckCircle2 color={mauSac.thanhCong} size={42} />
        </View>
        <Text style={styles.tieuDe}>Báo sự cố thành công</Text>
        <Text style={styles.moTa}>
          Báo cáo đã được ghi nhận và sẽ được chuyển đến bộ phận phụ trách.
        </Text>
        <View style={styles.thongTin}>
          <DongThongTin nhan="Mã sự cố" noiDung={suCo.maSuCo} />
          <View style={styles.trangThai}>
            <Text style={styles.nhanTrangThai}>Trạng thái</Text>
            <HuyHieu loai="suCo" giaTri={suCo.trangThai} />
          </View>
        </View>
        <View style={styles.hanhDong}>
          <NutChinh
            nhan="Xem chi tiết sự cố"
            onPress={() =>
              navigation.replace('ChiTietSuCo', { suCoId: suCo.id })
            }
          />
          <NutChinh
            nhan="Về trang chủ"
            kieu="phu"
            onPress={() => navigation.popTo('NhanVien', { screen: 'TrangChu' })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14 },
  bieuTuong: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: mauSac.thanhCongNhat,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  moTa: {
    color: mauSac.chuPhu,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 6,
  },
  thongTin: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingHorizontal: 16,
  },
  trangThai: { paddingVertical: 12, gap: 7 },
  nhanTrangThai: { color: mauSac.chuPhu, fontSize: 13 },
  hanhDong: { gap: 11, marginTop: 6 },
});
