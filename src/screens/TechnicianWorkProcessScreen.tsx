import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { CheckCircle2, Clock, Save } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoChonAnh } from '../components/BoChonAnh';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan, LoiApi } from '../services/apiClient';
import {
  capNhatHoSoSuaChua,
  chuyenChoLinhKien,
  layChiTietCongViec,
  layHoSoSuaChua,
} from '../services/congViecService';
import type { AnhDaChon, SuCo } from '../types';
import { dinhDangNgayGio, layViTriThietBi } from '../utils/dinhDang';
import { layHoSoSuaChuaCuoi } from '../utils/nghiepVuCongViec';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'XuLyCongViec'>;

export function TechnicianWorkProcessScreen({ navigation, route }: Props) {
  const [congViec, setCongViec] = useState<SuCo>();
  const [ghiChu, setGhiChu] = useState('');
  const [danhSachAnh, setDanhSachAnh] = useState<AnhDaChon[]>([]);
  const [lyDoChoLinhKien, setLyDoChoLinhKien] = useState('');
  const [ghiChuChoLinhKien, setGhiChuChoLinhKien] = useState('');
  const [dangMoChoLinhKien, setDangMoChoLinhKien] = useState(false);
  const [loiAnh, setLoiAnh] = useState<string>();
  const [loiLyDo, setLoiLyDo] = useState<string>();
  const [loiGhiChu, setLoiGhiChu] = useState<string>();
  const [loi, setLoi] = useState<string>();
  const [thongBao, setThongBao] = useState<string>();
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const dangLuuRef = useRef(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      const chiTiet = await layChiTietCongViec(route.params.congViecId);
      setCongViec(chiTiet);
      try {
        const ketQuaHoSo = await layHoSoSuaChua(route.params.congViecId);
        setGhiChu(ketQuaHoSo.danhSach.at(-1)?.ghiChu ?? '');
      } catch (loiHoSo) {
        if (!(loiHoSo instanceof LoiApi) || loiHoSo.maTrangThai !== 404) {
          throw loiHoSo;
        }
      }
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.congViecId]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  async function xuLyLuuTienDo() {
    const ghiChuDaTrim = ghiChu.trim();
    if (!ghiChuDaTrim && !danhSachAnh.length) {
      setLoiGhiChu('Vui lòng nhập ghi chú hoặc chọn ít nhất một ảnh.');
      return;
    }
    if (dangLuuRef.current) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoi(undefined);
    setThongBao(undefined);
    try {
      await capNhatHoSoSuaChua(
        route.params.congViecId,
        ghiChuDaTrim ? { ghiChu: ghiChuDaTrim } : {},
        danhSachAnh,
      );
      setDanhSachAnh([]);
      setThongBao('Đã lưu cập nhật tiến độ.');
    } catch (loiLuu) {
      setLoi(layThongBaoAnToan(loiLuu));
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  }

  async function xuLyChoLinhKien() {
    const lyDo = lyDoChoLinhKien.trim();
    if (!lyDo) {
      setLoiLyDo('Vui lòng nhập lý do chờ linh kiện.');
      return;
    }
    if (dangLuuRef.current) return;
    dangLuuRef.current = true;
    setDangLuu(true);
    setLoi(undefined);
    try {
      const congViecMoi = await chuyenChoLinhKien(
        route.params.congViecId,
        lyDo,
        ghiChuChoLinhKien.trim() || undefined,
      );
      setCongViec(congViecMoi);
      setDangMoChoLinhKien(false);
    } catch (loiCho) {
      setLoi(layThongBaoAnToan(loiCho));
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  }

  if (dangTai && !congViec) {
    return <TrangThaiDuLieu loai="dangTai" moTa="Đang tải hồ sơ xử lý..." />;
  }
  if (loi && !congViec) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loi} onThuLai={() => taiDuLieu()} />
    );
  }
  if (!congViec) return null;

  const hoSoTrongChiTiet = layHoSoSuaChuaCuoi(congViec);

  return (
    <SafeAreaView edges={['bottom']} style={styles.anToan}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.noiDung}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={dangTai}
              onRefresh={() => taiDuLieu()}
              tintColor={mauSac.chinh}
            />
          }
        >
          <View style={styles.dauCongViec}>
            <View style={styles.hangDau}>
              <Text style={styles.maCongViec}>{congViec.maSuCo}</Text>
              <HuyHieu loai="suCo" giaTri={congViec.trangThai} />
            </View>
            <Text style={styles.tieuDe}>{congViec.tieuDe}</Text>
          </View>

          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Thiết bị đang xử lý</Text>
            <DongThongTin
              nhan="Thiết bị"
              noiDung={
                congViec.thietBi
                  ? `${congViec.thietBi.tenThietBi} · ${congViec.thietBi.maThietBi}`
                  : undefined
              }
            />
            <DongThongTin
              nhan="Vị trí"
              noiDung={layViTriThietBi(congViec.thietBi)}
            />
            <DongThongTin
              nhan="Bắt đầu lúc"
              noiDung={dinhDangNgayGio(hoSoTrongChiTiet?.thoiGianBatDau)}
            />
          </View>

          {congViec.trangThai !== 'DANG_XU_LY' ? (
            <View style={styles.canhBao}>
              <Text style={styles.canhBaoChu}>
                {congViec.trangThai === 'CHO_LINH_KIEN'
                  ? `Đang chờ linh kiện: ${
                      congViec.lyDoChoLinhKien ?? 'Chưa cập nhật lý do'
                    }`
                  : 'Trạng thái công việc đã thay đổi. Hãy quay lại chi tiết để tải thông tin mới nhất.'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Cập nhật tiến độ</Text>
                <Text style={styles.moTa}>
                  Ghi bộ phận đã kiểm tra, hiện tượng phát hiện hoặc việc đã
                  thực hiện.
                </Text>
                <OThongTin
                  nhan="Ghi chú tiến độ"
                  giaTri={ghiChu}
                  onChangeText={giaTri => {
                    setGhiChu(giaTri);
                    setLoiGhiChu(undefined);
                    setThongBao(undefined);
                  }}
                  loi={loiGhiChu}
                  multiline
                  placeholder="Nhập ghi chú tiến độ..."
                />
                <BoChonAnh
                  nhan="Ảnh quá trình"
                  danhSachAnh={danhSachAnh}
                  onChange={setDanhSachAnh}
                  onLoi={setLoiAnh}
                />
                {loiAnh ? <Text style={styles.loiTruong}>{loiAnh}</Text> : null}
                {thongBao ? (
                  <Text style={styles.thongBaoThanhCong}>{thongBao}</Text>
                ) : null}
                {loi ? <Text style={styles.loi}>{loi}</Text> : null}
                <NutChinh
                  nhan="Lưu tiến độ"
                  bieuTuong={Save}
                  kieu="phu"
                  dangTai={dangLuu}
                  onPress={() => xuLyLuuTienDo()}
                />
              </View>

              {dangMoChoLinhKien ? (
                <View style={styles.khuVuc}>
                  <Text style={styles.tieuDeKhuVuc}>Chờ linh kiện</Text>
                  <OThongTin
                    nhan="Lý do *"
                    giaTri={lyDoChoLinhKien}
                    onChangeText={giaTri => {
                      setLyDoChoLinhKien(giaTri);
                      setLoiLyDo(undefined);
                    }}
                    loi={loiLyDo}
                    multiline
                    placeholder="Ví dụ: Thiếu vòng bi 6205..."
                  />
                  <OThongTin
                    nhan="Ghi chú"
                    giaTri={ghiChuChoLinhKien}
                    onChangeText={setGhiChuChoLinhKien}
                    multiline
                    placeholder="Ghi chú thêm..."
                  />
                  <NutChinh
                    nhan="Xác nhận chờ linh kiện"
                    bieuTuong={Clock}
                    kieu="phu"
                    dangTai={dangLuu}
                    onPress={() => xuLyChoLinhKien()}
                  />
                </View>
              ) : (
                <NutChinh
                  nhan="Chờ linh kiện"
                  bieuTuong={Clock}
                  kieu="phu"
                  onPress={() => setDangMoChoLinhKien(true)}
                />
              )}

              <NutChinh
                nhan="Hoàn thành sửa chữa"
                bieuTuong={CheckCircle2}
                onPress={() =>
                  navigation.navigate('HoanThanhSuaChua', {
                    congViecId: congViec.id,
                  })
                }
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  flex: { flex: 1 },
  noiDung: { padding: 20, paddingBottom: 36, gap: 18 },
  dauCongViec: { gap: 8 },
  hangDau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  maCongViec: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
  },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 10,
  },
  tieuDeKhuVuc: { color: mauSac.chuChinh, fontSize: 16, fontWeight: '800' },
  moTa: { color: mauSac.chuPhu, fontSize: 13, lineHeight: 19 },
  thongBaoThanhCong: {
    color: mauSac.thanhCong,
    backgroundColor: mauSac.thanhCongNhat,
    borderRadius: boGoc.nho,
    padding: 11,
    fontSize: 13,
  },
  loi: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    borderRadius: boGoc.nho,
    padding: 11,
    fontSize: 13,
    lineHeight: 19,
  },
  loiTruong: { color: mauSac.loi, fontSize: 13, lineHeight: 18 },
  canhBao: {
    backgroundColor: mauSac.canhBaoNhat,
    borderRadius: boGoc.vua,
    padding: 14,
  },
  canhBaoChu: { color: mauSac.canhBao, fontSize: 14, lineHeight: 21 },
});
