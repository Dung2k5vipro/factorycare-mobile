import React, { useCallback, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Check, CheckCircle2, Circle } from 'lucide-react-native';
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
  layChiTietSuCo,
  xacNhanHoatDongSuCo,
} from '../services/suCoService';
import type { SuCo, TrangThaiSuCo } from '../types';
import {
  dinhDangNgayGio,
  layNhanTrangThaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';
import { layHoSoSuaChuaCuoi } from '../utils/nghiepVuCongViec';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietSuCo'>;

const CAC_BUOC: { trangThai: TrangThaiSuCo; nhan: string }[] = [
  { trangThai: 'MOI', nhan: 'Đã gửi' },
  { trangThai: 'DA_PHAN_CONG', nhan: 'Đã phân công' },
  { trangThai: 'DANG_XU_LY', nhan: 'Đang xử lý' },
  { trangThai: 'CHO_LINH_KIEN', nhan: 'Chờ linh kiện' },
  { trangThai: 'CHO_XAC_NHAN', nhan: 'Chờ xác nhận' },
  { trangThai: 'DA_XU_LY', nhan: 'Hoàn thành' },
];

export function IncidentDetailScreen({ route }: Props) {
  const [suCo, setSuCo] = useState<SuCo>();
  const [dangTai, setDangTai] = useState(true);
  const [dangXacNhan, setDangXacNhan] = useState(false);
  const [loi, setLoi] = useState<string>();
  const [loiXacNhan, setLoiXacNhan] = useState<string>();
  const dangXacNhanRef = useRef(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      setSuCo(await layChiTietSuCo(route.params.suCoId));
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.suCoId]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  async function xuLyXacNhanHoatDong() {
    if (!suCo || dangXacNhanRef.current) return;
    dangXacNhanRef.current = true;
    setDangXacNhan(true);
    setLoiXacNhan(undefined);
    try {
      const suCoMoi = await xacNhanHoatDongSuCo(suCo.id);
      setSuCo(suCoMoi);
    } catch (loiGui) {
      setLoiXacNhan(layThongBaoAnToan(loiGui));
    } finally {
      dangXacNhanRef.current = false;
      setDangXacNhan(false);
    }
  }

  if (dangTai && !suCo) {
    return <TrangThaiDuLieu loai="dangTai" moTa="Đang tải chi tiết sự cố..." />;
  }
  if (loi || !suCo) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loi} onThuLai={() => taiDuLieu()} />
    );
  }

  const viTriHienTai = CAC_BUOC.findIndex(
    buoc => buoc.trangThai === suCo.trangThai,
  );
  const hoSoCuoi = suCo.ketQuaSuaChua ?? layHoSoSuaChuaCuoi(suCo);

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
        <View style={styles.dauSuCo}>
          <Text style={styles.maSuCo}>{suCo.maSuCo}</Text>
          <Text style={styles.tieuDe}>{suCo.tieuDe}</Text>
          <View style={styles.huyHieu}>
            <HuyHieu loai="mucDo" giaTri={suCo.mucDo} />
            <HuyHieu loai="suCo" giaTri={suCo.trangThai} />
          </View>
        </View>

        <View style={styles.khuVuc}>
          <Text style={styles.tieuDeKhuVuc}>Thông tin sự cố</Text>
          <DongThongTin
            nhan="Thiết bị"
            noiDung={
              suCo.thietBi
                ? `${suCo.thietBi.tenThietBi} · ${suCo.thietBi.maThietBi}`
                : undefined
            }
          />
          <DongThongTin
            nhan="Ngày báo"
            noiDung={dinhDangNgayGio(suCo.thoiGianBao ?? suCo.ngayTao)}
          />
          <DongThongTin
            nhan="Vị trí lúc báo"
            noiDung={suCo.viTriLucBao || layViTriThietBi(suCo.thietBi)}
          />
          <DongThongTin nhan="Mô tả" noiDung={suCo.moTa} />
        </View>

        <View style={styles.khuVuc}>
          <Text style={styles.tieuDeKhuVuc}>Tiến độ xử lý</Text>
          {suCo.trangThai === 'DA_HUY' ? (
            <View style={styles.daHuy}>
              <Text style={styles.daHuyChu}>Sự cố đã hủy</Text>
            </View>
          ) : (
            <View>
              {CAC_BUOC.map((buoc, chiSo) => {
                const daDat = viTriHienTai >= chiSo;
                return (
                  <View key={buoc.trangThai} style={styles.buoc}>
                    <View style={styles.cotMoc}>
                      <View style={[styles.moc, daDat && styles.mocDaDat]}>
                        {daDat ? (
                          <Check
                            color={mauSac.trang}
                            size={14}
                            strokeWidth={3}
                          />
                        ) : (
                          <Circle color={mauSac.vien} size={14} />
                        )}
                      </View>
                      {chiSo < CAC_BUOC.length - 1 ? (
                        <View
                          style={[
                            styles.duong,
                            daDat && chiSo < viTriHienTai && styles.duongDaDat,
                          ]}
                        />
                      ) : null}
                    </View>
                    <View style={styles.noiDungBuoc}>
                      <Text
                        style={[styles.nhanBuoc, !daDat && styles.nhanBuocMo]}
                      >
                        {buoc.nhan}
                      </Text>
                      {suCo.trangThai === buoc.trangThai ? (
                        <Text style={styles.hienTai}>Trạng thái hiện tại</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {suCo.hinhAnh?.length ? (
          <View style={styles.khuVuc}>
            <Text style={styles.tieuDeKhuVuc}>Ảnh sự cố</Text>
            <ThuVienAnh danhSachDuongDan={suCo.hinhAnh} />
          </View>
        ) : null}

        {suCo.trangThai === 'CHO_XAC_NHAN' ? (
          <View style={[styles.khuVuc, styles.choXacNhan]}>
            <View style={styles.tieuDeHangTrai}>
              <CheckCircle2 color={mauSac.chinh} size={22} />
              <Text style={styles.tieuDeChoXacNhan}>
                Kỹ thuật viên đã sửa xong
              </Text>
            </View>
            <Text style={styles.moTaChoXacNhan}>
              Vui lòng kiểm tra thực tế máy và bấm nút xác nhận dưới đây để hoàn tất quy trình sửa và chuyển thiết bị về trạng thái đang hoạt động.
            </Text>
            <DongThongTin
              nhan="Nguyên nhân"
              noiDung={hoSoCuoi?.nguyenNhan}
            />
            <DongThongTin
              nhan="Cách xử lý"
              noiDung={hoSoCuoi?.cachXuLy}
            />
            <DongThongTin
              nhan="Ghi chú kết quả"
              noiDung={hoSoCuoi?.ghiChu || hoSoCuoi?.ketQua}
            />
            {hoSoCuoi?.linhKienThayThe?.length ? (
              <DongThongTin
                nhan="Linh kiện đã thay"
                noiDung={hoSoCuoi.linhKienThayThe
                  .map(
                    lk =>
                      `${lk.tenLinhKien} × ${lk.soLuong} ${lk.donVi ?? ''}`.trim(),
                  )
                  .join('\n')}
              />
            ) : null}
            {hoSoCuoi?.hinhAnhSuaChua?.length ? (
              <View style={styles.khuVucAnh}>
                <Text style={styles.nhanAnh}>Ảnh sửa chữa:</Text>
                <ThuVienAnh danhSachDuongDan={hoSoCuoi.hinhAnhSuaChua} />
              </View>
            ) : null}
            {loiXacNhan ? (
              <Text style={styles.loiXacNhan}>{loiXacNhan}</Text>
            ) : null}
            <NutChinh
              nhan="Xác nhận máy đã hoạt động"
              bieuTuong={CheckCircle2}
              dangTai={dangXacNhan}
              onPress={() => xuLyXacNhanHoatDong()}
            />
          </View>
        ) : null}

        {suCo.trangThai === 'DA_XU_LY' ? (
          <View style={[styles.khuVuc, styles.hoanThanh]}>
            <Text style={styles.tieuDeHoanThanh}>Sự cố đã hoàn thành</Text>
            <DongThongTin
              nhan="Thời gian hoàn thành"
              noiDung={dinhDangNgayGio(
                suCo.thoiGianHoanThanh ?? hoSoCuoi?.thoiGianHoanThanh,
              )}
            />
            <DongThongTin
              nhan="Kết quả xử lý"
              noiDung={hoSoCuoi?.ghiChu || hoSoCuoi?.ketQua}
            />
            <DongThongTin
              nhan="Trạng thái thiết bị hiện tại"
              noiDung={
                suCo.thietBi?.trangThai
                  ? layNhanTrangThaiThietBi(suCo.thietBi.trangThai)
                  : 'Đang hoạt động'
              }
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 36, gap: 18 },
  dauSuCo: { gap: 8 },
  maSuCo: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
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
  tieuDeKhuVuc: {
    color: mauSac.chuChinh,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  tieuDeHangTrai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  choXacNhan: {
    borderColor: mauSac.chinh,
    backgroundColor: '#F4FBF7',
    gap: 12,
  },
  tieuDeChoXacNhan: {
    color: mauSac.chinh,
    fontSize: 17,
    fontWeight: '800',
  },
  moTaChoXacNhan: {
    color: mauSac.chuChinh,
    fontSize: 14,
    lineHeight: 20,
  },
  khuVucAnh: {
    gap: 6,
    marginTop: 4,
  },
  nhanAnh: {
    color: mauSac.chuPhu,
    fontSize: 13,
    fontWeight: '600',
  },
  loiXacNhan: {
    color: mauSac.loi,
    fontSize: 13,
  },
  daHuy: {
    backgroundColor: mauSac.beMatPhu,
    borderRadius: boGoc.nho,
    padding: 12,
  },
  daHuyChu: { color: mauSac.chuPhu, fontSize: 14, fontWeight: '700' },
  buoc: { flexDirection: 'row', minHeight: 62 },
  cotMoc: { width: 30, alignItems: 'center' },
  moc: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: mauSac.vien,
    backgroundColor: mauSac.beMat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mocDaDat: { backgroundColor: mauSac.chinh, borderColor: mauSac.chinh },
  duong: { width: 2, flex: 1, backgroundColor: mauSac.vien },
  duongDaDat: { backgroundColor: mauSac.chinh },
  noiDungBuoc: { flex: 1, paddingLeft: 10, paddingTop: 3 },
  nhanBuoc: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '700' },
  nhanBuocMo: { color: mauSac.chuPhu, fontWeight: '500' },
  hienTai: { color: mauSac.chinh, fontSize: 12, marginTop: 3 },
  hoanThanh: { borderColor: '#A7D7C5' },
  tieuDeHoanThanh: { color: mauSac.thanhCong, fontSize: 16, fontWeight: '800' },
});

