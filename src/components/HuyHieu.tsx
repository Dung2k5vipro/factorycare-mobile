import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { boGoc } from '../constants/theme';
import {
  layMauMucDo,
  layMauTrangThaiSuCo,
  layMauTrangThaiThietBi,
  layNhanMucDo,
  layNhanTrangThaiSuCo,
  layNhanTrangThaiThietBi,
} from '../utils/dinhDang';

interface HuyHieuProps {
  loai: 'thietBi' | 'suCo' | 'mucDo';
  giaTri?: string;
}

export function HuyHieu({ loai, giaTri }: HuyHieuProps) {
  const mau =
    loai === 'thietBi'
      ? layMauTrangThaiThietBi(giaTri)
      : loai === 'suCo'
      ? layMauTrangThaiSuCo(giaTri)
      : layMauMucDo(giaTri);
  const nhan =
    loai === 'thietBi'
      ? layNhanTrangThaiThietBi(giaTri)
      : loai === 'suCo'
      ? layNhanTrangThaiSuCo(giaTri)
      : layNhanMucDo(giaTri);

  return (
    <View style={[styles.khung, { backgroundColor: mau.nen }]}>
      <Text style={[styles.chu, { color: mau.chu }]}>{nhan}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: boGoc.tron,
  },
  chu: {
    fontSize: 12,
    fontWeight: '700',
  },
});
