import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TieuDeManHinh } from '../components/TieuDeManHinh';
import { TrangThaiDuLieu } from '../components/TrangThaiDuLieu';
import { mauSac } from '../constants/theme';
import type { ThamSoTabNhanVien } from '../navigation/types';

type Props = BottomTabScreenProps<ThamSoTabNhanVien, 'ThongBao'>;

export function NotificationsScreen(_: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.anToan}>
      <View style={styles.noiDung}>
        <TieuDeManHinh
          tieuDe="Thông báo"
          moTa="Các cập nhật liên quan đến công việc của bạn."
        />
        <TrangThaiDuLieu
          loai="trong"
          tieuDe="Chưa thể tải thông báo"
          moTa="Hệ thống máy chủ hiện chưa cung cấp chức năng danh sách và đánh dấu thông báo đã đọc."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  anToan: { flex: 1, backgroundColor: mauSac.nen },
  noiDung: { flex: 1, padding: 20 },
});
