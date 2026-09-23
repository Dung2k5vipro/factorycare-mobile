import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { boGoc, mauSac } from '../constants/theme';
import type { SuCo } from '../types';
import { layThoiGianSuCo } from '../utils/dinhDang';
import { HuyHieu } from './HuyHieu';

interface TheSuCoProps {
  suCo: SuCo;
  onPress: () => void;
}

export function TheSuCo({ suCo, onPress }: TheSuCoProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.the, pressed && styles.dangNhan]}
    >
      <View style={styles.dauThe}>
        <Text style={styles.ma}>{suCo.maSuCo}</Text>
        <ChevronRight color={mauSac.chuPhu} size={20} />
      </View>
      <Text numberOfLines={2} style={styles.tieuDe}>
        {suCo.tieuDe}
      </Text>
      {suCo.thietBi ? (
        <Text style={styles.thietBi}>
          {suCo.thietBi.tenThietBi} · {suCo.thietBi.maThietBi}
        </Text>
      ) : null}
      <View style={styles.huyHieu}>
        <HuyHieu loai="mucDo" giaTri={suCo.mucDo} />
        <HuyHieu loai="suCo" giaTri={suCo.trangThai} />
      </View>
      <Text style={styles.thoiGian}>{layThoiGianSuCo(suCo)}</Text>
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
    gap: 8,
  },
  dangNhan: {
    opacity: 0.78,
  },
  dauThe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ma: {
    color: mauSac.chinh,
    fontSize: 13,
    fontWeight: '800',
  },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  thietBi: {
    color: mauSac.chuPhu,
    fontSize: 14,
  },
  huyHieu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thoiGian: {
    color: mauSac.chuPhu,
    fontSize: 12,
  },
});
