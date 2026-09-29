import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Bell, CheckCheck } from 'lucide-react-native';
import { useFocusEffect, type NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabNhanVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import {
  danhDauTatCaThongBaoDaDoc,
  danhDauThongBaoDaDoc,
  layDanhSachThongBao,
} from '../services/thongBaoService';
import type { ThongBao } from '../types';
import { dinhDangNgayGio } from '../utils/dinhDang';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'ThongBao'>;

function KhoangCachDanhSach() {
  return <View style={styles.khoangTrong} />;
}

export function NotificationsScreen({ navigation }: Props) {
  const { nguoiDung } = useAuth();
  const [danhSach, setDanhSach] = useState<ThongBao[]>([]);
  const [tongChuaDoc, setTongChuaDoc] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);
  const [dangDanhDau, setDangDanhDau] = useState(false);
  const [loi, setLoi] = useState<string>();
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  const xuLyTaiDuLieu = useCallback(async (laLamMoi = false) => {
    laLamMoi ? setDangLamMoi(true) : setDangTai(true);
    setLoi(undefined);
    try {
      const ketQua = await layDanhSachThongBao();
      setDanhSach(ketQua.danhSach);
      setTongChuaDoc(ketQua.tongChuaDoc);
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
      setDangLamMoi(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      xuLyTaiDuLieu();
    }, [xuLyTaiDuLieu]),
  );

  const xuLyMoThongBao = async (thongBao: ThongBao) => {
    if (!thongBao.daDoc) {
      setDanhSach(danhSachHienTai =>
        danhSachHienTai.map(item =>
          item.id === thongBao.id ? { ...item, daDoc: true } : item,
        ),
      );
      setTongChuaDoc(soLuong => Math.max(0, soLuong - 1));
      try {
        await danhDauThongBaoDaDoc(thongBao.id);
      } catch {
        xuLyTaiDuLieu();
      }
    }

    if (
      ['SU_CO', 'PHAN_CONG'].includes(thongBao.loaiThongBao) &&
      thongBao.doiTuongLienQuanId
    ) {
      if (nguoiDung?.vaiTro === 'KY_THUAT_VIEN') {
        dieuHuongGoc?.navigate('ChiTietCongViec', {
          congViecId: thongBao.doiTuongLienQuanId,
        });
      } else {
        dieuHuongGoc?.navigate('ChiTietSuCo', {
          suCoId: thongBao.doiTuongLienQuanId,
        });
      }
    } else if (
      thongBao.loaiThongBao === 'BAO_TRI' &&
      thongBao.doiTuongLienQuanId &&
      nguoiDung?.vaiTro === 'KY_THUAT_VIEN'
    ) {
      dieuHuongGoc?.navigate('ChiTietBaoTri', {
        phieuBaoTriId: thongBao.doiTuongLienQuanId,
      });
    }
  };

  const xuLyDanhDauTatCa = async () => {
    if (!tongChuaDoc || dangDanhDau) return;
    setDangDanhDau(true);
    setLoi(undefined);
    try {
      await danhDauTatCaThongBaoDaDoc();
      setDanhSach(danhSachHienTai =>
        danhSachHienTai.map(item => ({ ...item, daDoc: true })),
      );
      setTongChuaDoc(0);
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangDanhDau(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <FlatList
        data={danhSach}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.noiDung}
        ItemSeparatorComponent={KhoangCachDanhSach}
        refreshControl={
          <RefreshControl
            refreshing={dangLamMoi}
            onRefresh={() => xuLyTaiDuLieu(true)}
            tintColor={mauSac.chinh}
          />
        }
        ListHeaderComponent={
          <View style={styles.dauDanhSach}>
            <TieuDeManHinh
              tieuDe="Thông báo"
              moTa={
                tongChuaDoc
                  ? `${tongChuaDoc} thông báo chưa đọc.`
                  : 'Các cập nhật liên quan đến công việc của bạn.'
              }
            />
            {tongChuaDoc ? (
              <Pressable
                accessibilityRole="button"
                disabled={dangDanhDau}
                onPress={xuLyDanhDauTatCa}
                style={styles.danhDauTatCa}
              >
                <CheckCheck color={mauSac.chinh} size={18} />
                <Text style={styles.nhanDanhDau}>
                  {dangDanhDau ? 'Đang cập nhật...' : 'Đánh dấu tất cả đã đọc'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          dangTai ? (
            <TrangThaiDuLieu loai="dangTai" />
          ) : loi ? (
            <TrangThaiDuLieu
              loai="loi"
              moTa={loi}
              onThuLai={() => xuLyTaiDuLieu()}
            />
          ) : (
            <TrangThaiDuLieu
              loai="trong"
              tieuDe="Chưa có thông báo"
              moTa="Thông báo mới sẽ xuất hiện tại đây."
            />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => xuLyMoThongBao(item)}
            style={({ pressed }) => [
              styles.the,
              !item.daDoc && styles.theChuaDoc,
              pressed && styles.dangNhan,
            ]}
          >
            <View style={[styles.bieuTuong, !item.daDoc && styles.bieuTuongMoi]}>
              <Bell
                color={item.daDoc ? mauSac.chuPhu : mauSac.loi}
                size={20}
              />
            </View>
            <View style={styles.noiDungThe}>
              <View style={styles.hangTieuDe}>
                <Text numberOfLines={2} style={styles.tieuDeThongBao}>
                  {item.tieuDe}
                </Text>
                {!item.daDoc ? <View style={styles.chamMoi} /> : null}
              </View>
              <Text style={styles.moTaThongBao}>{item.noiDung}</Text>
              <Text style={styles.thoiGian}>{dinhDangNgayGio(item.ngayTao)}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  dauDanhSach: { gap: 12, marginBottom: 16 },
  danhDauTatCa: {
    minHeight: 40,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: boGoc.tron,
    backgroundColor: mauSac.chinhNhat,
  },
  nhanDanhDau: { color: mauSac.chinh, fontSize: 13, fontWeight: '700' },
  the: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    backgroundColor: mauSac.beMat,
  },
  theChuaDoc: { borderColor: mauSac.loi, backgroundColor: mauSac.loiNhat },
  dangNhan: { opacity: 0.75 },
  bieuTuong: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mauSac.beMatPhu,
  },
  bieuTuongMoi: { backgroundColor: mauSac.beMat },
  noiDungThe: { flex: 1, gap: 5 },
  hangTieuDe: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tieuDeThongBao: {
    flex: 1,
    color: mauSac.chuChinh,
    fontSize: 15,
    fontWeight: '700',
  },
  chamMoi: { width: 8, height: 8, borderRadius: 4, backgroundColor: mauSac.loi },
  moTaThongBao: { color: mauSac.chuChinh, fontSize: 13, lineHeight: 19 },
  thoiGian: { color: mauSac.chuPhu, fontSize: 12 },
  khoangTrong: { height: 10 },
});
