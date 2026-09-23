import type { NavigatorScreenParams } from '@react-navigation/native';
import type { SuCo, ThietBi } from '../types';

export type ThamSoTabNhanVien = {
  TrangChu: undefined;
  QuetQR: undefined;
  SuCoCuaToi: undefined;
  ThongBao: undefined;
  TaiKhoan: undefined;
};

export type ThamSoDieuHuongGoc = {
  NhanVien: NavigatorScreenParams<ThamSoTabNhanVien> | undefined;
  NhapMaThietBi: undefined;
  ChiTietThietBi: { thietBi: ThietBi };
  BaoSuCo: { thietBi: ThietBi };
  BaoSuCoThanhCong: { suCo: SuCo };
  ChiTietSuCo: { suCoId: number };
  DoiMatKhau: undefined;
};
