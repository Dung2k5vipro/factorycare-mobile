import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CircleAlert, Inbox } from 'lucide-react-native';
import { mauSac } from '../constants/theme';
import { NutChinh } from './NutChinh';

interface TrangThaiDuLieuProps {
  loai: 'dangTai' | 'trong' | 'loi';
  tieuDe?: string;
  moTa?: string;
  onThuLai?: () => void;
}

export function TrangThaiDuLieu({
  loai,
  tieuDe,
  moTa,
  onThuLai,
}: TrangThaiDuLieuProps) {
  if (loai === 'dangTai') {
    return (
      <View style={styles.khung}>
        <ActivityIndicator color={mauSac.chinh} size="large" />
        <Text style={styles.moTa}>{moTa ?? 'Đang tải dữ liệu...'}</Text>
      </View>
    );
  }

  const BieuTuong = loai === 'loi' ? CircleAlert : Inbox;
  return (
    <View style={styles.khung}>
      <View style={[styles.bieuTuong, loai === 'loi' && styles.bieuTuongLoi]}>
        <BieuTuong
          color={loai === 'loi' ? mauSac.loi : mauSac.chuPhu}
          size={28}
        />
      </View>
      <Text style={styles.tieuDe}>
        {tieuDe ??
          (loai === 'loi' ? 'Không thể tải dữ liệu' : 'Chưa có dữ liệu')}
      </Text>
      {moTa ? <Text style={styles.moTa}>{moTa}</Text> : null}
      {onThuLai ? (
        <NutChinh
          nhan="Thử lại"
          onPress={onThuLai}
          kieu="phu"
          style={styles.nut}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  bieuTuong: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: mauSac.beMatPhu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bieuTuongLoi: {
    backgroundColor: mauSac.loiNhat,
  },
  tieuDe: {
    color: mauSac.chuChinh,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  moTa: {
    color: mauSac.chuPhu,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  nut: {
    marginTop: 6,
    minWidth: 130,
  },
});
