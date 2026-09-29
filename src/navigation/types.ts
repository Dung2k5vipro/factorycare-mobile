import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  KetQuaSuaChua,
  LinhKienThayThe,
  PhieuBaoTri,
  SuCo,
  ThietBi,
} from '../types';

export type ThamSoTabNhanVien = {
  TrangChu: undefined;
  QuetQR: undefined;
  SuCoCuaToi: undefined;
  ThongBao: undefined;
  TaiKhoan: undefined;
};

export type ThamSoTabKyThuatVien = {
  CongViec: undefined;
  QuetQR: undefined;
  BaoTri: undefined;
  ThongBao: undefined;
  TaiKhoan: undefined;
};

export interface DuLieuHoanThanhDieuHuong {
  nguyenNhan: string;
  cachXuLy: string;
  ketQua: KetQuaSuaChua;
  ghiChu: string;
  linhKienThayThe: LinhKienThayThe[];
}

export type ThamSoDieuHuongGoc = {
  NhanVien: NavigatorScreenParams<ThamSoTabNhanVien> | undefined;
  KyThuatVien: NavigatorScreenParams<ThamSoTabKyThuatVien> | undefined;
  NhapMaThietBi: undefined;
  ChiTietThietBi: { thietBi: ThietBi };
  BaoSuCo: { thietBi: ThietBi };
  BaoSuCoThanhCong: { suCo: SuCo };
  ChiTietSuCo: { suCoId: number };
  ChiTietCongViec: { congViecId: number };
  XuLyCongViec: { congViecId: number };
  HoanThanhSuaChua: { congViecId: number };
  KetQuaCongViec: {
    congViec: SuCo;
    duLieuHoanThanh: DuLieuHoanThanhDieuHuong;
  };
  ChiTietBaoTri: { phieuBaoTriId: number };
  ThucHienBaoTri: { phieuBaoTriId: number };
  KetQuaBaoTri: { phieuBaoTri: PhieuBaoTri };
  DoiMatKhau: undefined;
};
