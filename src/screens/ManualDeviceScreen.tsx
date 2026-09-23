import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { timThietBiTheoMa } from '../services/thietBiService';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'NhapMaThietBi'>;

export function ManualDeviceScreen({ navigation }: Props) {
  const [maThietBi, setMaThietBi] = useState('');
  const [loiMa, setLoiMa] = useState<string>();
  const [loiChung, setLoiChung] = useState<string>();
  const [dangTim, setDangTim] = useState(false);
  const dangTimRef = useRef(false);

  async function xuLyTimThietBi() {
    const maDaTrim = maThietBi.trim();
    if (!maDaTrim) {
      setLoiMa('Vui lòng nhập mã thiết bị.');
      return;
    }
    if (dangTimRef.current) return;
    dangTimRef.current = true;
    setLoiMa(undefined);
    setLoiChung(undefined);
    setDangTim(true);
    try {
      const thietBi = await timThietBiTheoMa(maDaTrim);
      navigation.replace('ChiTietThietBi', { thietBi });
    } catch (loi) {
      setLoiChung(layThongBaoAnToan(loi));
    } finally {
      dangTimRef.current = false;
      setDangTim(false);
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
            Nhập chính xác mã được in trên nhãn thiết bị để tra cứu.
          </Text>
          <OThongTin
            nhan="Mã thiết bị"
            giaTri={maThietBi}
            onChangeText={giaTri => {
              setMaThietBi(giaTri);
              setLoiMa(undefined);
              setLoiChung(undefined);
            }}
            loi={loiMa}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Ví dụ: CNC-0001"
            returnKeyType="search"
            onSubmitEditing={() => xuLyTimThietBi()}
          />
          {loiChung ? <Text style={styles.loi}>{loiChung}</Text> : null}
          <NutChinh
            nhan="Tìm thiết bị"
            bieuTuong={Search}
            onPress={() => xuLyTimThietBi()}
            dangTai={dangTim}
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
  moTa: { color: mauSac.chuPhu, fontSize: 15, lineHeight: 22 },
  loi: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    padding: 12,
    borderRadius: boGoc.nho,
    fontSize: 13,
    lineHeight: 19,
  },
});
