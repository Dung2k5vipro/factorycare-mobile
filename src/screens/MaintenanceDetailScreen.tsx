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
import { ClipboardCheck, Play } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import {
  batDauPhieuBaoTri,
  layChiTietPhieuBaoTri,
} from '../services/baoTriService';
import type { PhieuBaoTri } from '../types';
import {
  dinhDangNgay,
  dinhDangNgayGio,
  layNhanTrangThaiHangMucBaoTri,
  layNhanTrangThaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';
import { layDanhSachHangMucBaoTri } from '../utils/nghiepVuBaoTri';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietBaoTri'>;

export function MaintenanceDetailScreen({ navigation, route }: Props) {
  const [phieuBaoTri, setPhieuBaoTri] = useState<PhieuBaoTri>();
  const [dangTai, setDangTai] = useState(true);
  const [dangBatDau, setDangBatDau] = useState(false);
  const [loi, setLoi] = useState<string>();
  const [loiThaoTac, setLoiThaoTac] = useState<string>();
  const dangBatDauRef = useRef(false);

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      setPhieuBaoTri(await layChiTietPhieuBaoTri(route.params.phieuBaoTriId));
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.phieuBaoTriId]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  async function xuLyBatDauBaoTri() {
    if (!phieuBaoTri || dangBatDauRef.current) return;
    dangBatDauRef.current = true;
    setDangBatDau(true);
    setLoiThaoTac(undefined);
    try {
      await batDauPhieuBaoTri(phieuBaoTri.id);
      navigation.replace('ThucHienBaoTri', {
        phieuBaoTriId: phieuBaoTri.id,
      });
    } catch (loiBatDau) {
      setLoiThaoTac(layThongBaoAnToan(loiBatDau));
    } finally {
      dangBatDauRef.current = false;
      setDangBatDau(false);
    }
  }

  if (dangTai && !phieuBaoTri) {
    return (
      <TrangThaiDuLieu loai="dangTai" moTa="Đang tải chi tiết bảo trì..." />
    );
  }
  if (loi || !phieuBaoTri) {
    return (
      <TrangThaiDuLieu loai="loi" moTa={loi} onThuLai={() => taiDuLieu()} />
    );
  }

  const danhSachHangMuc = layDanhSachHangMucBaoTri(phieuBaoTri);
  const noiDungBaoTri =
    phieuBaoTri.moTa ?? phieuBaoTri.keHoachBaoTri?.moTa ?? undefined;

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
        <View style={styles.dauPhieu}>
          <Text style={styles.maPhieu}>
            {phieuBaoTri.maPhieu || `Phiếu bảo trì #${phieuBaoTri.id}`}
          </Text>
          <Text style={styles.tieuDe}>
            {phieuBaoTri.thietBi?.tenThietBi ?? 'Bảo trì thiết bị'}
          </Text>
          <HuyHieu loai="baoTri" giaTri={phieuBaoTri.trangThai} />
        </View>

        <View style={styles.khuVuc}>
          <Text style={styles.tieuDeKhuVuc}>Thông tin phiếu</Text>
          <DongThongTin
            nhan="Thiết bị"
            noiDung={
              phieuBaoTri.thietBi
                ? `${phieuBaoTri.thietBi.tenThietBi} · ${phieuBaoTri.thietBi.maThietBi}`
                : undefined
            }
          />
          <DongThongTin
            nhan="Vị trí"
            noiDung={layViTriThietBi(phieuBaoTri.thietBi)}
          />
          <DongThongTin
            nhan="Ngày dự kiến"
            noiDung={dinhDangNgay(phieuBaoTri.ngayDuKien)}
          />
          <DongThongTin nhan="Nội dung bảo trì" noiDung={noiDungBaoTri} />
          {phieuBaoTri.thoiGianBatDau ? (
            <DongThongTin
              nhan="Bắt đầu lúc"
              noiDung={dinhDangNgayGio(phieuBaoTri.thoiGianBatDau)}
            />
          ) : null}
        </View>

        <View style={styles.khuVuc}>
          <View style={styles.tieuDeChecklist}>
            <Text style={styles.tieuDeKhuVuc}>Checklist</Text>
            <Text style={styles.soHangMuc}>
              {danhSachHangMuc.length} hạng mục
            </Text>
          </View>
          {danhSachHangMuc.length ? (
            danhSachHangMuc.map((hangMuc, chiSo) => (
              <View key={`${hangMuc.noiDung}-${chiSo}`} style={styles.hangMuc}>
                <Text style={styles.soThuTu}>{chiSo + 1}</Text>
                <View style={styles.noiDungHangMuc}>
                  <Text style={styles.tenHangMuc}>{hangMuc.noiDung}</Text>
                  {phieuBaoTri.trangThai === 'HOAN_THANH' ? (
                    <Text style={styles.ketQuaHangMuc}>
                      {layNhanTrangThaiHangMucBaoTri(hangMuc.trangThai)}
                    </Text>
                  ) : hangMuc.batBuoc !== false ? (
                    <Text style={styles.batBuoc}>Bắt buộc</Text>
                  ) : null}
                  {hangMuc.ghiChu ? (
                    <Text style={styles.ghiChuHangMuc}>{hangMuc.ghiChu}</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.moTaTrong}>
              Phiếu này chưa có danh sách hạng mục bảo trì.
            </Text>
          )}
        </View>

        {phieuBaoTri.trangThai === 'HOAN_THANH' ? (
          <View style={[styles.khuVuc, styles.ketQua]}>
            <Text style={styles.tieuDeKetQua}>Kết quả bảo trì</Text>
            <DongThongTin
              nhan="Nội dung đã thực hiện"
              noiDung={phieuBaoTri.ketQuaBaoTri}
            />
            <DongThongTin nhan="Ghi chú" noiDung={phieuBaoTri.ghiChu} />
            <DongThongTin
              nhan="Tình trạng thiết bị"
              noiDung={layNhanTrangThaiThietBi(
                phieuBaoTri.trangThaiThietBi ?? phieuBaoTri.thietBi?.trangThai,
              )}
            />
            <DongThongTin
              nhan="Linh kiện đã thay"
              noiDung={
                phieuBaoTri.linhKienThayThe?.length
                  ? phieuBaoTri.linhKienThayThe
                      .map(linhKien => `${linhKien.ten} × ${linhKien.soLuong}`)
                      .join('\n')
                  : 'Không thay linh kiện'
              }
            />
            <DongThongTin
              nhan="Hoàn thành lúc"
              noiDung={dinhDangNgayGio(phieuBaoTri.thoiGianHoanThanh)}
            />
          </View>
        ) : null}

        {loiThaoTac ? (
          <Text style={styles.loiThaoTac}>{loiThaoTac}</Text>
        ) : null}

        {['CHO_THUC_HIEN', 'QUA_HAN'].includes(phieuBaoTri.trangThai) ? (
          <NutChinh
            nhan="Bắt đầu bảo trì"
            bieuTuong={Play}
            dangTai={dangBatDau}
            biVoHieu={danhSachHangMuc.length === 0}
            onPress={() => xuLyBatDauBaoTri()}
          />
        ) : phieuBaoTri.trangThai === 'DANG_THUC_HIEN' ? (
          <NutChinh
            nhan="Tiếp tục bảo trì"
            bieuTuong={ClipboardCheck}
            onPress={() =>
              navigation.navigate('ThucHienBaoTri', {
                phieuBaoTriId: phieuBaoTri.id,
              })
            }
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 36, gap: 18 },
  dauPhieu: { gap: 8 },
  maPhieu: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '800',
  },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 8,
  },
  tieuDeKhuVuc: { color: mauSac.chuChinh, fontSize: 16, fontWeight: '800' },
  tieuDeChecklist: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  soHangMuc: { color: mauSac.chuPhu, fontSize: 12, fontWeight: '600' },
  hangMuc: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mauSac.vien,
  },
  soThuTu: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: mauSac.beMatPhu,
    color: mauSac.chuChinh,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  noiDungHangMuc: { flex: 1, gap: 4 },
  tenHangMuc: { color: mauSac.chuChinh, fontSize: 14, lineHeight: 20 },
  batBuoc: { color: mauSac.canhBao, fontSize: 11, fontWeight: '700' },
  ketQuaHangMuc: { color: mauSac.chinh, fontSize: 12, fontWeight: '700' },
  ghiChuHangMuc: { color: mauSac.chuPhu, fontSize: 12, lineHeight: 18 },
  moTaTrong: { color: mauSac.chuPhu, fontSize: 13, lineHeight: 19 },
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
