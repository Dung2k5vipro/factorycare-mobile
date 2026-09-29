import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoChonAnh } from '../components/BoChonAnh';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { ThuVienAnh } from '../components/ThuVienAnh';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import {
  layBanNhapSuaChua,
  luuBanNhapSuaChua,
  xoaBanNhapSuaChua,
} from '../services/banNhapSuaChuaService';
import { layThongBaoAnToan, LoiApi } from '../services/apiClient';
import {
  hoanThanhCongViec,
  layChiTietCongViec,
  layHoSoSuaChua,
} from '../services/congViecService';
import type {
  AnhDaChon,
  HoSoSuaChua,
  KetQuaSuaChua,
  LinhKienThayThe,
  SuCo,
} from '../types';
import {
  coLoiHoanThanh,
  kiemTraHoanThanhSuaChua,
  type LoiHoanThanh,
} from '../utils/nghiepVuCongViec';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'HoanThanhSuaChua'>;

const CAC_KET_QUA: { giaTri: KetQuaSuaChua; nhan: string; moTa: string }[] = [
  {
    giaTri: 'DA_SUA_XONG',
    nhan: 'Hoạt động bình thường',
    moTa: 'Thiết bị đã được sửa xong và vận hành ổn định.',
  },
  {
    giaTri: 'SUA_MOT_PHAN',
    nhan: 'Cần theo dõi',
    moTa: 'Thiết bị có thể vận hành nhưng cần tiếp tục theo dõi.',
  },
  {
    giaTri: 'KHONG_SUA_DUOC',
    nhan: 'Không thể vận hành',
    moTa: 'Thiết bị chưa thể tiếp tục vận hành.',
  },
];

const LINH_KIEN_TRONG: LinhKienThayThe = {
  tenLinhKien: '',
  soLuong: 1,
  donVi: 'cái',
  ghiChu: '',
};

