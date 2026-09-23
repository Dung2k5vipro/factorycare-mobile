import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { mauSac } from '../constants/theme';

interface TieuDeManHinhProps {
  tieuDe: string;
  moTa?: string;
  benPhai?: React.ReactNode;
}

export function TieuDeManHinh({ tieuDe, moTa, benPhai }: TieuDeManHinhProps) {
  return (
    <View style={styles.khung}>
      <View style={styles.noiDung}>
        <Text style={styles.tieuDe}>{tieuDe}</Text>
        {moTa ? <Text style={styles.moTa}>{moTa}</Text> : null}
      </View>
      {benPhai}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  noiDung: {
    flex: 1,
    gap: 4,
  },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  moTa: {
    color: mauSac.chuPhu,
    fontSize: 14,
    lineHeight: 20,
  },
});
