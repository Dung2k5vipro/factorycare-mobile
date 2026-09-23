import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  useFocusEffect,
  useIsFocused,
  type NavigationProp,
} from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Flashlight, Keyboard, RotateCcw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NutChinh } from '../components/NutChinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { boGoc, kichThuocCham, mauSac } from '../constants/theme';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabNhanVien,
} from '../navigation/types';
import { layThongBaoAnToan } from '../services/apiClient';
import { quetMaThietBi } from '../services/thietBiService';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'QuetQR'>;
type TrangThaiQuyen = 'dangKiemTra' | 'duocCap' | 'tuChoi';

export function ScanQrScreen({ navigation }: Props) {
  const dangHienThi = useIsFocused();
  const [trangThaiQuyen, setTrangThaiQuyen] =
    useState<TrangThaiQuyen>('dangKiemTra');
  const [quyenCamera, yeuCauQuyenCamera] = useCameraPermissions();
  const [batDen, setBatDen] = useState(false);
  const [dangTraCuu, setDangTraCuu] = useState(false);
  const [loiQuet, setLoiQuet] = useState<string>();
  const daNhanMaRef = useRef(false);
  const daYeuCauQuyenRef = useRef(false);
  const dieuHuongGoc =
    navigation.getParent<NavigationProp<ThamSoDieuHuongGoc>>();

  const kiemTraQuyen = useCallback(async () => {
    setTrangThaiQuyen('dangKiemTra');
    try {
      if (quyenCamera?.granted) {
        setTrangThaiQuyen('duocCap');
        return;
      }
      const ketQuaQuyen = await yeuCauQuyenCamera();
      setTrangThaiQuyen(ketQuaQuyen.granted ? 'duocCap' : 'tuChoi');
    } catch {
      setTrangThaiQuyen('tuChoi');
    }
  }, [quyenCamera?.granted, yeuCauQuyenCamera]);

  useEffect(() => {
    if (!quyenCamera || daYeuCauQuyenRef.current) {
      return;
    }
    daYeuCauQuyenRef.current = true;
    kiemTraQuyen();
  }, [kiemTraQuyen, quyenCamera]);

  useFocusEffect(
    useCallback(() => {
      daNhanMaRef.current = false;
      setLoiQuet(undefined);
      setDangTraCuu(false);
    }, []),
  );

  const xuLyMaQr = useCallback(
    async (noiDungQr: string) => {
      if (daNhanMaRef.current || !noiDungQr.trim()) return;
      daNhanMaRef.current = true;
      setDangTraCuu(true);
      setLoiQuet(undefined);
      try {
        const thietBi = await quetMaThietBi(noiDungQr.trim());
        dieuHuongGoc?.navigate('ChiTietThietBi', { thietBi });
      } catch (loi) {
        setLoiQuet(
          layThongBaoAnToan(loi) === 'Không tìm thấy dữ liệu.'
            ? 'Không tìm thấy thiết bị.'
            : layThongBaoAnToan(loi),
        );
      } finally {
        setDangTraCuu(false);
      }
    },
    [dieuHuongGoc],
  );

  function xuLyQuetLai() {
    daNhanMaRef.current = false;
    setLoiQuet(undefined);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <View style={styles.dauTrang}>
        <Text style={styles.tieuDe}>Quét QR thiết bị</Text>
        <Text style={styles.moTa}>Đưa mã QR trên thiết bị vào giữa khung.</Text>
      </View>

      <View style={styles.vungCamera}>
        {trangThaiQuyen === 'dangKiemTra' ? (
          <TrangThaiDuLieu
            loai="dangTai"
            moTa="Đang kiểm tra quyền Camera..."
          />
        ) : trangThaiQuyen === 'tuChoi' ? (
          <TrangThaiDuLieu
            loai="loi"
            tieuDe="Chưa có quyền Camera"
            moTa="Bạn có thể cấp quyền trong cài đặt thiết bị hoặc nhập mã thủ công."
            onThuLai={() => {
              daYeuCauQuyenRef.current = false;
              return kiemTraQuyen();
            }}
          />
        ) : (
          <>
            {dangHienThi ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                active={dangHienThi}
                enableTorch={batDen}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={
                  daNhanMaRef.current
                    ? undefined
                    : ketQua => xuLyMaQr(ketQua.data)
                }
                onMountError={() =>
                  setLoiQuet('Không thể khởi động Camera. Vui lòng thử lại.')
                }
              />
            ) : null}
            <View pointerEvents="none" style={styles.lopPhu}>
              <View style={styles.khungQuet} />
            </View>
            <Pressable
              accessibilityLabel={batDen ? 'Tắt đèn pin' : 'Bật đèn pin'}
              onPress={() => setBatDen(giaTri => !giaTri)}
              style={styles.nutDen}
            >
              <Flashlight color={mauSac.trang} size={22} />
              <Text style={styles.nhanDen}>
                {batDen ? 'Tắt đèn' : 'Bật đèn'}
              </Text>
            </Pressable>
          </>
        )}

        {dangTraCuu ? (
          <View style={styles.dangTraCuu}>
            <ActivityIndicator color={mauSac.trang} />
            <Text style={styles.nhanTraCuu}>Đang tìm thiết bị...</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.hanhDong}>
        {loiQuet ? (
          <View style={styles.loiQuet}>
            <Text style={styles.loiQuetChu}>{loiQuet}</Text>
            <NutChinh
              nhan="Quét lại"
              bieuTuong={RotateCcw}
              onPress={xuLyQuetLai}
              kieu="phu"
            />
          </View>
        ) : null}
        <NutChinh
          nhan="Nhập mã thiết bị thủ công"
          bieuTuong={Keyboard}
          kieu="phu"
          onPress={() => dieuHuongGoc?.navigate('NhapMaThietBi')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  dauTrang: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  tieuDe: { color: mauSac.chuChinh, fontSize: 25, fontWeight: '800' },
  moTa: { color: mauSac.chuPhu, fontSize: 14 },
  vungCamera: {
    flex: 1,
    minHeight: 330,
    overflow: 'hidden',
    backgroundColor: mauSac.toi,
    position: 'relative',
  },
  lopPhu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  khungQuet: {
    width: '68%',
    aspectRatio: 1,
    maxWidth: 290,
    borderWidth: 3,
    borderColor: mauSac.trang,
    borderRadius: boGoc.lon,
    backgroundColor: mauSac.trongSuot,
  },
  nutDen: {
    position: 'absolute',
    right: 18,
    top: 18,
    minHeight: kichThuocCham,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(13,23,28,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nhanDen: { color: mauSac.trang, fontSize: 13, fontWeight: '700' },
  dangTraCuu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(13,23,28,0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nhanTraCuu: { color: mauSac.trang, fontSize: 14, fontWeight: '600' },
  hanhDong: { padding: 16, gap: 12 },
  loiQuet: {
    padding: 14,
    borderRadius: boGoc.vua,
    backgroundColor: mauSac.loiNhat,
    gap: 12,
  },
  loiQuetChu: {
    color: mauSac.loi,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
