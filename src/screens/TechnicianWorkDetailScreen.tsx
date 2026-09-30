import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, Hand, MapPin, Play, Wrench } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { ThuVienAnh } from '../components/ThuVienAnh';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import {
  batDauXuLyCongViec,
  layChiTietCongViec,
  nhanCongViecKhanCap,
  tiepTucXuLyCongViec,
} from '../services/congViecService';
import type { SuCo } from '../types';
import {
  dinhDangNgay,
  dinhDangNgayGio,
  layTenLoaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';
import { layHoSoSuaChuaCuoi } from '../utils/nghiepVuCongViec';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietCongViec'>;

export function TechnicianWorkDetailScreen({ navigation, route }: Props) {
  const [congViec, setCongViec] = useState<SuCo>();
  const [dangTai, setDangTai] = useState(true);
  const [dangBatDau, setDangBatDau] = useState(false);
  const [dangNhan, setDangNhan] = useState(false);
  const [loi, setLoi] = useState<string>();
  const [loiThaoTac, setLoiThaoTac] = useState<string>();
  const dangBatDauRef = useRef(false);
  const dangNhanRef = useRef(false);

  async function xuLyNhanCongViec() {
    if (!congViec || dangNhanRef.current) return;
    dangNhanRef.current = true;
    setDangNhan(true);
    setLoiThaoTac(undefined);
    try {
      setCongViec(await nhanCongViecKhanCap(congViec.id));
    } catch (loiNhan) {
      setLoiThaoTac(layThongBaoAnToan(loiNhan));
      await taiDuLieu();
    } finally {
      dangNhanRef.current = false;
      setDangNhan(false);
    }
  }

  async function xuLyTiepTuc() {
    if (!congViec || dangBatDauRef.current) return;
    dangBatDauRef.current = true;
    setDangBatDau(true);
    setLoiThaoTac(undefined);
    try {
      await tiepTucXuLyCongViec(congViec.id);
      navigation.replace('XuLyCongViec', { congViecId: congViec.id });
    } catch (loiTiepTuc) {
      setLoiThaoTac(layThongBaoAnToan(loiTiepTuc));
    } finally {
      dangBatDauRef.current = false;
      setDangBatDau(false);
    }
  }

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      setCongViec(await layChiTietCongViec(route.params.congViecId));
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

  async function xuLyBatDau() {
    if (!congViec || dangBatDauRef.current) return;
    dangBatDauRef.current = true;
    setDangBatDau(true);
    setLoiThaoTac(undefined);
    try {
      await batDauXuLyCongViec(congViec.id);
      navigation.replace('XuLyCongViec', { congViecId: congViec.id });
    } catch (loiBatDau) {
      setLoiThaoTac(layThongBaoAnToan(loiBatDau));
    } finally {
      dangBatDauRef.current = false;
      setDangBatDau(false);
    }
  }

  if (dangTai && !congViec) {
    return (
      <TrangThaiDuLieu loai="dangTai" moTa="Đang tải chi tiết công việc..." />
    );
  }
  if (loi || !congViec) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loi} onThuLai={() => taiDuLieu()} />
    );
  }

  const thietBi = congViec.thietBi;
  const hoSoCuoi = layHoSoSuaChuaCuoi(congViec);
  const conBaoHanh = Boolean(
    thietBi?.ngayHetBaoHanh &&
      new Date(thietBi.ngayHetBaoHanh).getTime() >= Date.now(),
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.anToan}>
      <ScrollView
        contentContainerStyle={styles.noiDung}
        refreshControl={
          <RefreshControl
            refreshing={dangTai}
            onRefresh={() => taiDuLieu()}
            tintColor={mauSac.chinh}
          />
        }
      >
        <View style={styles.dauCongViec}>
          <Text style={styles.maCongViec}>{congViec.maSuCo}</Text>
          <Text style={styles.tieuDe}>{congViec.tieuDe}</Text>
          <View style={styles.huyHieu}>
            <HuyHieu loai="mucDo" giaTri={congViec.mucDo} />
            <HuyHieu loai="suCo" giaTri={congViec.trangThai} />
          </View>
        </View>

        {thietBi ? (
          <Pressable
            onPress={() => navigation.navigate('ChiTietThietBi', { thietBi })}
            style={({ pressed }) => [styles.khuVuc, pressed && styles.dangNhan]}
          >
            <View style={styles.tieuDeHang}>
              <Wrench color={mauSac.chinh} size={20} />
              <Text style={styles.tieuDeKhuVuc}>Thông tin thiết bị</Text>
              <ChevronRight color={mauSac.chuPhu} size={20} />
            </View>
            <DongThongTin
              nhan="Thiết bị"
              noiDung={`${thietBi.tenThietBi} · ${thietBi.maThietBi}`}
            />
            <DongThongTin nhan="Loại" noiDung={layTenLoaiThietBi(thietBi)} />
            <DongThongTin nhan="Model" noiDung={thietBi.model} />
            <DongThongTin nhan="Serial" noiDung={thietBi.soSerial} />
          </Pressable>
        ) : null}

        {conBaoHanh ? (
          <View style={styles.baoHanh}>
            <Text style={styles.baoHanhChu}>
              Thiết bị còn bảo hành đến {dinhDangNgay(thietBi?.ngayHetBaoHanh)}.
            </Text>
          </View>
        ) : null}

        <View style={styles.khuVuc}>
          <View style={styles.tieuDeHangTrai}>
            <MapPin color={mauSac.chinh} size={20} />
            <Text style={styles.tieuDeKhuVuc}>Vị trí</Text>
          </View>
          {congViec.viTriLucBao ? (
            <DongThongTin
              nhan="Vị trí lúc báo"
              noiDung={congViec.viTriLucBao}
            />
          ) : null}
          <DongThongTin
            nhan="Vị trí hiện tại"
            noiDung={layViTriThietBi(thietBi)}
          />
        </View>

        <View style={styles.khuVuc}>
          <Text style={styles.tieuDeKhuVuc}>Thông tin sự cố</Text>
          <DongThongTin nhan="Mô tả" noiDung={congViec.moTa} />
          <DongThongTin
            nhan="Thời gian báo"
            noiDung={dinhDangNgayGio(congViec.thoiGianBao ?? congViec.ngayTao)}
          />
          <DongThongTin nhan="Người báo" noiDung={congViec.nguoiBao?.hoTen} />
          {congViec.thoiGianPhanCong ? (
            <DongThongTin
              nhan="Thời gian phân công"
              noiDung={dinhDangNgayGio(congViec.thoiGianPhanCong)}
            />
          ) : null}
        </View>

        {congViec.hinhAnh?.length ? (
          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Ảnh hiện trạng</Text>
            <ThuVienAnh danhSachDuongDan={congViec.hinhAnh} />
          </View>
        ) : null}

        {congViec.trangThai === 'CHO_LINH_KIEN' ? (
          <View style={styles.baoHanh}>
            <Text style={styles.tieuDeKhuVuc}>Chờ linh kiện</Text>
            <DongThongTin nhan="Lý do" noiDung={congViec.lyDoChoLinhKien} />
            <DongThongTin nhan="Ghi chú" noiDung={congViec.ghiChuChoLinhKien} />
          </View>
        ) : null}

        {congViec.trangThai === 'CHO_XAC_NHAN' ||
        congViec.trangThai === 'DA_XU_LY' ? (
          <View style={[styles.khuVuc, styles.ketQua]}>
            <Text style={styles.tieuDeKetQua}>Kết quả sửa chữa</Text>
            {congViec.trangThai === 'CHO_XAC_NHAN' ? (
              <View style={styles.baoHanh}>
                <Text style={styles.baoHanhChu}>
                  Đang chờ nhân viên vận hành kiểm tra và xác nhận máy hoạt động.
                </Text>
              </View>
            ) : null}
            <DongThongTin nhan="Nguyên nhân" noiDung={hoSoCuoi?.nguyenNhan} />
            <DongThongTin nhan="Phương án xử lý" noiDung={hoSoCuoi?.cachXuLy} />
            <DongThongTin nhan="Ghi chú kết quả" noiDung={hoSoCuoi?.ghiChu} />
            <DongThongTin
              nhan="Linh kiện đã thay"
              noiDung={hoSoCuoi?.linhKienThayThe
                ?.map(linhKien =>
                  `${linhKien.tenLinhKien} × ${linhKien.soLuong}`,
                )
                .join('\n')}
            />
            {hoSoCuoi?.hinhAnhSuaChua?.length ? (
              <ThuVienAnh danhSachDuongDan={hoSoCuoi.hinhAnhSuaChua} />
            ) : null}
            <DongThongTin
              nhan="Hoàn thành lúc"
              noiDung={dinhDangNgayGio(
                congViec.thoiGianHoanThanh ?? hoSoCuoi?.thoiGianHoanThanh,
              )}
            />
          </View>
        ) : null}

        {loiThaoTac ? (
          <Text style={styles.loiThaoTac}>{loiThaoTac}</Text>
        ) : null}

        {congViec.coTheNhanKhanCap && congViec.trangThai === 'MOI' ? (
          <NutChinh
            nhan="Nhận công việc"
            bieuTuong={Hand}
            dangTai={dangNhan}
            onPress={() => xuLyNhanCongViec()}
          />
        ) : congViec.trangThai === 'DA_PHAN_CONG' ? (
          <NutChinh
            nhan="Bắt đầu xử lý"
            bieuTuong={Play}
            dangTai={dangBatDau}
            onPress={() => xuLyBatDau()}
          />
        ) : congViec.trangThai === 'DANG_XU_LY' ? (
          <NutChinh
            nhan="Tiếp tục xử lý"
            bieuTuong={Wrench}
            onPress={() =>
              navigation.navigate('XuLyCongViec', {
                congViecId: congViec.id,
              })
            }
          />
        ) : congViec.trangThai === 'CHO_LINH_KIEN' ? (
          <NutChinh
            nhan="Tiếp tục xử lý"
            bieuTuong={Play}
            dangTai={dangBatDau}
            onPress={() => xuLyTiepTuc()}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 36, gap: 18 },
  dauCongViec: { gap: 8 },
  maCongViec: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
  },
  huyHieu: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 8,
  },
  dangNhan: { opacity: 0.78 },
  baoHanh: {
    backgroundColor: mauSac.thongTinNhat,
    borderRadius: boGoc.vua,
    padding: 13,
  },
  baoHanhChu: { color: mauSac.thongTin, fontSize: 13, lineHeight: 19 },
  tieuDeHang: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tieuDeHangTrai: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tieuDeKhuVuc: {
    flex: 1,
    color: mauSac.chuChinh,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  ketQua: { borderColor: '#A7D7C5' },
  tieuDeKetQua: { color: mauSac.thanhCong, fontSize: 16, fontWeight: '800' },
  loiThaoTac: {
    color: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
    borderRadius: boGoc.nho,
    padding: 12,
    fontSize: 13,
    lineHeight: 19,
  },
});
