import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { boGoc, kichThuocCham, mauSac } from '../constants/theme';

interface NutChinhProps {
  nhan: string;
  onPress: () => void;
  dangTai?: boolean;
  biVoHieu?: boolean;
  bieuTuong?: LucideIcon;
  kieu?: 'chinh' | 'phu' | 'nguyHiem';
  style?: StyleProp<ViewStyle>;
}

export function NutChinh({
  nhan,
  onPress,
  dangTai = false,
  biVoHieu = false,
  bieuTuong: BieuTuong,
  kieu = 'chinh',
  style,
}: NutChinhProps) {
  const daVoHieu = biVoHieu || dangTai;
  const mauNen =
    kieu === 'phu'
      ? mauSac.beMat
      : kieu === 'nguyHiem'
      ? mauSac.loi
      : mauSac.chinh;
  const mauChu = kieu === 'phu' ? mauSac.chinh : mauSac.trang;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: daVoHieu, busy: dangTai }}
      disabled={daVoHieu}
      onPress={onPress}
      style={({ pressed }) => [
        styles.nut,
        { backgroundColor: mauNen },
        kieu === 'phu' && styles.nutPhu,
        pressed && styles.dangNhan,
        daVoHieu && styles.voHieu,
        style,
      ]}
    >
      {dangTai ? (
        <ActivityIndicator color={mauChu} />
      ) : (
        <>
          {BieuTuong ? (
            <BieuTuong color={mauChu} size={20} strokeWidth={2.2} />
          ) : null}
          <Text style={[styles.nhan, { color: mauChu }]}>{nhan}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nut: {
    minHeight: kichThuocCham,
    paddingHorizontal: 18,
    borderRadius: boGoc.vua,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  nutPhu: {
    borderWidth: 1,
    borderColor: mauSac.vien,
  },
  nhan: {
    fontSize: 16,
    fontWeight: '700',
  },
  dangNhan: {
    opacity: 0.82,
  },
  voHieu: {
    opacity: 0.5,
  },
});
