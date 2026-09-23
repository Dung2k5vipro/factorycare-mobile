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
  type LucideIcon,
} from 'lucide-react-native';
import { boGoc, mauSac } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { ChangePasswordScreen } from '../screens/ChangePasswordScreen';
import { CreateIncidentScreen } from '../screens/CreateIncidentScreen';
import { DeviceDetailScreen } from '../screens/DeviceDetailScreen';
import { EmployeeHomeScreen } from '../screens/EmployeeHomeScreen';
import { IncidentDetailScreen } from '../screens/IncidentDetailScreen';
import { IncidentSuccessScreen } from '../screens/IncidentSuccessScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ManualDeviceScreen } from '../screens/ManualDeviceScreen';
import { MyIncidentsScreen } from '../screens/MyIncidentsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScanQrScreen } from '../screens/ScanQrScreen';
import type { ThamSoDieuHuongGoc, ThamSoTabNhanVien } from './types';

const Tab = createBottomTabNavigator<ThamSoTabNhanVien>();
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
    <Tab.Navigator
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
      <Tab.Screen name="TrangChu" component={EmployeeHomeScreen} />
      <Tab.Screen name="QuetQR" component={ScanQrScreen} />
      <Tab.Screen name="SuCoCuaToi" component={MyIncidentsScreen} />
      <Tab.Screen name="ThongBao" component={NotificationsScreen} />
      <Tab.Screen name="TaiKhoan" component={ProfileScreen} />
    </Tab.Navigator>
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
          <Stack.Screen
            name="NhanVien"
            component={NhanVienTabs}
            options={{ headerShown: false }}
          />
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
