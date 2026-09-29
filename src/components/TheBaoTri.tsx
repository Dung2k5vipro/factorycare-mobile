import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { boGoc, mauSac } from '../constants/theme';
import type { PhieuBaoTri } from '../types';
import { dinhDangNgay, layViTriThietBi } from '../utils/dinhDang';
import { HuyHieu } from './HuyHieu';

interface TheBaoTriProps {
  phieuBaoTri: PhieuBaoTri;
  onPress: () => void;
}

export function TheBaoTri({ phieuBaoTri, onPress }: TheBaoTriProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.the, pressed && styles.dangNhan]}
    >
      <View style={styles.dauThe}>
        <Text style={styles.maPhieu}>
          {phieuBaoTri.maPhieu || `Phiếu bảo trì #${phieuBaoTri.id}`}
        </Text>
        <ChevronRight color={mauSac.chuPhu} size={20} />
      </View>
      {phieuBaoTri.thietBi ? (
        <>
          <Text style={styles.tenThietBi} numberOfLines={2}>
            {phieuBaoTri.thietBi.tenThietBi}
          </Text>
          <Text style={styles.maThietBi}>{phieuBaoTri.thietBi.maThietBi}</Text>
          <Text style={styles.viTri} numberOfLines={2}>
            {layViTriThietBi(phieuBaoTri.thietBi)}
          </Text>
        </>
      ) : null}
      <View style={styles.hangCuoi}>
        <View style={styles.ngayDuKien}>
          <Text style={styles.nhanNgay}>Ngày dự kiến</Text>
          <Text style={styles.giaTriNgay}>
            {dinhDangNgay(phieuBaoTri.ngayDuKien)}
          </Text>
        </View>
        <HuyHieu loai="baoTri" giaTri={phieuBaoTri.trangThai} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  the: {
    padding: 16,
    borderRadius: boGoc.lon,
    borderWidth: 1,
    borderColor: mauSac.vien,
    backgroundColor: mauSac.beMat,
    gap: 7,
  },
  dangNhan: { opacity: 0.78 },
  dauThe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maPhieu: { color: mauSac.chinh, fontSize: 13, fontWeight: '800' },
  tenThietBi: {
    color: mauSac.chuChinh,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  maThietBi: { color: mauSac.chuPhu, fontSize: 13, fontWeight: '600' },
  viTri: { color: mauSac.chuPhu, fontSize: 12, lineHeight: 17 },
  hangCuoi: {
    marginTop: 5,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: mauSac.vien,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ngayDuKien: { gap: 2 },
  nhanNgay: { color: mauSac.chuPhu, fontSize: 11 },
  giaTriNgay: { color: mauSac.chuChinh, fontSize: 13, fontWeight: '700' },
});
