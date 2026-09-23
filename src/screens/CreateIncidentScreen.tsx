import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoChonAnh } from '../components/BoChonAnh';
import { DongThongTin } from '../components/DongThongTin';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan, LoiApi } from '../services/apiClient';
import { taoSuCo } from '../services/suCoService';
import type { AnhDaChon, MucDoSuCo } from '../types';
import { layMauMucDo, layNhanMucDo, layViTriThietBi } from '../utils/dinhDang';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'BaoSuCo'>;

const CAC_MUC_DO: { giaTri: MucDoSuCo; moTa: string }[] = [
  { giaTri: 'THAP', moTa: 'Ảnh hưởng nhỏ.' },
  { giaTri: 'TRUNG_BINH', moTa: 'Ảnh hưởng tới vận hành.' },
  { giaTri: 'CAO', moTa: 'Ảnh hưởng lớn tới thiết bị hoặc sản xuất.' },
  { giaTri: 'NGHIEM_TRONG', moTa: 'Nguy cơ dừng dây chuyền hoặc mất an toàn.' },
];

export function CreateIncidentScreen({ navigation, route }: Props) {
  const { thietBi } = route.params;
  const { nguoiDung } = useAuth();
  const [tieuDe, setTieuDe] = useState('');
  const [mucDo, setMucDo] = useState<MucDoSuCo>();
  const [moTa, setMoTa] = useState('');
  const [danhSachAnh, setDanhSachAnh] = useState<AnhDaChon[]>([]);
  const [loiTruong, setLoiTruong] = useState<Record<string, string>>({});
  const [loiChung, setLoiChung] = useState<string>();
  const [dangGui, setDangGui] = useState(false);
  const dangGuiRef = useRef(false);

  async function xuLyGuiBaoCao() {
    const tieuDeDaTrim = tieuDe.trim();
    const moTaDaTrim = moTa.trim();
    const loiMoi: Record<string, string> = {};
    if (!tieuDeDaTrim)
      loiMoi.tieuDe = 'Vui lòng nhập loại lỗi hoặc tiêu đề sự cố.';
    if (!mucDo) loiMoi.mucDo = 'Vui lòng chọn mức độ sự cố.';
    if (!moTaDaTrim) loiMoi.moTa = 'Vui lòng mô tả hiện tượng thiết bị.';
    if (moTaDaTrim.length > 1000)
      loiMoi.moTa = 'Mô tả không được vượt quá 1.000 ký tự.';
    setLoiTruong(loiMoi);
    setLoiChung(undefined);
    if (Object.keys(loiMoi).length || !mucDo || dangGuiRef.current) return;

    if (danhSachAnh.length) {
      setLoiChung(
        'Máy chủ chưa hỗ trợ tải ảnh sự cố. Vui lòng xóa ảnh để gửi báo cáo, ảnh đã chọn vẫn được giữ để bạn thao tác lại.',
      );
      return;
    }

    dangGuiRef.current = true;
    setDangGui(true);
    try {
      const suCo = await taoSuCo({
        thietBiId: thietBi.id,
        tieuDe: tieuDeDaTrim,
        moTa: moTaDaTrim,
        mucDo,
        thoiGianXayRa: new Date().toISOString(),
        hinhAnh: [],
      });
      navigation.replace('BaoSuCoThanhCong', { suCo });
    } catch (loi) {
      if (loi instanceof LoiApi && loi.loiTruong) {
        setLoiTruong(hienTai => ({ ...hienTai, ...loi.loiTruong }));
      }
      setLoiChung(layThongBaoAnToan(loi));
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
          <View style={styles.thongTinCoDinh}>
            <Text style={styles.tieuDeKhuVuc}>Thông tin báo cáo</Text>
            <DongThongTin
              nhan="Thiết bị"
              noiDung={`${thietBi.tenThietBi} · ${thietBi.maThietBi}`}
            />
            <DongThongTin nhan="Vị trí" noiDung={layViTriThietBi(thietBi)} />
            <DongThongTin nhan="Người báo" noiDung={nguoiDung?.hoTen} />
          </View>

          <OThongTin
            nhan="Loại lỗi / Tiêu đề sự cố"
            giaTri={tieuDe}
            onChangeText={giaTri => {
              setTieuDe(giaTri);
              setLoiTruong(hienTai => ({ ...hienTai, tieuDe: '' }));
            }}
            loi={loiTruong.tieuDe}
            placeholder="Ví dụ: Máy phát ra tiếng động lạ"
            maxLength={150}
          />

          <View style={styles.khoiMucDo}>
            <Text style={styles.nhanTruong}>Mức độ sự cố</Text>
            {CAC_MUC_DO.map(luaChon => {
              const dangChon = mucDo === luaChon.giaTri;
              const mau = layMauMucDo(luaChon.giaTri);
              return (
                <Pressable
                  key={luaChon.giaTri}
                  onPress={() => {
                    setMucDo(luaChon.giaTri);
                    setLoiTruong(hienTai => ({ ...hienTai, mucDo: '' }));
                  }}
                  style={[
                    styles.luaChonMucDo,
                    dangChon && {
                      borderColor: mau.chu,
                      backgroundColor: mau.nen,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dauTron,
                      dangChon && { borderColor: mau.chu },
                    ]}
                  >
                    {dangChon ? (
                      <View
                        style={[styles.tamTron, { backgroundColor: mau.chu }]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.noiDungMucDo}>
                    <Text
                      style={[styles.tenMucDo, dangChon && { color: mau.chu }]}
                    >
                      {layNhanMucDo(luaChon.giaTri)}
                    </Text>
                    <Text style={styles.moTaMucDo}>{luaChon.moTa}</Text>
                  </View>
                </Pressable>
              );
            })}
            {loiTruong.mucDo ? (
              <Text style={styles.loiTruong}>{loiTruong.mucDo}</Text>
            ) : null}
            {mucDo === 'NGHIEM_TRONG' ? (
              <Text style={styles.canhBaoKhanCap}>
                Sự cố khẩn cấp sẽ được ưu tiên xử lý.
              </Text>
            ) : null}
          </View>

          <View style={styles.khoiMoTa}>
            <OThongTin
              nhan="Mô tả hiện tượng"
              giaTri={moTa}
              onChangeText={giaTri => {
                setMoTa(giaTri);
                setLoiTruong(hienTai => ({ ...hienTai, moTa: '' }));
              }}
              loi={loiTruong.moTa}
              placeholder="Mô tả hiện tượng thiết bị..."
              multiline
              maxLength={1000}
            />
            <Text style={styles.demKyTu}>{moTa.length}/1000</Text>
          </View>

          <BoChonAnh
            danhSachAnh={danhSachAnh}
            onChange={setDanhSachAnh}
            onLoi={setLoiChung}
          />

          {loiChung ? <Text style={styles.loiChung}>{loiChung}</Text> : null}
          <NutChinh
            nhan="Gửi báo cáo sự cố"
            bieuTuong={Send}
            dangTai={dangGui}
            onPress={() => xuLyGuiBaoCao()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  flex: { flex: 1 },
  noiDung: { padding: 20, paddingBottom: 36, gap: 20 },
  thongTinCoDinh: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tieuDeKhuVuc: {
    color: mauSac.chuChinh,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  khoiMucDo: { gap: 9 },
  nhanTruong: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '600' },
  luaChonMucDo: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.vua,
    backgroundColor: mauSac.beMat,
  },
  dauTron: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: mauSac.vien,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tamTron: { width: 11, height: 11, borderRadius: 6 },
  noiDungMucDo: { flex: 1, gap: 3 },
  tenMucDo: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '700' },
  moTaMucDo: { color: mauSac.chuPhu, fontSize: 12, lineHeight: 17 },
  loiTruong: { color: mauSac.loi, fontSize: 13 },
  canhBaoKhanCap: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    padding: 11,
    borderRadius: boGoc.nho,
    fontSize: 13,
  },
  khoiMoTa: { gap: 4 },
  demKyTu: { alignSelf: 'flex-end', color: mauSac.chuPhu, fontSize: 12 },
  loiChung: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    padding: 12,
    borderRadius: boGoc.nho,
    fontSize: 13,
    lineHeight: 19,
  },
});
