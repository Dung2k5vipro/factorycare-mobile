/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [
    { granted: false, canAskAgain: false },
    jest.fn().mockResolvedValue({ granted: false }),
  ],
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: false }),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: false }),
  launchCameraAsync: jest
    .fn()
    .mockResolvedValue({ canceled: true, assets: null }),
  launchImageLibraryAsync: jest
    .fn()
    .mockResolvedValue({ canceled: true, assets: null }),
}));

jest.mock('lucide-react-native', () => {
  const BieuTuong = () => null;
  return {
    AlertTriangle: BieuTuong,
    Bell: BieuTuong,
    Camera: BieuTuong,
    Check: BieuTuong,
    CheckCircle2: BieuTuong,
    ChevronRight: BieuTuong,
    Circle: BieuTuong,
    CircleAlert: BieuTuong,
    CircleUserRound: BieuTuong,
    ClipboardList: BieuTuong,
    Eye: BieuTuong,
    EyeOff: BieuTuong,
    Flashlight: BieuTuong,
    House: BieuTuong,
    ImagePlus: BieuTuong,
    Inbox: BieuTuong,
    Keyboard: BieuTuong,
    KeyRound: BieuTuong,
    LogOut: BieuTuong,
    MapPin: BieuTuong,
    QrCode: BieuTuong,
    RotateCcw: BieuTuong,
    Search: BieuTuong,
    Send: BieuTuong,
    ShieldCheck: BieuTuong,
    UserRound: BieuTuong,
    Wrench: BieuTuong,
    X: BieuTuong,
  };
});

test('renders correctly', async () => {
  let ungDung: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    ungDung = ReactTestRenderer.create(<App />);
    await Promise.resolve();
  });
  await ReactTestRenderer.act(async () => {
    ungDung!.unmount();
  });
});
