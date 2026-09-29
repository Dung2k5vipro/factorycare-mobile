import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Bell,
  CircleUserRound,
  ClipboardList,
  House,
  QrCode,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { CompleteRepairScreen } from '../screens/CompleteRepairScreen';
import { CreateIncidentScreen } from '../screens/CreateIncidentScreen';
import { DeviceDetailScreen } from '../screens/DeviceDetailScreen';
import { EmployeeHomeScreen } from '../screens/EmployeeHomeScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { IncidentSuccessScreen } from '../screens/IncidentSuccessScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MaintenanceDetailScreen } from '../screens/MaintenanceDetailScreen';
import { MaintenanceExecutionScreen } from '../screens/MaintenanceExecutionScreen';
import { MaintenanceListScreen } from '../screens/MaintenanceListScreen';
import { MaintenanceSuccessScreen } from '../screens/MaintenanceSuccessScreen';
import { ManualDeviceScreen } from '../screens/ManualDeviceScreen';
import { MyIncidentsScreen } from '../screens/MyIncidentsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RepairSuccessScreen } from '../screens/RepairSuccessScreen';
import { ScanQrScreen } from '../screens/ScanQrScreen';
import { TechnicianWorkDetailScreen } from '../screens/TechnicianWorkDetailScreen';
import { TechnicianWorkListScreen } from '../screens/TechnicianWorkListScreen';
import { TechnicianWorkProcessScreen } from '../screens/TechnicianWorkProcessScreen';
import type {
  ThamSoDieuHuongGoc,
  ThamSoTabKyThuatVien,
  ThamSoTabNhanVien,
} from './types';

const TabNhanVien = createBottomTabNavigator<ThamSoTabNhanVien>();
const TabKyThuatVien = createBottomTabNavigator<ThamSoTabKyThuatVien>();
const Stack = createNativeStackNavigator<ThamSoDieuHuongGoc>();

const CHU_DE_DIEU_HUONG = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: mauSac.nen,
    card: mauSac.beMat,
    primary: mauSac.chinh,
    text: mauSac.chuChinh,
    border: mauSac.vien,
    notification: mauSac.loi,
  },
};

const BIEU_TUONG_TAB: Record<keyof ThamSoTabNhanVien, LucideIcon> = {
  TrangChu: House,
  QuetQR: QrCode,
  SuCoCuaToi: ClipboardList,
  ThongBao: Bell,
  TaiKhoan: CircleUserRound,
};

interface BieuTuongTabProps {
  color: string;
  size: number;
}

function taoBieuTuongTab(BieuTuong: LucideIcon) {
  return function BieuTuongTab({ color, size }: BieuTuongTabProps) {
    return (
      <BieuTuong color={color} size={Math.min(size, 23)} strokeWidth={2.1} />
    );
  };
}

const NOI_DUNG_BIEU_TUONG_TAB = {
  TrangChu: taoBieuTuongTab(BIEU_TUONG_TAB.TrangChu),
  QuetQR: taoBieuTuongTab(BIEU_TUONG_TAB.QuetQR),
  SuCoCuaToi: taoBieuTuongTab(BIEU_TUONG_TAB.SuCoCuaToi),
  ThongBao: taoBieuTuongTab(BIEU_TUONG_TAB.ThongBao),
  TaiKhoan: taoBieuTuongTab(BIEU_TUONG_TAB.TaiKhoan),
};

const NHAN_TAB: Record<keyof ThamSoTabNhanVien, string> = {
  TrangChu: 'Trang chủ',
  QuetQR: 'Quét QR',
  SuCoCuaToi: 'Sự cố',
  ThongBao: 'Thông báo',
  TaiKhoan: 'Tài khoản',
};

function NhanVienTabs() {
  return (
    <TabNhanVien.Navigator
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: mauSac.chinh,
          tabBarInactiveTintColor: mauSac.chuPhu,
          tabBarLabel: NHAN_TAB[route.name],
          tabBarLabelStyle: styles.nhanTab,
          tabBarStyle: styles.thanhTab,
          tabBarIcon: NOI_DUNG_BIEU_TUONG_TAB[route.name],
        };
      }}
    >
      <TabNhanVien.Screen name="TrangChu" component={EmployeeHomeScreen} />
      <TabNhanVien.Screen name="QuetQR" component={ScanQrScreen} />
      <TabNhanVien.Screen name="SuCoCuaToi" component={MyIncidentsScreen} />
      <TabNhanVien.Screen name="ThongBao" component={NotificationsScreen} />
      <TabNhanVien.Screen name="TaiKhoan" component={ProfileScreen} />
    </TabNhanVien.Navigator>
  );
}

const BIEU_TUONG_TAB_KY_THUAT_VIEN: Record<
  keyof ThamSoTabKyThuatVien,
  LucideIcon
> = {
  CongViec: ClipboardList,
  QuetQR: QrCode,
  BaoTri: Wrench,
  ThongBao: Bell,
  TaiKhoan: CircleUserRound,
};

