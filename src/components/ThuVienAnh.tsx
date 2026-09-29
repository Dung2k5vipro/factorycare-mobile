import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { boGoc, mauSac } from '../constants/theme';
import { taoDiaChiTaiNguyen } from '../services/apiClient';

interface ThuVienAnhProps {
  danhSachDuongDan: string[];
}

export function ThuVienAnh({ danhSachDuongDan }: ThuVienAnhProps) {
  const [anhDangXem, setAnhDangXem] = useState<string>();
  const [dangTaiAnhLon, setDangTaiAnhLon] = useState(false);
  const [anhLoi, setAnhLoi] = useState<Record<string, boolean>>({});
  const [anhDangTai, setAnhDangTai] = useState<Record<string, boolean>>({});

  return (
    <>
      <View style={styles.danhSachAnh}>
        {danhSachDuongDan.map((duongDan, chiSo) => {
          const diaChiAnh = taoDiaChiTaiNguyen(duongDan);
          const coLoiAnh = !diaChiAnh || anhLoi[duongDan];
          return coLoiAnh ? (
            <View key={`${duongDan}-${chiSo}`} style={styles.anhKhongXemDuoc}>
              <Text style={styles.anhKhongXemDuocChu}>Ảnh {chiSo + 1}</Text>
            </View>
          ) : (
            <Pressable
              key={`${duongDan}-${chiSo}`}
              accessibilityLabel={`Mở ảnh ${chiSo + 1}`}
              onPress={() => setAnhDangXem(diaChiAnh)}
              style={styles.khungAnh}
            >
              <Image
                source={{ uri: diaChiAnh }}
                style={styles.anh}
                onLoadStart={() =>
                  setAnhDangTai(danhSachDangTai => ({
                    ...danhSachDangTai,
                    [duongDan]: true,
                  }))
                }
                onLoadEnd={() =>
                  setAnhDangTai(danhSachDangTai => ({
                    ...danhSachDangTai,
                    [duongDan]: false,
                  }))
                }
                onError={() => {
                  setAnhDangTai(danhSachDangTai => ({
                    ...danhSachDangTai,
                    [duongDan]: false,
                  }));
                  setAnhLoi(danhSachLoi => ({
                    ...danhSachLoi,
                    [duongDan]: true,
                  }));
                }}
              />
              {anhDangTai[duongDan] !== false ? (
                <ActivityIndicator
                  color={mauSac.chinh}
                  style={styles.dangTaiAnhNho}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={Boolean(anhDangXem)}
        transparent
        animationType="fade"
        onRequestClose={() => setAnhDangXem(undefined)}
      >
        <View style={styles.lopNen}>
          <Pressable
            accessibilityLabel="Đóng ảnh"
            onPress={() => setAnhDangXem(undefined)}
            style={styles.nutDong}
          >
            <X color={mauSac.trang} size={26} />
          </Pressable>
          {dangTaiAnhLon ? (
            <ActivityIndicator
              color={mauSac.trang}
              size="large"
              style={styles.dangTai}
            />
          ) : null}
          {anhDangXem ? (
            <Image
              source={{ uri: anhDangXem }}
              resizeMode="contain"
              style={styles.anhLon}
              onLoadStart={() => setDangTaiAnhLon(true)}
              onLoadEnd={() => setDangTaiAnhLon(false)}
              onError={() => setDangTaiAnhLon(false)}
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  danhSachAnh: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  khungAnh: { position: 'relative' },
  anh: {
    width: 94,
    height: 94,
    borderRadius: boGoc.nho,
    backgroundColor: mauSac.beMatPhu,
  },
  anhKhongXemDuoc: {
    width: 94,
    height: 94,
    borderRadius: boGoc.nho,
    backgroundColor: mauSac.beMatPhu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anhKhongXemDuocChu: { color: mauSac.chuPhu, fontSize: 12 },
  dangTaiAnhNho: { position: 'absolute', top: 35, left: 35 },
  lopNen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutDong: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dangTai: { position: 'absolute' },
  anhLon: { width: '100%', height: '82%' },
});
