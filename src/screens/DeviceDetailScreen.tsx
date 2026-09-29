import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { AlertTriangle, MapPin } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DongThongTin } from '../components/DongThongTin';
import { HuyHieu } from '../components/HuyHieu';
import { NutChinh } from '../components/NutChinh';
import { TheBaoTri } from '../components/TheBaoTri';
import { TheSuCo } from '../components/TheSuCo';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachPhieuBaoTriCuaToi } from '../services/baoTriService';
import { layDanhSachCongViecCuaToi } from '../services/congViecService';
import { layDanhSachSuCoCuaToi } from '../services/suCoService';
import { layChiTietThietBi } from '../services/thietBiService';
import type { PhieuBaoTri, SuCo, ThietBi } from '../types';
import {
  dinhDangNgay,
  layTenLoaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietThietBi'>;

export function DeviceDetailScreen({ navigation, route }: Props) {
  const { nguoiDung } = useAuth();
  const [thietBi, setThietBi] = useState<ThietBi>(route.params.thietBi);
  const [danhSachSuCo, setDanhSachSuCo] = useState<SuCo[]>([]);
  const [danhSachPhieuBaoTri, setDanhSachPhieuBaoTri] = useState<PhieuBaoTri[]>(
    [],
  );
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string>();

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      const [chiTiet, ketQuaSuCo, ketQuaBaoTri] = await Promise.all([
        layChiTietThietBi(route.params.thietBi.id),
        nguoiDung?.vaiTro === 'KY_THUAT_VIEN'
          ? layDanhSachCongViecCuaToi({
              thietBiId: route.params.thietBi.id,
              gioiHan: 10,
            })
          : layDanhSachSuCoCuaToi({
              thietBiId: route.params.thietBi.id,
              gioiHan: 3,
            }),
        nguoiDung?.vaiTro === 'KY_THUAT_VIEN'
          ? layDanhSachPhieuBaoTriCuaToi({
              thietBiId: route.params.thietBi.id,
              gioiHan: 3,
            })
          : Promise.resolve({ danhSach: [] as PhieuBaoTri[] }),
      ]);
      setThietBi(chiTiet);
      setDanhSachSuCo(ketQuaSuCo.danhSach);
      setDanhSachPhieuBaoTri(ketQuaBaoTri.danhSach);
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [nguoiDung?.vaiTro, route.params.thietBi.id]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  const suCoDangMo = danhSachSuCo.find(suCo =>
    ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY'].includes(suCo.trangThai),
  );
  const phieuBaoTriDangMo = danhSachPhieuBaoTri.find(phieu =>
    ['CHO_THUC_HIEN', 'DANG_THUC_HIEN', 'QUA_HAN'].includes(phieu.trangThai),
  );
  const duocBaoSuCo = thietBi.trangThai !== 'THANH_LY';
  const coVaiTroKyThuatVien = nguoiDung?.vaiTro === 'KY_THUAT_VIEN';

  function moChiTietSuCo(suCo: SuCo) {
    if (coVaiTroKyThuatVien) {
      navigation.navigate('ChiTietCongViec', { congViecId: suCo.id });
      return;
    }
    navigation.navigate('ChiTietSuCo', { suCoId: suCo.id });
  }

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
        <View style={styles.dauThietBi}>
          <Text style={styles.tenThietBi}>{thietBi.tenThietBi}</Text>
          <Text style={styles.maThietBi}>{thietBi.maThietBi}</Text>
          <Text style={styles.loaiThietBi}>{layTenLoaiThietBi(thietBi)}</Text>
          <HuyHieu loai="thietBi" giaTri={thietBi.trangThai} />
        </View>

        {loi ? (
          <TrangThaiDuLieu loai="loi" moTa={loi} onThuLai={() => taiDuLieu()} />
        ) : (
          <>
            <View style={styles.khuVuc}>
              <View style={styles.tieuDeHang}>
                <MapPin color={mauSac.chinh} size={20} />
                <Text style={styles.tieuDeKhuVuc}>Vị trí thiết bị</Text>
              </View>
              <Text style={styles.viTri}>{layViTriThietBi(thietBi)}</Text>
            </View>

            {coVaiTroKyThuatVien ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Thông tin kỹ thuật</Text>
                <DongThongTin
                  nhan="Loại thiết bị"
                  noiDung={layTenLoaiThietBi(thietBi)}
                />
                <DongThongTin nhan="Model" noiDung={thietBi.model} />
                <DongThongTin nhan="Serial" noiDung={thietBi.soSerial} />
                <DongThongTin
                  nhan="Hãng sản xuất"
                  noiDung={thietBi.hangSanXuat}
                />
                <DongThongTin nhan="Mô tả" noiDung={thietBi.moTa} />
              </View>
            ) : null}

            {coVaiTroKyThuatVien &&
            (thietBi.ngayBatDauBaoHanh || thietBi.ngayHetBaoHanh) ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Bảo hành</Text>
                <DongThongTin
                  nhan="Bắt đầu"
                  noiDung={dinhDangNgay(thietBi.ngayBatDauBaoHanh)}
                />
                <DongThongTin
                  nhan="Hết hạn"
                  noiDung={dinhDangNgay(thietBi.ngayHetBaoHanh)}
                />
              </View>
            ) : null}

            {thietBi.ngayBaoTriTiepTheo ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Thông tin bảo trì</Text>
                <DongThongTin
                  nhan="Bảo trì tiếp theo"
                  noiDung={dinhDangNgay(thietBi.ngayBaoTriTiepTheo)}
                />
              </View>
            ) : null}

            {suCoDangMo ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Sự cố hiện tại</Text>
                <TheSuCo
                  suCo={suCoDangMo}
                  onPress={() => moChiTietSuCo(suCoDangMo)}
                />
              </View>
            ) : null}

            {danhSachSuCo.length ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>
                  {coVaiTroKyThuatVien
                    ? 'Công việc liên quan được phân công'
                    : 'Sự cố gần đây của bạn'}
                </Text>
                {danhSachSuCo.slice(0, 3).map(suCo => (
                  <TheSuCo
                    key={suCo.id}
                    suCo={suCo}
                    onPress={() => moChiTietSuCo(suCo)}
                  />
                ))}
              </View>
            ) : null}

            {coVaiTroKyThuatVien && danhSachPhieuBaoTri.length ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Bảo trì liên quan</Text>
                {danhSachPhieuBaoTri.slice(0, 3).map(phieu => (
                  <TheBaoTri
                    key={phieu.id}
                    phieuBaoTri={phieu}
                    onPress={() =>
                      navigation.navigate('ChiTietBaoTri', {
                        phieuBaoTriId: phieu.id,
                      })
                    }
                  />
                ))}
              </View>
            ) : null}
          </>
        )}

        {!coVaiTroKyThuatVien && !duocBaoSuCo ? (
          <View style={styles.canhBao}>
            <AlertTriangle color={mauSac.canhBao} size={20} />
            <Text style={styles.canhBaoChu}>
              Thiết bị đã thanh lý nên không thể báo sự cố vận hành.
            </Text>
          </View>
        ) : null}
        {coVaiTroKyThuatVien ? (
          suCoDangMo ? (
            <NutChinh
              nhan="Xem công việc"
              biVoHieu={dangTai}
              onPress={() => moChiTietSuCo(suCoDangMo)}
            />
          ) : phieuBaoTriDangMo ? (
            <NutChinh
              nhan="Xem phiếu bảo trì"
              biVoHieu={dangTai}
              onPress={() =>
                navigation.navigate('ChiTietBaoTri', {
                  phieuBaoTriId: phieuBaoTriDangMo.id,
                })
              }
            />
          ) : null
        ) : (
          <NutChinh
            nhan="Báo sự cố"
            bieuTuong={AlertTriangle}
            biVoHieu={!duocBaoSuCo || dangTai}
            onPress={() => navigation.navigate('BaoSuCo', { thietBi })}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { padding: 20, paddingBottom: 32, gap: 18 },
  dauThietBi: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 18,
    gap: 8,
  },
  tenThietBi: {
    color: mauSac.chuChinh,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  maThietBi: { color: mauSac.chinh, fontSize: 14, fontWeight: '800' },
  loaiThietBi: { color: mauSac.chuPhu, fontSize: 14, marginBottom: 3 },
  khuVuc: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 16,
    gap: 12,
  },
  tieuDeHang: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tieuDeKhuVuc: { color: mauSac.chuChinh, fontSize: 16, fontWeight: '800' },
  viTri: { color: mauSac.chuChinh, fontSize: 15, lineHeight: 23 },
  canhBao: {
    padding: 13,
    borderRadius: boGoc.vua,
    backgroundColor: mauSac.canhBaoNhat,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  canhBaoChu: { flex: 1, color: mauSac.canhBao, fontSize: 13, lineHeight: 19 },
});