export function CompleteRepairScreen({ navigation, route }: Props) {
  const [congViec, setCongViec] = useState<SuCo>();
  const [nguyenNhan, setNguyenNhan] = useState('');
  const [cachXuLy, setCachXuLy] = useState('');
  const [ketQua, setKetQua] = useState<KetQuaSuaChua>();
  const [ghiChu, setGhiChu] = useState('');
  const [linhKienThayThe, setLinhKienThayThe] = useState<LinhKienThayThe[]>([]);
  const [danhSachAnh, setDanhSachAnh] = useState<AnhDaChon[]>([]);
  const [anhDaLuu, setAnhDaLuu] = useState<string[]>([]);
  const [loiAnh, setLoiAnh] = useState<string>();
  const [loiTruong, setLoiTruong] = useState<LoiHoanThanh>({});
  const [loiChung, setLoiChung] = useState<string>();
  const [dangTai, setDangTai] = useState(true);
  const [dangGui, setDangGui] = useState(false);
  const [daKhoiTaoBanNhap, setDaKhoiTaoBanNhap] = useState(false);
  const dangGuiRef = useRef(false);

  const khoiTao = useCallback(async () => {
    setDangTai(true);
    setLoiChung(undefined);
    try {
      const chiTiet = await layChiTietCongViec(route.params.congViecId);
      setCongViec(chiTiet);

      let hoSo: HoSoSuaChua | undefined;
      try {
        const ketQuaHoSo = await layHoSoSuaChua(route.params.congViecId);
        hoSo = ketQuaHoSo.danhSach.at(-1);
      } catch (loiHoSo) {
        if (!(loiHoSo instanceof LoiApi) || loiHoSo.maTrangThai !== 404) {
          throw loiHoSo;
        }
      }

      const banNhap = await layBanNhapSuaChua(route.params.congViecId);
      setNguyenNhan(banNhap?.nguyenNhan ?? hoSo?.nguyenNhan ?? '');
      setCachXuLy(banNhap?.cachXuLy ?? hoSo?.cachXuLy ?? '');
      setKetQua(banNhap?.ketQua ?? hoSo?.ketQua ?? undefined);
      setGhiChu(banNhap?.ghiChu ?? hoSo?.ghiChu ?? '');
      setLinhKienThayThe(
        banNhap?.linhKienThayThe ?? hoSo?.linhKienThayThe ?? [],
      );
      setDanhSachAnh(banNhap?.danhSachAnh ?? []);
      setAnhDaLuu(hoSo?.hinhAnhSuaChua ?? []);
      setDaKhoiTaoBanNhap(true);
    } catch (loiTai) {
      setLoiChung(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.congViecId]);

  useEffect(() => {
    khoiTao();
  }, [khoiTao]);

  useEffect(() => {
    if (!daKhoiTaoBanNhap || dangGui) return;
    const boDem = setTimeout(() => {
      luuBanNhapSuaChua(route.params.congViecId, {
        nguyenNhan,
        cachXuLy,
        ketQua,
        ghiChu,
        linhKienThayThe,
        danhSachAnh,
      }).catch(() => undefined);
    }, 350);
    return () => clearTimeout(boDem);
  }, [
    cachXuLy,
    danhSachAnh,
    daKhoiTaoBanNhap,
    dangGui,
    ghiChu,
    ketQua,
    linhKienThayThe,
    nguyenNhan,
    route.params.congViecId,
  ]);

  function capNhatLinhKien(
    chiSo: number,
    truong: keyof LinhKienThayThe,
    giaTri: string | number,
  ) {
    setLinhKienThayThe(danhSachHienTai =>
      danhSachHienTai.map((linhKien, viTri) =>
        viTri === chiSo ? { ...linhKien, [truong]: giaTri } : linhKien,
      ),
    );
    setLoiTruong(loiHienTai => ({
      ...loiHienTai,
      linhKienThayThe: {
        ...loiHienTai.linhKienThayThe,
        [chiSo]: '',
      },
    }));
  }

  async function xuLyHoanThanh() {
    const danhSachLinhKien = linhKienThayThe.map(linhKien => ({
      ...linhKien,
      tenLinhKien: linhKien.tenLinhKien.trim(),
      donVi: linhKien.donVi?.trim() || 'cái',
      ghiChu: linhKien.ghiChu?.trim() || null,
    }));
    const loiMoi = kiemTraHoanThanhSuaChua({
      nguyenNhan,
      cachXuLy,
      ketQua,
      linhKienThayThe: danhSachLinhKien,
    });
    setLoiTruong(loiMoi);
    setLoiChung(undefined);
    if (coLoiHoanThanh(loiMoi) || !congViec || dangGuiRef.current) return;

    dangGuiRef.current = true;
    setDangGui(true);
    try {
      const duLieuHoanThanh = {
        nguyenNhan: nguyenNhan.trim(),
        cachXuLy: cachXuLy.trim(),
        ketQua: ketQua!,
        ghiChu: ghiChu.trim(),
        linhKienThayThe: danhSachLinhKien,
      };
      await hoanThanhCongViec(congViec.id, duLieuHoanThanh, danhSachAnh);
      try {
        await xoaBanNhapSuaChua(congViec.id);
      } catch {
        // Không yêu cầu gửi lại kết quả chỉ vì không xóa được bản nháp cục bộ.
      }
      let congViecDaHoanThanh = congViec;
      try {
        congViecDaHoanThanh = await layChiTietCongViec(congViec.id);
      } catch {
        // Kết quả đã được lưu; dùng dữ liệu hiện có nếu lần tải lại bị gián đoạn.
      }
      navigation.replace('KetQuaCongViec', {
        congViec: congViecDaHoanThanh,
        duLieuHoanThanh,
      });
    } catch (loiGui) {
      setLoiChung(layThongBaoAnToan(loiGui));
    } finally {
      dangGuiRef.current = false;
      setDangGui(false);
    }
  }

  if (dangTai) {
    return <TrangThaiDuLieu loai="dangTai" moTa="Đang chuẩn bị biểu mẫu..." />;
  }
  if (!congViec) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loiChung} onThuLai={() => khoiTao()} />
    );
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
          <View style={styles.dauTrang}>
            <Text style={styles.maCongViec}>{congViec.maSuCo}</Text>
            <Text style={styles.tieuDe}>Xác nhận hoàn thành sửa chữa</Text>
            <Text style={styles.moTaDauTrang}>
              {congViec.thietBi?.tenThietBi} · {congViec.thietBi?.maThietBi}
            </Text>
          </View>

          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Kết luận kỹ thuật</Text>
            <OThongTin
              nhan="Nguyên nhân"
              giaTri={nguyenNhan}
              onChangeText={giaTri => {
                setNguyenNhan(giaTri);
                setLoiTruong(loiHienTai => ({
                  ...loiHienTai,
                  nguyenNhan: undefined,
                }));
              }}
              loi={loiTruong.nguyenNhan}
              multiline
              placeholder="Mô tả nguyên nhân sự cố..."
            />
            <OThongTin
              nhan="Phương án xử lý"
              giaTri={cachXuLy}
              onChangeText={giaTri => {
                setCachXuLy(giaTri);
                setLoiTruong(loiHienTai => ({
                  ...loiHienTai,
                  cachXuLy: undefined,
                }));
              }}
              loi={loiTruong.cachXuLy}
              multiline
              placeholder="Mô tả công việc đã thực hiện..."
            />
          </View>

          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>
              Tình trạng thiết bị sau xử lý
            </Text>
            <View style={styles.danhSachLuaChon}>
              {CAC_KET_QUA.map(luaChon => {
                const dangChon = ketQua === luaChon.giaTri;
                return (
                  <Pressable
                    key={luaChon.giaTri}
                    onPress={() => {
                      setKetQua(luaChon.giaTri);
                      setLoiTruong(loiHienTai => ({
                        ...loiHienTai,
                        ketQua: undefined,
                      }));
                    }}
                    style={[styles.luaChon, dangChon && styles.luaChonDangChon]}
                  >
                    <View
                      style={[
                        styles.nutTron,
                        dangChon && styles.nutTronDangChon,
                      ]}
                    >
                      {dangChon ? <View style={styles.chamTron} /> : null}
                    </View>
                    <View style={styles.noiDungLuaChon}>
                      <Text style={styles.nhanLuaChon}>{luaChon.nhan}</Text>
                      <Text style={styles.moTaLuaChon}>{luaChon.moTa}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {loiTruong.ketQua ? (
              <Text style={styles.loiTruong}>{loiTruong.ketQua}</Text>
            ) : null}
            <OThongTin
              nhan="Kết quả chạy thử / Ghi chú"
              giaTri={ghiChu}
              onChangeText={setGhiChu}
              multiline
              placeholder="Ví dụ: Máy đã chạy thử ổn định..."
            />
          </View>

          <View style={styles.khuVuc}>
            <View style={styles.dauKhuVuc}>
              <Text style={styles.tieuDeKhuVuc}>Linh kiện đã sử dụng</Text>
              <Pressable
                onPress={() =>
                  setLinhKienThayThe(danhSach => [
                    ...danhSach,
                    { ...LINH_KIEN_TRONG },
                  ])
                }
                style={styles.themLinhKien}
              >
                <Plus color={mauSac.chinh} size={18} />
                <Text style={styles.themLinhKienChu}>Thêm linh kiện</Text>
              </Pressable>
            </View>
            {linhKienThayThe.length === 0 ? (
              <Text style={styles.moTaTrong}>
                Bỏ qua phần này nếu không thay linh kiện.
              </Text>
            ) : null}
            {linhKienThayThe.map((linhKien, chiSo) => (
              <View key={chiSo} style={styles.dongLinhKien}>
                <View style={styles.dauLinhKien}>
                  <Text style={styles.soThuTu}>Linh kiện {chiSo + 1}</Text>
                  <Pressable
                    accessibilityLabel={`Xóa linh kiện ${chiSo + 1}`}
                    onPress={() =>
                      setLinhKienThayThe(danhSach =>
                        danhSach.filter((_, viTri) => viTri !== chiSo),
                      )
                    }
                    hitSlop={8}
                  >
                    <Trash2 color={mauSac.loi} size={20} />
                  </Pressable>
                </View>
                <OThongTin
                  nhan="Tên/Mã linh kiện"
                  giaTri={linhKien.tenLinhKien}
                  onChangeText={giaTri =>
                    capNhatLinhKien(chiSo, 'tenLinhKien', giaTri)
                  }
                  placeholder="Ví dụ: Vòng bi 6205"
                />
                <View style={styles.hangNhapNgan}>
                  <View style={styles.oNhapNgan}>
                    <OThongTin
                      nhan="Số lượng"
                      giaTri={String(linhKien.soLuong)}
                      onChangeText={giaTri =>
                        capNhatLinhKien(
                          chiSo,
                          'soLuong',
                          Number.parseInt(giaTri, 10) || 0,
                        )
                      }
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.oNhapNgan}>
                    <OThongTin
                      nhan="Đơn vị"
                      giaTri={linhKien.donVi ?? ''}
                      onChangeText={giaTri =>
                        capNhatLinhKien(chiSo, 'donVi', giaTri)
                      }
                      placeholder="cái"
                    />
                  </View>
                </View>
                {loiTruong.linhKienThayThe?.[chiSo] ? (
                  <Text style={styles.loiTruong}>
                    {loiTruong.linhKienThayThe[chiSo]}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Ảnh sau sửa chữa</Text>
            {anhDaLuu.length ? (
              <>
                <Text style={styles.moTaTrong}>Ảnh quá trình đã lưu</Text>
                <ThuVienAnh danhSachDuongDan={anhDaLuu} />
              </>
            ) : null}
            <BoChonAnh
              nhan="Thêm ảnh sau sửa chữa"
              danhSachAnh={danhSachAnh}
              onChange={setDanhSachAnh}
              onLoi={setLoiAnh}
            />
            {loiAnh ? <Text style={styles.loiTruong}>{loiAnh}</Text> : null}
          </View>

          <Text style={styles.ghiChuBanNhap}>
            Nội dung đang nhập được lưu tạm trên thiết bị này.
          </Text>
          {loiChung ? <Text style={styles.loiChung}>{loiChung}</Text> : null}
          <NutChinh
            nhan="Xác nhận hoàn thành"
            dangTai={dangGui}
            onPress={() => xuLyHoanThanh()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  flex: { flex: 1 },
  noiDung: { padding: 20, paddingBottom: 40, gap: 18 },
  dauTrang: { gap: 5 },
  maCongViec: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
  },
  moTaDauTrang: { color: mauSac.chuPhu, fontSize: 14 },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 16,
  },
  dauKhuVuc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tieuDeKhuVuc: {
    flex: 1,
    color: mauSac.chuChinh,
    fontSize: 16,
    fontWeight: '800',
  },
  danhSachLuaChon: { gap: 10 },
  luaChon: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.vua,
    padding: 12,
  },
  luaChonDangChon: {
    borderColor: mauSac.chinh,
    backgroundColor: mauSac.chinhNhat,
  },
  nutTron: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: mauSac.vien,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutTronDangChon: { borderColor: mauSac.chinh },
  chamTron: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: mauSac.chinh,
  },
  noiDungLuaChon: { flex: 1, gap: 3 },
  nhanLuaChon: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '700' },
  moTaLuaChon: { color: mauSac.chuPhu, fontSize: 12, lineHeight: 17 },
  themLinhKien: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  themLinhKienChu: { color: mauSac.chinh, fontSize: 13, fontWeight: '700' },
  moTaTrong: { color: mauSac.chuPhu, fontSize: 13 },
  dongLinhKien: {
    gap: 12,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mauSac.vien,
  },
  dauLinhKien: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soThuTu: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '700' },
  hangNhapNgan: { flexDirection: 'row', gap: 10 },
  oNhapNgan: { flex: 1 },
  loiTruong: { color: mauSac.loi, fontSize: 13, lineHeight: 18 },
  ghiChuBanNhap: { color: mauSac.chuPhu, fontSize: 12, textAlign: 'center' },
  loiChung: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    borderRadius: boGoc.nho,
    padding: 12,
    fontSize: 13,
    lineHeight: 19,
  },
});
