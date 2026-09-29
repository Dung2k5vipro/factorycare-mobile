import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Plus, Save, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HangMucChecklist } from '../components/HangMucChecklist';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { OThongTin } from '../components/OThongTin';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import {
  hoanThanhPhieuBaoTri,
  layChiTietPhieuBaoTri,
  luuChecklistBaoTri,
  luuKetQuaBaoTri,
} from '../services/baoTriService';
import {
  layBanNhapBaoTri,
  luuBanNhapBaoTri,
  xoaBanNhapBaoTri,
} from '../services/banNhapBaoTriService';
import type {
  HangMucBaoTri,
  LinhKienBaoTri,
  PhieuBaoTri,
  TrangThaiThietBi,
} from '../types';
import {
  coLoiBaoTri,
  kiemTraDuLieuBaoTri,
  layDanhSachHangMucBaoTri,
  type LoiBaoTri,
} from '../utils/nghiepVuBaoTri';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ThucHienBaoTri'>;

const CAC_TINH_TRANG_THIET_BI: {
  giaTri: TrangThaiThietBi;
  nhan: string;
  moTa: string;
}[] = [
  {
    giaTri: 'DANG_HOAT_DONG',
    nhan: 'Bình thường',
    moTa: 'Thiết bị có thể tiếp tục vận hành.',
  },
  {
    giaTri: 'DANG_HONG',
    nhan: 'Có lỗi / Không thể vận hành',
    moTa: 'Thiết bị cần tiếp tục xử lý trước khi vận hành.',
  },
];

const LINH_KIEN_TRONG: LinhKienBaoTri = { ten: '', soLuong: 1 };

function chuanHoaChecklist(danhSachHangMuc: HangMucBaoTri[]) {
  return danhSachHangMuc
    .filter(hangMuc => Boolean(hangMuc.trangThai))
    .map(hangMuc => ({
      noiDung: hangMuc.noiDung.trim(),
      loai: hangMuc.loai ?? 'CHECKLIST',
      trangThai: hangMuc.trangThai,
      ghiChu: hangMuc.ghiChu?.trim() || null,
    }));
}

