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
import { TheSuCo } from '../components/TheSuCo';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, mauSac } from '../constants/theme';
import type { ThamSoDieuHuongGoc } from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { layDanhSachSuCoCuaToi } from '../services/suCoService';
import { layChiTietThietBi } from '../services/thietBiService';
import type { SuCo, ThietBi } from '../types';
import {
  dinhDangNgay,
  layTenLoaiThietBi,
  layViTriThietBi,
} from '../utils/dinhDang';

type Props = NativeStackScreenProps<ThamSoDieuHuongGoc, 'ChiTietThietBi'>;

export function DeviceDetailScreen({ navigation, route }: Props) {
  const [thietBi, setThietBi] = useState<ThietBi>(route.params.thietBi);
  const [danhSachSuCo, setDanhSachSuCo] = useState<SuCo[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string>();

  const taiDuLieu = useCallback(async () => {
    setDangTai(true);
    setLoi(undefined);
    try {
      const [chiTiet, ketQuaSuCo] = await Promise.all([
        layChiTietThietBi(route.params.thietBi.id),
        layDanhSachSuCoCuaToi({
          thietBiId: route.params.thietBi.id,
          gioiHan: 3,
        }),
      ]);
      setThietBi(chiTiet);
      setDanhSachSuCo(ketQuaSuCo.danhSach);
    } catch (loiTai) {
      setLoi(layThongBaoAnToan(loiTai));
    } finally {
      setDangTai(false);
    }
  }, [route.params.thietBi.id]);

  useFocusEffect(
    useCallback(() => {
      taiDuLieu();
    }, [taiDuLieu]),
  );

  const suCoDangMo = danhSachSuCo.find(suCo =>
    ['MOI', 'DA_PHAN_CONG', 'DANG_XU_LY'].includes(suCo.trangThai),
  );
  const duocBaoSuCo = thietBi.trangThai !== 'THANH_LY';

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
                  onPress={() =>
                    navigation.navigate('ChiTietSuCo', {
                      suCoId: suCoDangMo.id,
                    })
                  }
                />
              </View>
            ) : null}

            {danhSachSuCo.length ? (
              <View style={styles.khuVuc}>
                <Text style={styles.tieuDeKhuVuc}>Sự cố gần đây của bạn</Text>
                {danhSachSuCo.slice(0, 3).map(suCo => (
                  <TheSuCo
                    key={suCo.id}
                    suCo={suCo}
                    onPress={() =>
                      navigation.navigate('ChiTietSuCo', { suCoId: suCo.id })
                    }
                  />
                ))}
              </View>
            ) : null}
          </>
        )}

        {!duocBaoSuCo ? (
          <View style={styles.canhBao}>
            <AlertTriangle color={mauSac.canhBao} size={20} />
            <Text style={styles.canhBaoChu}>
              Thiết bị đã thanh lý nên không thể báo sự cố vận hành.
            </Text>
          </View>
        ) : null}
        <NutChinh
          nhan="Báo sự cố"
          bieuTuong={AlertTriangle}
          biVoHieu={!duocBaoSuCo || dangTai}
          onPress={() => navigation.navigate('BaoSuCo', { thietBi })}
        />
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
