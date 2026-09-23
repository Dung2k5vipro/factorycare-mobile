import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { doiMatKhau } from '../services/authService';
import { layThongBaoAnToan, LoiApi } from '../services/apiClient';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'DoiMatKhau'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [xacNhan, setXacNhan] = useState('');
  const [loiTruong, setLoiTruong] = useState<Record<string, string>>({});
  const [phanHoi, setPhanHoi] = useState<{
    loai: 'loi' | 'thanhCong';
    noiDung: string;
  }>();
  const [dangGui, setDangGui] = useState(false);
  const dangGuiRef = useRef(false);

  async function xuLyDoiMatKhau() {
    const loiMoi: Record<string, string> = {};
    if (!matKhauCu.trim())
      loiMoi.matKhauCu = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!matKhauMoi.trim()) loiMoi.matKhauMoi = 'Vui lòng nhập mật khẩu mới.';
    if (!xacNhan.trim()) loiMoi.xacNhan = 'Vui lòng nhập lại mật khẩu mới.';
    if (matKhauMoi && xacNhan && matKhauMoi !== xacNhan) {
      loiMoi.xacNhan = 'Mật khẩu xác nhận không trùng khớp.';
    }
    setLoiTruong(loiMoi);
    setPhanHoi(undefined);
    if (Object.keys(loiMoi).length || dangGuiRef.current) return;

    dangGuiRef.current = true;
    setDangGui(true);
    try {
      await doiMatKhau(matKhauCu, matKhauMoi);
      setPhanHoi({ loai: 'thanhCong', noiDung: 'Đổi mật khẩu thành công.' });
      setTimeout(() => navigation.goBack(), 700);
    } catch (loi) {
      if (loi instanceof LoiApi && loi.loiTruong) {
        setLoiTruong(hienTai => ({ ...hienTai, ...loi.loiTruong }));
      }
      setPhanHoi({ loai: 'loi', noiDung: layThongBaoAnToan(loi) });
    } finally {
      dangGuiRef.current = false;
      setDangGui(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.anToan}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.noiDung}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.moTa}>
            Mật khẩu mới phải đáp ứng quy tắc bảo mật của hệ thống.
          </Text>
          <OThongTin
            nhan="Mật khẩu hiện tại"
            giaTri={matKhauCu}
            onChangeText={setMatKhauCu}
            loi={loiTruong.matKhauCu}
            laMatKhau
          />
          <OThongTin
            nhan="Mật khẩu mới"
            giaTri={matKhauMoi}
            onChangeText={setMatKhauMoi}
            loi={loiTruong.matKhauMoi}
            laMatKhau
          />
          <OThongTin
            nhan="Nhập lại mật khẩu mới"
            giaTri={xacNhan}
            onChangeText={setXacNhan}
            loi={loiTruong.xacNhan}
            laMatKhau
          />
          {phanHoi ? (
            <Text
              style={[
                styles.phanHoi,
                phanHoi.loai === 'thanhCong' && styles.thanhCong,
              ]}
            >
              {phanHoi.noiDung}
            </Text>
          ) : null}
          <NutChinh
            nhan="Đổi mật khẩu"
            onPress={() => xuLyDoiMatKhau()}
            dangTai={dangGui}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  flex: { flex: 1 },
  noiDung: { padding: 20, gap: 18 },
  moTa: { color: mauSac.chuPhu, fontSize: 14, lineHeight: 21 },
  phanHoi: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    padding: 12,
    borderRadius: boGoc.nho,
    fontSize: 13,
  },
  thanhCong: { color: mauSac.thanhCong, backgroundColor: mauSac.thanhCongNhat },
});
