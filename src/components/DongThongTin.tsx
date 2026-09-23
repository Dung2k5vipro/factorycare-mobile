import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { mauSac } from '../constants/theme';

interface DongThongTinProps {
  nhan: string;
  noiDung?: string | null;
}

export function DongThongTin({ nhan, noiDung }: DongThongTinProps) {
  return (
    <View style={styles.dong}>
      <Text style={styles.nhan}>{nhan}</Text>
      <Text style={styles.noiDung}>{noiDung || 'Chưa có thông tin'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dong: {
    gap: 4,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mauSac.vien,
  },
  nhan: {
    color: mauSac.chuPhu,
    fontSize: 13,
  },
  noiDung: {
    color: mauSac.chuChinh,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
});
