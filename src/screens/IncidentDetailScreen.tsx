import React, { useCallback, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Check, Circle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layChiTietSuCo } from '../services/suCoService';
import type { HoSoSuaChua, SuCo, TrangThaiSuCo } from '../types';
import {
  dinhDangNgayGio,
  layNhanTrangThaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietSuCo'>;

const CAC_BUOC: { trangThai: TrangThaiSuCo; nhan: string }[] = [
  { trangThai: 'MOI', nhan: 'Đã gửi' },
  { trangThai: 'DA_PHAN_CONG', nhan: 'Đã phân công' },
  { trangThai: 'DANG_XU_LY', nhan: 'Đang xử lý' },
  { trangThai: 'DA_XU_LY', nhan: 'Hoàn thành' },
];

function layHoSoCuoi(suCo: SuCo): HoSoSuaChua | undefined {
  if (Array.isArray(suCo.hoSoSuaChua)) return suCo.hoSoSuaChua.at(-1);
  return suCo.hoSoSuaChua ?? undefined;
}

export function IncidentDetailScreen({ route }: Props) {
  const [suCo, setSuCo] = useState<SuCo>();
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string>();

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
  const hoSoCuoi = layHoSoCuoi(suCo);

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
            <View style={styles.danhSachAnh}>
              {suCo.hinhAnh.map((duongDan, chiSo) =>
                /^https?:\/\//.test(duongDan) ? (
                  <Image
                    key={`${duongDan}-${chiSo}`}
                    source={{ uri: duongDan }}
                    style={styles.anh}
                  />
                ) : (
                  <View
                    key={`${duongDan}-${chiSo}`}
                    style={styles.anhKhongXemDuoc}
                  >
                    <Text style={styles.anhKhongXemDuocChu}>
                      Ảnh {chiSo + 1}
                    </Text>
                  </View>
                ),
              )}
            </View>
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
                  : 'Chưa có thông tin'
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
  danhSachAnh: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  anh: { width: 94, height: 94, borderRadius: boGoc.nho },
  anhKhongXemDuoc: {
    width: 94,
    height: 94,
    borderRadius: boGoc.nho,
    backgroundColor: mauSac.beMatPhu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anhKhongXemDuocChu: { color: mauSac.chuPhu, fontSize: 12 },
  hoanThanh: { borderColor: '#A7D7C5' },
  tieuDeHoanThanh: { color: mauSac.thanhCong, fontSize: 16, fontWeight: '800' },
});
