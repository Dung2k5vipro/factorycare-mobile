export type VaiTro = 'NHAN_VIEN' | 'KY_THUAT_VIEN' | 'QUAN_TRI_VIEN';

export interface NguoiDung {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai?: string | null;
  anhDaiDien?: string | null;
  vaiTro: VaiTro;
  trangThai?: 'HOAT_DONG' | 'NGUNG_HOAT_DONG';
  maNhanVien?: string | null;
  boPhan?: string | null;
}

export interface PhanTrang {
  trang: number;
  gioiHan: number;
  tongBanGhi: number;
  tongTrang: number;
}

export interface DanhSachPhanTrang<T> {
  danhSach: T[];
  phanTrang?: PhanTrang;
}

export interface ViTri {
  id?: number;
  tenViTri?: string;
  loaiViTri?: string;
  viTriCha?: ViTri | null;
  duongDan?: string[];
}

export interface LoaiThietBi {
  id?: number;
  tenLoai?: string;
}

export type TrangThaiThietBi =
  | 'DANG_HOAT_DONG'
  | 'DANG_BAO_TRI'
  | 'DANG_HONG'
  | 'NGUNG_HOAT_DONG'
  | 'THANH_LY';

export interface ThietBi {
  id: number;
  maThietBi: string;
  tenThietBi: string;
  trangThai: TrangThaiThietBi;
  loaiThietBi?: LoaiThietBi | null;
  tenLoai?: string | null;
  viTri?: ViTri | null;
  tenViTri?: string | null;
  ngayBaoTriTiepTheo?: string | null;
  danhSachSuCoGanDay?: SuCo[];
}

export type MucDoSuCo = 'THAP' | 'TRUNG_BINH' | 'CAO' | 'NGHIEM_TRONG';
export type TrangThaiSuCo =
  | 'MOI'
  | 'DA_PHAN_CONG'
  | 'DANG_XU_LY'
  | 'DA_XU_LY'
  | 'DA_HUY';

export interface HoSoSuaChua {
  ketQua?: string | null;
  ghiChu?: string | null;
  thoiGianHoanThanh?: string | null;
}

export interface SuCo {
  id: number;
  maSuCo: string;
  tieuDe: string;
  moTa: string;
  mucDo: MucDoSuCo;
  trangThai: TrangThaiSuCo;
  thoiGianXayRa?: string | null;
  thoiGianBao?: string | null;
  thoiGianPhanCong?: string | null;
  thoiGianHoanThanh?: string | null;
  ngayTao?: string | null;
  hinhAnh?: string[] | null;
  viTriLucBao?: string | null;
  thietBi?: ThietBi | null;
  hoSoSuaChua?: HoSoSuaChua | HoSoSuaChua[] | null;
}

export interface AnhDaChon {
  uri: string;
  tenTep?: string;
  loaiTep?: string;
  kichThuoc?: number;
}

export interface DuLieuDangNhap {
  nguoiDung: NguoiDung;
  token: string;
}

export interface PhanHoiApi<T> {
  thanhCong: boolean;
  thongBao?: string;
  duLieu: T;
}
