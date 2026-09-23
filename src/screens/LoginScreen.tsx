import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { layThongBaoAnToan } from '../services/apiClient';

export function LoginScreen() {
  const { dangNhap } = useAuth();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loiEmail, setLoiEmail] = useState<string>();
  const [loiMatKhau, setLoiMatKhau] = useState<string>();
  const [loiChung, setLoiChung] = useState<string>();
  const [dangGui, setDangGui] = useState(false);
  const dangGuiRef = useRef(false);

  async function xuLyDangNhap() {
    const emailDaTrim = email.trim();
    const matKhauDaTrim = matKhau.trim();
    const loiEmailMoi = emailDaTrim ? undefined : 'Vui lòng nhập email.';
    const loiMatKhauMoi = matKhauDaTrim ? undefined : 'Vui lòng nhập mật khẩu.';
    setLoiEmail(loiEmailMoi);
    setLoiMatKhau(loiMatKhauMoi);
    setLoiChung(undefined);
    if (loiEmailMoi || loiMatKhauMoi || dangGuiRef.current) {
      return;
    }

    dangGuiRef.current = true;
    setDangGui(true);
    try {
      await dangNhap(emailDaTrim, matKhauDaTrim);
    } catch (loi) {
      setLoiChung(loi instanceof Error ? loi.message : layThongBaoAnToan(loi));
    } finally {
      dangGuiRef.current = false;
      setDangGui(false);
    }
  }

  return (
    <SafeAreaView style={styles.anToan}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.noiDung}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.thuongHieu}>
            <View style={styles.logo}>
              <ShieldCheck color={mauSac.trang} size={30} strokeWidth={2.2} />
            </View>
            <Text style={styles.tenThuongHieu}>FactoryCare</Text>
            <Text style={styles.moTa}>Quản lý sự cố và bảo trì thiết bị</Text>
          </View>

          <View style={styles.bieuMau}>
            <View style={styles.dauBieuMau}>
              <Text style={styles.tieuDe}>Đăng nhập</Text>
              <Text style={styles.huongDan}>
                Sử dụng tài khoản nhân viên được cấp.
              </Text>
            </View>
            <OThongTin
              nhan="Email"
              giaTri={email}
              onChangeText={giaTri => {
                setEmail(giaTri);
                if (loiEmail) setLoiEmail(undefined);
              }}
              loi={loiEmail}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Nhập email"
              returnKeyType="next"
            />
            <OThongTin
              nhan="Mật khẩu"
              giaTri={matKhau}
              onChangeText={giaTri => {
                setMatKhau(giaTri);
                if (loiMatKhau) setLoiMatKhau(undefined);
              }}
              loi={loiMatKhau}
              laMatKhau
              placeholder="Nhập mật khẩu"
              returnKeyType="done"
              onSubmitEditing={() => xuLyDangNhap()}
            />
            {loiChung ? <Text style={styles.loiChung}>{loiChung}</Text> : null}
            <NutChinh
              nhan="Đăng nhập"
              onPress={() => xuLyDangNhap()}
              dangTai={dangGui}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  flex: { flex: 1 },
  noiDung: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 36 },
  thuongHieu: { alignItems: 'center', gap: 8 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: boGoc.lon,
    backgroundColor: mauSac.chinh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tenThuongHieu: { color: mauSac.chuChinh, fontSize: 28, fontWeight: '800' },
  moTa: { color: mauSac.chuPhu, fontSize: 14, textAlign: 'center' },
  bieuMau: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: mauSac.beMat,
    borderRadius: boGoc.lon,
    borderWidth: 1,
    borderColor: mauSac.vien,
    padding: 20,
    gap: 18,
  },
  dauBieuMau: { gap: 5, marginBottom: 2 },
  tieuDe: { color: mauSac.chuChinh, fontSize: 22, fontWeight: '800' },
  huongDan: { color: mauSac.chuPhu, fontSize: 14, lineHeight: 20 },
  loiChung: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    borderRadius: boGoc.nho,
    padding: 11,
    fontSize: 13,
    lineHeight: 19,
  },
});
