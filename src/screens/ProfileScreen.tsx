import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NavigationProp } from '@react-navigation/native';
import { KeyRound, LogOut, UserRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { NutChinh } from '../components/NutChinh';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabNhanVien,
} from '../navigation/types';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'TaiKhoan'>;

export function ProfileScreen({ navigation }: Props) {
  const { nguoiDung, dangXuat } = useAuth();
  const [dangDangXuat, setDangDangXuat] = useState(false);
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  function xuLyYeuCauDangXuat() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          setDangDangXuat(true);
          try {
            await dangXuat();
          } finally {
            setDangDangXuat(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <ScrollView contentContainerStyle={styles.noiDung}>
        <TieuDeManHinh
          tieuDe="Tài khoản"
          moTa="Thông tin tài khoản đang đăng nhập."
        />
        <View style={styles.daiDien}>
          <View style={styles.anhDaiDien}>
            <UserRound color={mauSac.chinh} size={36} />
          </View>
          <View style={styles.tenNguoiDung}>
            <Text style={styles.hoTen}>{nguoiDung?.hoTen}</Text>
            <Text style={styles.vaiTro}>Nhân viên</Text>
          </View>
        </View>
        <View style={styles.theThongTin}>
          {nguoiDung?.maNhanVien ? (
            <DongThongTin nhan="Mã nhân viên" noiDung={nguoiDung.maNhanVien} />
          ) : null}
          <DongThongTin nhan="Email" noiDung={nguoiDung?.email} />
          <DongThongTin nhan="Số điện thoại" noiDung={nguoiDung?.soDienThoai} />
          {nguoiDung?.boPhan ? (
            <DongThongTin nhan="Bộ phận" noiDung={nguoiDung.boPhan} />
          ) : null}
          <DongThongTin nhan="Vai trò" noiDung="Nhân viên" />
        </View>
        <View style={styles.hanhDong}>
          <NutChinh
            nhan="Đổi mật khẩu"
            bieuTuong={KeyRound}
            kieu="phu"
            onPress={() => dieuHuongGoc?.navigate('DoiMatKhau')}
          />
          <NutChinh
            nhan="Đăng xuất"
            bieuTuong={LogOut}
            kieu="nguyHiem"
            dangTai={dangDangXuat}
            onPress={xuLyYeuCauDangXuat}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 32, gap: 20 },
  daiDien: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
  },
  anhDaiDien: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: mauSac.chinhNhat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenNguoiDung: { flex: 1, gap: 4 },
  hoTen: { color: mauSac.chuChinh, fontSize: 19, fontWeight: '800' },
  vaiTro: { color: mauSac.chuPhu, fontSize: 14 },
  theThongTin: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingHorizontal: 16,
  },
  hanhDong: { gap: 12 },
});
