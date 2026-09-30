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

export type TrangThaiPhieuBaoTri =
  | 'CHO_THUC_HIEN'
  | 'DANG_THUC_HIEN'
  | 'HOAN_THANH'
  | 'QUA_HAN'
  | 'DA_HUY';

export type TrangThaiHangMucBaoTri = 'TOT' | 'KHONG_TOT' | 'KHONG_AP_DUNG';

export interface HangMucBaoTri {
  noiDung: string;
  loai?: string;
  trangThai?: TrangThaiHangMucBaoTri;
  ghiChu?: string | null;
  batBuoc?: boolean;
  choPhepKhongApDung?: boolean;
}

export interface LinhKienBaoTri {
  ten: string;
  soLuong: number;
}

export interface MauChecklistBaoTri {
  id?: number;
  tenMau?: string;
  danhSachHangMuc?: Array<HangMucBaoTri | string>;
}

export interface KeHoachBaoTri {
  id?: number;
  moTa?: string | null;
  mauChecklist?: MauChecklistBaoTri | null;
}

export interface PhieuBaoTri {
  id: number;
  maPhieu?: string | null;
  ngayDuKien: string;
  thoiGianBatDau?: string | null;
  thoiGianHoanThanh?: string | null;
  trangThai: TrangThaiPhieuBaoTri;
  ketQuaChecklist?: HangMucBaoTri[] | null;
  linhKienThayThe?: LinhKienBaoTri[] | null;
  ketQuaBaoTri?: string | null;
  ghiChu?: string | null;
  trangThaiThietBi?: TrangThaiThietBi | null;
  thietBi?: ThietBi | null;
  keHoachBaoTri?: KeHoachBaoTri | null;
  mauChecklist?: MauChecklistBaoTri | null;
  danhSachHangMuc?: Array<HangMucBaoTri | string> | null;
  moTa?: string | null;
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

export type LoaiThongBao = 'SU_CO' | 'PHAN_CONG' | 'BAO_TRI' | 'HE_THONG';

export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: LoaiThongBao;
  doiTuongLienQuanId?: number | null;
  daDoc: boolean;
  ngayTao: string;
  ngayDoc?: string | null;
}

export interface DanhSachThongBao extends DanhSachPhanTrang<ThongBao> {
  tongChuaDoc: number;
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
  soSerial?: string | null;
  model?: string | null;
  hangSanXuat?: string | null;
  moTa?: string | null;
  ngayBatDauBaoHanh?: string | null;
  ngayHetBaoHanh?: string | null;
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
  | 'CHO_LINH_KIEN'
  | 'CHO_XAC_NHAN'
  | 'DA_XU_LY'
  | 'DA_HUY';

export interface HoSoSuaChua {
  id?: number;
  nguyenNhan?: string | null;
  cachXuLy?: string | null;
  linhKienThayThe?: LinhKienThayThe[] | null;
  ketQua?: KetQuaSuaChua | null;
  ghiChu?: string | null;
  hinhAnhSuaChua?: string[] | null;
  thoiGianBatDau?: string | null;
  thoiGianHoanThanh?: string | null;
}

export type KetQuaSuaChua = 'DA_SUA_XONG' | 'SUA_MOT_PHAN' | 'KHONG_SUA_DUOC';

export interface LinhKienThayThe {
  tenLinhKien: string;
  soLuong: number;
  donVi?: string | null;
  ghiChu?: string | null;
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
  nguoiBao?: Pick<NguoiDung, 'id' | 'hoTen'> | null;
  kyThuatVien?: Pick<NguoiDung, 'id' | 'hoTen'> | null;
  thietBi?: ThietBi | null;
  hoSoSuaChua?: HoSoSuaChua | HoSoSuaChua[] | null;
  danhSachHoSoSuaChua?: HoSoSuaChua[] | null;
  ketQuaSuaChua?: HoSoSuaChua | null;
  coTheNhanKhanCap?: boolean;
  lyDoChoLinhKien?: string | null;
  ghiChuChoLinhKien?: string | null;
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