export function MaintenanceExecutionScreen({ navigation, route }: Props) {
  const [phieuBaoTri, setPhieuBaoTri] = useState<PhieuBaoTri>();
  const [danhSachHangMuc, setDanhSachHangMuc] = useState<HangMucBaoTri[]>([]);
  const [ketQuaBaoTri, setKetQuaBaoTri] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [trangThaiThietBi, setTrangThaiThietBi] = useState<TrangThaiThietBi>();
  const [linhKienThayThe, setLinhKienThayThe] = useState<LinhKienBaoTri[]>([]);
  const [loiTruong, setLoiTruong] = useState<LoiBaoTri>({});
  const [loiChung, setLoiChung] = useState<string>();
  const [thongBao, setThongBao] = useState<string>();
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [dangHoanThanh, setDangHoanThanh] = useState(false);
  const [daKhoiTaoBanNhap, setDaKhoiTaoBanNhap] = useState(false);
  const dangLuuRef = useRef(false);
  const dangHoanThanhRef = useRef(false);

  const khoiTao = useCallback(async () => {
    setDangTai(true);
    setLoiChung(undefined);
    try {
      const chiTiet = await layChiTietPhieuBaoTri(route.params.phieuBaoTriId);
      const danhSachTuMayChu = layDanhSachHangMucBaoTri(chiTiet);
      const banNhap = await layBanNhapBaoTri(route.params.phieuBaoTriId);
      const danhSachDaGop = danhSachTuMayChu.map(hangMuc => {
        const hangMucBanNhap = banNhap?.danhSachHangMuc.find(
          banGhi => banGhi.noiDung === hangMuc.noiDung,
        );
        return hangMucBanNhap ? { ...hangMuc, ...hangMucBanNhap } : hangMuc;
      });

      setPhieuBaoTri(chiTiet);
      setDanhSachHangMuc(danhSachDaGop);
      setKetQuaBaoTri(banNhap?.ketQuaBaoTri ?? chiTiet.ketQuaBaoTri ?? '');
      setGhiChu(banNhap?.ghiChu ?? chiTiet.ghiChu ?? '');
      setTrangThaiThietBi(
        banNhap?.trangThaiThietBi ?? chiTiet.trangThaiThietBi ?? undefined,
      );
      setLinhKienThayThe(
        banNhap?.linhKienThayThe ?? chiTiet.linhKienThayThe ?? [],
      );
      setDaKhoiTaoBanNhap(true);
    } catch (loiTai) {
      setLoiChung(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.phieuBaoTriId]);

  useEffect(() => {
    khoiTao();
  }, [khoiTao]);

  useEffect(() => {
    if (!daKhoiTaoBanNhap || dangHoanThanh) return;
    const boDem = setTimeout(() => {
      luuBanNhapBaoTri(route.params.phieuBaoTriId, {
        danhSachHangMuc,
        ketQuaBaoTri,
        ghiChu,
        trangThaiThietBi,
        linhKienThayThe,
      }).catch(() => undefined);
    }, 350);
    return () => clearTimeout(boDem);
  }, [
    daKhoiTaoBanNhap,
    dangHoanThanh,
    danhSachHangMuc,
    ghiChu,
    ketQuaBaoTri,
    linhKienThayThe,
    route.params.phieuBaoTriId,
    trangThaiThietBi,
  ]);

  function capNhatHangMuc(chiSo: number, hangMucMoi: HangMucBaoTri) {
    setDanhSachHangMuc(danhSachHienTai =>
      danhSachHienTai.map((hangMuc, viTri) =>
        viTri === chiSo ? hangMucMoi : hangMuc,
      ),
    );
    setLoiTruong(loiHienTai => ({
      ...loiHienTai,
      hangMuc: { ...loiHienTai.hangMuc, [chiSo]: '' },
    }));
    setThongBao(undefined);
  }

  function capNhatLinhKien(
    chiSo: number,
    truong: keyof LinhKienBaoTri,
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

  async function xuLyLuuTienDo() {
    const loiHangMuc: Record<number, string> = {};
    const loiLinhKien: Record<number, string> = {};
    danhSachHangMuc.forEach((hangMuc, chiSo) => {
      if (hangMuc.trangThai === 'KHONG_TOT' && !hangMuc.ghiChu?.trim()) {
        loiHangMuc[chiSo] = 'Vui lòng mô tả bất thường phát hiện được.';
      }
    });
    linhKienThayThe.forEach((linhKien, chiSo) => {
      if (!linhKien.ten.trim() || linhKien.soLuong <= 0) {
        loiLinhKien[chiSo] = 'Nhập tên linh kiện và số lượng lớn hơn 0.';
      }
    });
    setLoiTruong(loiHienTai => ({
      ...loiHienTai,
      hangMuc: loiHangMuc,
      linhKienThayThe: loiLinhKien,
    }));
    if (
      Object.keys(loiHangMuc).length ||
      Object.keys(loiLinhKien).length ||
      dangLuuRef.current
    ) {
      return;
    }

    dangLuuRef.current = true;
    setDangLuu(true);
    setLoiChung(undefined);
    setThongBao(undefined);
    try {
      await luuChecklistBaoTri(
        route.params.phieuBaoTriId,
        chuanHoaChecklist(danhSachHangMuc),
      );
      if (ketQuaBaoTri.trim()) {
        await luuKetQuaBaoTri(route.params.phieuBaoTriId, {
          linhKienThayThe: linhKienThayThe.map(linhKien => ({
            ten: linhKien.ten.trim(),
            soLuong: linhKien.soLuong,
          })),
          ketQuaBaoTri: ketQuaBaoTri.trim(),
          ghiChu: ghiChu.trim(),
        });
      }
      setThongBao('Đã lưu tiến độ bảo trì.');
    } catch (loiLuu) {
      setLoiChung(layThongBaoAnToan(loiLuu));
    } finally {
      dangLuuRef.current = false;
      setDangLuu(false);
    }
  }

  async function xuLyHoanThanhBaoTri() {
    const danhSachLinhKien = linhKienThayThe.map(linhKien => ({
      ten: linhKien.ten.trim(),
      soLuong: linhKien.soLuong,
    }));
    const loiMoi = kiemTraDuLieuBaoTri({
      danhSachHangMuc,
      ketQuaBaoTri,
      trangThaiThietBi,
      linhKienThayThe: danhSachLinhKien,
    });
    setLoiTruong(loiMoi);
    setLoiChung(undefined);
    setThongBao(undefined);
    if (
      coLoiBaoTri(loiMoi) ||
      !phieuBaoTri ||
      !trangThaiThietBi ||
      dangHoanThanhRef.current
    ) {
      return;
    }

    dangHoanThanhRef.current = true;
    setDangHoanThanh(true);
    try {
      const duLieuHoanThanh = {
        ketQuaChecklist: chuanHoaChecklist(danhSachHangMuc),
        linhKienThayThe: danhSachLinhKien,
        ketQuaBaoTri: ketQuaBaoTri.trim(),
        ghiChu: ghiChu.trim(),
        trangThaiThietBi,
      };
      await hoanThanhPhieuBaoTri(phieuBaoTri.id, duLieuHoanThanh);
      try {
        await xoaBanNhapBaoTri(phieuBaoTri.id);
      } catch {
        // Không yêu cầu gửi lại kết quả khi chỉ lỗi xóa bản nháp cục bộ.
      }
      let phieuDaHoanThanh = phieuBaoTri;
      try {
        phieuDaHoanThanh = await layChiTietPhieuBaoTri(phieuBaoTri.id);
      } catch {
        phieuDaHoanThanh = {
          ...phieuBaoTri,
          ...duLieuHoanThanh,
          trangThai: 'HOAN_THANH',
        };
      }
      navigation.replace('KetQuaBaoTri', {
        phieuBaoTri: phieuDaHoanThanh,
      });
    } catch (loiHoanThanh) {
      setLoiChung(layThongBaoAnToan(loiHoanThanh));
    } finally {
      dangHoanThanhRef.current = false;
      setDangHoanThanh(false);
    }
  }

  if (dangTai && !phieuBaoTri) {
    return (
      <TrangThaiDuLieu loai="dangTai" moTa="Đang tải checklist bảo trì..." />
    );
  }
  if (!phieuBaoTri) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loiChung} onThuLai={() => khoiTao()} />
    );
  }

  const soHangMucDaLam = danhSachHangMuc.filter(
    hangMuc => hangMuc.trangThai,
  ).length;
  const tyLeHoanThanh = danhSachHangMuc.length
    ? (soHangMucDaLam / danhSachHangMuc.length) * 100
    : 0;

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
              onRefresh={() => khoiTao()}
              tintColor={mauSac.chinh}
            />
          }
        >
          <View style={styles.dauTrang}>
            <View style={styles.hangDau}>
              <Text style={styles.maPhieu}>
                {phieuBaoTri.maPhieu || `Phiếu bảo trì #${phieuBaoTri.id}`}
              </Text>
              <HuyHieu loai="baoTri" giaTri={phieuBaoTri.trangThai} />
            </View>
            <Text style={styles.tieuDe}>
              {phieuBaoTri.thietBi?.tenThietBi ?? 'Thực hiện bảo trì'}
            </Text>
          </View>

          {phieuBaoTri.trangThai !== 'DANG_THUC_HIEN' ? (
            <View style={styles.canhBao}>
              <Text style={styles.canhBaoChu}>
                Trạng thái phiếu đã thay đổi. Vui lòng quay lại chi tiết để tải
                thông tin mới nhất.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.tienDo}>
                <View style={styles.dauTienDo}>
                  <Text style={styles.tieuDeKhuVuc}>Tiến độ checklist</Text>
                  <Text style={styles.soTienDo}>
                    {soHangMucDaLam}/{danhSachHangMuc.length} hạng mục
                  </Text>
                </View>
                <View style={styles.thanhTienDo}>
                  <View
                    style={[
                      styles.giaTriTienDo,
                      { width: `${tyLeHoanThanh}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.danhSachChecklist}>
                {danhSachHangMuc.map((hangMuc, chiSo) => (
                  <HangMucChecklist
                    key={`${hangMuc.noiDung}-${chiSo}`}
                    hangMuc={hangMuc}
                    soThuTu={chiSo + 1}
                    loi={loiTruong.hangMuc?.[chiSo]}
                    onChange={hangMucMoi => capNhatHangMuc(chiSo, hangMucMoi)}
                  />
                ))}
              </View>

              {thongBao ? (
                <Text style={styles.thongBaoThanhCong}>{thongBao}</Text>
              ) : null}
              <NutChinh
                nhan="Lưu tiến độ bảo trì"
                bieuTuong={Save}
                kieu="phu"
                dangTai={dangLuu}
                onPress={() => xuLyLuuTienDo()}
              />

              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Kết quả bảo trì</Text>
                <OThongTin
                  nhan="Nội dung đã thực hiện"
                  giaTri={ketQuaBaoTri}
                  onChangeText={giaTri => {
                    setKetQuaBaoTri(giaTri);
                    setLoiTruong(loiHienTai => ({
                      ...loiHienTai,
                      ketQuaBaoTri: undefined,
                    }));
                  }}
                  loi={loiTruong.ketQuaBaoTri}
                  multiline
                  placeholder="Mô tả nội dung bảo trì đã thực hiện..."
                />
                <OThongTin
                  nhan="Ghi chú / Phát hiện thêm"
                  giaTri={ghiChu}
                  onChangeText={setGhiChu}
                  multiline
                  placeholder="Ghi lại phát hiện hoặc lưu ý cần theo dõi..."
                />
              </View>

              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>
                  Tình trạng thiết bị sau bảo trì
                </Text>
                <View style={styles.danhSachTinhTrang}>
                  {CAC_TINH_TRANG_THIET_BI.map(luaChon => {
                    const dangChon = trangThaiThietBi === luaChon.giaTri;
                    return (
                      <Pressable
                        key={luaChon.giaTri}
                        onPress={() => {
                          setTrangThaiThietBi(luaChon.giaTri);
                          setLoiTruong(loiHienTai => ({
                            ...loiHienTai,
                            trangThaiThietBi: undefined,
                          }));
                        }}
                        style={[
                          styles.luaChonTinhTrang,
                          dangChon && styles.luaChonTinhTrangDangChon,
                        ]}
                      >
                        <View
                          style={[
                            styles.nutTron,
                            dangChon && styles.nutTronDangChon,
                          ]}
                        >
                          {dangChon ? <View style={styles.chamTron} /> : null}
                        </View>
                        <View style={styles.noiDungTinhTrang}>
                          <Text style={styles.nhanTinhTrang}>
                            {luaChon.nhan}
                          </Text>
                          <Text style={styles.moTaTinhTrang}>
                            {luaChon.moTa}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {loiTruong.trangThaiThietBi ? (
                  <Text style={styles.loiTruong}>
                    {loiTruong.trangThaiThietBi}
                  </Text>
                ) : null}
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
                      <Text style={styles.soThuTuLinhKien}>
                        Linh kiện {chiSo + 1}
                      </Text>
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
                      giaTri={linhKien.ten}
                      onChangeText={giaTri =>
                        capNhatLinhKien(chiSo, 'ten', giaTri)
                      }
                      placeholder="Ví dụ: Lọc dầu"
                    />
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
                    {loiTruong.linhKienThayThe?.[chiSo] ? (
                      <Text style={styles.loiTruong}>
                        {loiTruong.linhKienThayThe[chiSo]}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>

              <Text style={styles.ghiChuBanNhap}>
                Dữ liệu đang nhập được lưu tạm trên thiết bị này.
              </Text>
              {loiChung ? (
                <Text style={styles.loiChung}>{loiChung}</Text>
              ) : null}
              <NutChinh
                nhan="Hoàn thành bảo trì"
                bieuTuong={CheckCircle2}
                dangTai={dangHoanThanh}
                onPress={() => xuLyHoanThanhBaoTri()}
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
  noiDung: { padding: 20, paddingBottom: 40, gap: 18 },
  dauTrang: { gap: 7 },
  hangDau: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  maPhieu: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '800',
  },
  canhBao: {
    backgroundColor: mauSac.canhBaoNhat,
    borderRadius: boGoc.vua,
    padding: 14,
  },
  canhBaoChu: { color: mauSac.canhBao, fontSize: 14, lineHeight: 21 },
  tienDo: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 12,
  },
  dauTienDo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  tieuDeKhuVuc: { color: mauSac.chuChinh, fontSize: 16, fontWeight: '800' },
  soTienDo: { color: mauSac.chinh, fontSize: 13, fontWeight: '700' },
  thanhTienDo: {
    height: 7,
    borderRadius: 4,
    backgroundColor: mauSac.beMatPhu,
    overflow: 'hidden',
  },
  giaTriTienDo: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: mauSac.chinh,
  },
  danhSachChecklist: { gap: 12 },
  thongBaoThanhCong: {
    color: mauSac.thanhCong,
    backgroundColor: mauSac.thanhCongNhat,
    borderRadius: boGoc.nho,
    padding: 11,
    fontSize: 13,
  },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 16,
  },
  danhSachTinhTrang: { gap: 10 },
  luaChonTinhTrang: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.vua,
    padding: 12,
  },
  luaChonTinhTrangDangChon: {
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
  noiDungTinhTrang: { flex: 1, gap: 3 },
  nhanTinhTrang: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '700' },
  moTaTinhTrang: { color: mauSac.chuPhu, fontSize: 12, lineHeight: 17 },
  dauKhuVuc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
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
  soThuTuLinhKien: {
    color: mauSac.chuChinh,
    fontSize: 14,
    fontWeight: '700',
  },
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
