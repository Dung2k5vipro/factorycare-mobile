import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { boGoc, kichThuocCham, mauSac } from '../constants/theme';
import type { AnhDaChon } from '../types';

const SO_ANH_TOI_DA = 3;
const KICH_THUOC_TOI_DA = 5 * 1024 * 1024;

interface BoChonAnhProps {
  danhSachAnh: AnhDaChon[];
  onChange: (danhSachAnh: AnhDaChon[]) => void;
  onLoi: (thongBao?: string) => void;
}

function chuyenAnh(anh: ImagePicker.ImagePickerAsset): AnhDaChon | null {
  if (!anh.uri) return null;
  return {
    uri: anh.uri,
    tenTep: anh.fileName ?? undefined,
    loaiTep: anh.mimeType,
    kichThuoc: anh.fileSize,
  };
}

export function BoChonAnh({ danhSachAnh, onChange, onLoi }: BoChonAnhProps) {
  function kiemTraAnh(danhSachMoi: AnhDaChon[]) {
    const anhKhongHopLe = danhSachMoi.find(
      anh =>
        (anh.loaiTep && !anh.loaiTep.startsWith('image/')) ||
        (anh.kichThuoc && anh.kichThuoc > KICH_THUOC_TOI_DA),
    );
    if (anhKhongHopLe) {
      onLoi('Chỉ chấp nhận ảnh có dung lượng tối đa 5 MB.');
      return false;
    }
    return true;
  }

  async function xuLyChonThuVien() {
    onLoi(undefined);
    const soAnhConLai = SO_ANH_TOI_DA - danhSachAnh.length;
    if (soAnhConLai <= 0) {
      onLoi(`Chỉ được chọn tối đa ${SO_ANH_TOI_DA} ảnh.`);
      return;
    }
    const quyenThuVien =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!quyenThuVien.granted) {
      onLoi('Bạn cần cấp quyền thư viện ảnh để chọn ảnh sự cố.');
      return;
    }
    const ketQua = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: soAnhConLai,
      quality: 0.8,
    });
    if (ketQua.canceled) {
      return;
    }
    const danhSachMoi = ketQua.assets
      .map(chuyenAnh)
      .filter((anh): anh is AnhDaChon => anh !== null);
    if (kiemTraAnh(danhSachMoi)) {
      onChange([...danhSachAnh, ...danhSachMoi]);
    }
  }

  async function xuLyChupAnh() {
    onLoi(undefined);
    if (danhSachAnh.length >= SO_ANH_TOI_DA) {
      onLoi(`Chỉ được chọn tối đa ${SO_ANH_TOI_DA} ảnh.`);
      return;
    }
    try {
      const quyenCamera = await ImagePicker.requestCameraPermissionsAsync();
      if (!quyenCamera.granted) {
        onLoi('Bạn cần cấp quyền Camera để chụp ảnh sự cố.');
        return;
      }
      const ketQua = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (ketQua.canceled) {
        return;
      }
      const anhMoi = ketQua.assets[0] ? chuyenAnh(ketQua.assets[0]) : null;
      if (anhMoi && kiemTraAnh([anhMoi])) {
        onChange([...danhSachAnh, anhMoi]);
      }
    } catch {
      onLoi('Không thể mở Camera. Vui lòng kiểm tra quyền và thử lại.');
    }
  }

  return (
    <View style={styles.khung}>
      <Text style={styles.nhan}>Ảnh sự cố</Text>
      <Text style={styles.moTa}>Tối đa 3 ảnh, mỗi ảnh không quá 5 MB.</Text>
      <View style={styles.hanhDong}>
        <Pressable style={styles.nut} onPress={() => xuLyChupAnh()}>
          <Camera color={mauSac.chinh} size={20} />
          <Text style={styles.nhanNut}>Chụp ảnh</Text>
        </Pressable>
        <Pressable style={styles.nut} onPress={() => xuLyChonThuVien()}>
          <ImagePlus color={mauSac.chinh} size={20} />
          <Text style={styles.nhanNut}>Chọn từ thư viện</Text>
        </Pressable>
      </View>
      {danhSachAnh.length ? (
        <View style={styles.danhSachAnh}>
          {danhSachAnh.map((anh, viTri) => (
            <View key={`${anh.uri}-${viTri}`} style={styles.anhKhung}>
              <Image source={{ uri: anh.uri }} style={styles.anh} />
              <Pressable
                accessibilityLabel="Xóa ảnh"
                onPress={() =>
                  onChange(danhSachAnh.filter((_, chiSo) => chiSo !== viTri))
                }
                style={styles.nutXoa}
              >
                <X color={mauSac.trang} size={17} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: { gap: 8 },
  nhan: { color: mauSac.chuChinh, fontSize: 14, fontWeight: '600' },
  moTa: { color: mauSac.chuPhu, fontSize: 12 },
  hanhDong: { flexDirection: 'row', gap: 10 },
  nut: {
    flex: 1,
    minHeight: kichThuocCham,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.vua,
    backgroundColor: mauSac.beMat,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 10,
  },
  nhanNut: { color: mauSac.chinh, fontSize: 13, fontWeight: '700' },
  danhSachAnh: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  anhKhung: { position: 'relative' },
  anh: {
    width: 82,
    height: 82,
    borderRadius: boGoc.nho,
    backgroundColor: mauSac.beMatPhu,
  },
  nutXoa: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: mauSac.loi,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