const NHAN_TAB_KY_THUAT_VIEN: Record<keyof ThamSoTabKyThuatVien, string> = {
  CongViec: 'Công việc',
  QuetQR: 'Quét QR',
  BaoTri: 'Bảo trì',
  ThongBao: 'Thông báo',
  TaiKhoan: 'Tài khoản',
};

function KyThuatVienTabs() {
  return (
    <TabKyThuatVien.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: mauSac.chinh,
        tabBarInactiveTintColor: mauSac.chuPhu,
        tabBarLabel: NHAN_TAB_KY_THUAT_VIEN[route.name],
        tabBarLabelStyle: styles.nhanTab,
        tabBarStyle: styles.thanhTab,
        tabBarIcon: taoBieuTuongTab(BIEU_TUONG_TAB_KY_THUAT_VIEN[route.name]),
      })}
    >
      <TabKyThuatVien.Screen
        name="CongViec"
        component={TechnicianWorkListScreen}
      />
      <TabKyThuatVien.Screen name="QuetQR" component={ScanQrScreen} />
      <TabKyThuatVien.Screen name="BaoTri" component={MaintenanceListScreen} />
      <TabKyThuatVien.Screen name="ThongBao" component={NotificationsScreen} />
      <TabKyThuatVien.Screen name="TaiKhoan" component={ProfileScreen} />
    </TabKyThuatVien.Navigator>
  );
}

function ManHinhKhoiTao() {
  return (
    <View style={styles.khoiTao}>
      <View style={styles.logo}>
        <QrCode color={mauSac.trang} size={28} />
      </View>
      <Text style={styles.tenUngDung}>FactoryCare</Text>
      <ActivityIndicator color={mauSac.chinh} />
    </View>
  );
}

export function RootNavigator() {
  const { nguoiDung, dangKhoiTao } = useAuth();

  if (dangKhoiTao) {
    return <ManHinhKhoiTao />;
  }

  return (
    <NavigationContainer theme={CHU_DE_DIEU_HUONG}>
      {nguoiDung ? (
        <Stack.Navigator
          screenOptions={{
            headerTintColor: mauSac.chuChinh,
            headerTitleStyle: styles.tieuDeHeader,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: mauSac.beMat },
            contentStyle: { backgroundColor: mauSac.nen },
            animation: 'slide_from_right',
          }}
        >
          {nguoiDung.vaiTro === 'KY_THUAT_VIEN' ? (
            <Stack.Screen
              name="KyThuatVien"
              component={KyThuatVienTabs}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="NhanVien"
              component={NhanVienTabs}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="NhapMaThietBi"
            component={ManualDeviceScreen}
            options={{ title: 'Nhập mã thiết bị' }}
          />
          <Stack.Screen
            name="ChiTietThietBi"
            component={DeviceDetailScreen}
            options={{ title: 'Chi tiết thiết bị' }}
          />
          <Stack.Screen
            name="BaoSuCo"
            component={CreateIncidentScreen}
            options={{ title: 'Báo sự cố' }}
          />
          <Stack.Screen
            name="BaoSuCoThanhCong"
            component={IncidentSuccessScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="ChiTietSuCo"
            component={IncidentDetailScreen}
            options={{ title: 'Chi tiết sự cố' }}
          />
          <Stack.Screen
            name="ChiTietCongViec"
            component={TechnicianWorkDetailScreen}
            options={{ title: 'Chi tiết công việc' }}
          />
          <Stack.Screen
            name="XuLyCongViec"
            component={TechnicianWorkProcessScreen}
            options={{ title: 'Xử lý công việc' }}
          />
          <Stack.Screen
            name="HoanThanhSuaChua"
            component={CompleteRepairScreen}
            options={{ title: 'Hoàn thành sửa chữa' }}
          />
          <Stack.Screen
            name="KetQuaCongViec"
            component={RepairSuccessScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="ChiTietBaoTri"
            component={MaintenanceDetailScreen}
            options={{ title: 'Chi tiết bảo trì' }}
          />
          <Stack.Screen
            name="ThucHienBaoTri"
            component={MaintenanceExecutionScreen}
            options={{ title: 'Thực hiện bảo trì' }}
          />
          <Stack.Screen
            name="KetQuaBaoTri"
            component={MaintenanceSuccessScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="DoiMatKhau"
            component={ChangePasswordScreen}
            options={{ title: 'Đổi mật khẩu' }}
          />
        </Stack.Navigator>
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  thanhTab: {
    minHeight: 66,
    paddingTop: 7,
    paddingBottom: 8,
    borderTopColor: mauSac.vien,
    backgroundColor: mauSac.beMat,
  },
  nhanTab: { fontSize: 11, fontWeight: '600' },
  tieuDeHeader: { fontSize: 17, fontWeight: '700' },
  khoiTao: {
    flex: 1,
    backgroundColor: mauSac.nen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: boGoc.lon,
    backgroundColor: mauSac.chinh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenUngDung: {
    color: mauSac.chuChinh,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
});
