import { mauSac } from '../constants/theme';
import type {
  KetQuaSuaChua,
  MucDoSuCo,
  TrangThaiHangMucBaoTri,
  TrangThaiPhieuBaoTri,
  SuCo,
  ThietBi,
  TrangThaiSuCo,
  TrangThaiThietBi,
  ViTri,
} from '../types';

const NHAN_TRANG_THAI_HANG_MUC: Record<TrangThaiHangMucBaoTri, string> = {
  TOT: 'Đạt',
  KHONG_TOT: 'Không đạt',
  KHONG_AP_DUNG: 'Không áp dụng',
};

const NHAN_TRANG_THAI_BAO_TRI: Record<TrangThaiPhieuBaoTri, string> = {
  CHO_THUC_HIEN: 'Chờ thực hiện',
  DANG_THUC_HIEN: 'Đang thực hiện',
  HOAN_THANH: 'Hoàn thành',
  QUA_HAN: 'Quá hạn',
  DA_HUY: 'Đã hủy',
};

const NHAN_KET_QUA_SUA_CHUA: Record<KetQuaSuaChua, string> = {
  DA_SUA_XONG: 'Hoạt động bình thường',
  SUA_MOT_PHAN: 'Cần theo dõi',
  KHONG_SUA_DUOC: 'Không thể vận hành',
};

const NHAN_TRANG_THAI_THIET_BI: Record<TrangThaiThietBi, string> = {
  DANG_HOAT_DONG: 'Đang hoạt động',
  DANG_BAO_TRI: 'Đang bảo trì',
  DANG_HONG: 'Đang có sự cố',
  NGUNG_HOAT_DONG: 'Ngừng hoạt động',
  THANH_LY: 'Đã thanh lý',
};

const NHAN_TRANG_THAI_SU_CO: Record<TrangThaiSuCo, string> = {
  MOI: 'Mới',
  DA_PHAN_CONG: 'Đã phân công',
  DANG_XU_LY: 'Đang xử lý',
  CHO_LINH_KIEN: 'Chờ linh kiện',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_XU_LY: 'Hoàn thành',
  DA_HUY: 'Đã hủy',
};

const NHAN_MUC_DO: Record<MucDoSuCo, string> = {
  THAP: 'Thấp',
  TRUNG_BINH: 'Trung bình',
  CAO: 'Cao',
  NGHIEM_TRONG: 'Khẩn cấp',
};

export function layNhanTrangThaiThietBi(trangThai?: string) {
  return (
    NHAN_TRANG_THAI_THIET_BI[trangThai as TrangThaiThietBi] ?? 'Chưa xác định'
  );
}

export function layNhanTrangThaiSuCo(trangThai?: string) {
  return NHAN_TRANG_THAI_SU_CO[trangThai as TrangThaiSuCo] ?? 'Chưa xác định';
}

export function layNhanMucDo(mucDo?: string) {
  return NHAN_MUC_DO[mucDo as MucDoSuCo] ?? 'Chưa xác định';
}

export function layNhanKetQuaSuaChua(ketQua?: string) {
  return NHAN_KET_QUA_SUA_CHUA[ketQua as KetQuaSuaChua] ?? 'Chưa xác định';
}

export function layNhanTrangThaiBaoTri(trangThai?: string) {
  return (
    NHAN_TRANG_THAI_BAO_TRI[trangThai as TrangThaiPhieuBaoTri] ??
    'Chưa xác định'
  );
}

export function layNhanTrangThaiHangMucBaoTri(trangThai?: string) {
  return (
    NHAN_TRANG_THAI_HANG_MUC[trangThai as TrangThaiHangMucBaoTri] ??
    'Chưa thực hiện'
  );
}

export function layMauTrangThaiBaoTri(trangThai?: string) {
  switch (trangThai) {
    case 'HOAN_THANH':
      return { nen: mauSac.thanhCongNhat, chu: mauSac.thanhCong };
    case 'DANG_THUC_HIEN':
      return { nen: mauSac.thongTinNhat, chu: mauSac.thongTin };
    case 'QUA_HAN':
      return { nen: mauSac.loiNhat, chu: mauSac.loi };
    case 'CHO_THUC_HIEN':
      return { nen: mauSac.canhBaoNhat, chu: mauSac.canhBao };
    default:
      return { nen: mauSac.beMatPhu, chu: mauSac.chuPhu };
  }
}

export function layMauTrangThaiThietBi(trangThai?: string) {
  switch (trangThai) {
    case 'DANG_HOAT_DONG':
      return { nen: mauSac.thanhCongNhat, chu: mauSac.thanhCong };
    case 'DANG_BAO_TRI':
      return { nen: mauSac.canhBaoNhat, chu: mauSac.canhBao };
    case 'DANG_HONG':
    case 'THANH_LY':
      return { nen: mauSac.loiNhat, chu: mauSac.loi };
    default:
      return { nen: mauSac.beMatPhu, chu: mauSac.chuPhu };
  }
}

export function layMauTrangThaiSuCo(trangThai?: string) {
  switch (trangThai) {
    case 'DA_XU_LY':
      return { nen: mauSac.thanhCongNhat, chu: mauSac.thanhCong };
    case 'CHO_XAC_NHAN':
      return { nen: '#FEF3C7', chu: '#D97706' };
    case 'DANG_XU_LY':
    case 'DA_PHAN_CONG':
      return { nen: mauSac.thongTinNhat, chu: mauSac.thongTin };
    case 'CHO_LINH_KIEN':
      return { nen: mauSac.canhBaoNhat, chu: mauSac.canhBao };
    case 'DA_HUY':
      return { nen: mauSac.beMatPhu, chu: mauSac.chuPhu };
    default:
      return { nen: mauSac.canhBaoNhat, chu: mauSac.canhBao };
  }
}

export function layMauMucDo(mucDo?: string) {
  switch (mucDo) {
    case 'NGHIEM_TRONG':
      return { nen: mauSac.loiNhat, chu: mauSac.loi };
    case 'CAO':
      return { nen: '#FFEDD5', chu: '#C2410C' };
    case 'TRUNG_BINH':
      return { nen: mauSac.canhBaoNhat, chu: mauSac.canhBao };
    default:
      return { nen: mauSac.chinhNhat, chu: mauSac.chinh };
  }
}

export function dinhDangNgayGio(giaTri?: string | null) {
  if (!giaTri) {
    return 'Chưa có thông tin';
  }
  const ngay = new Date(giaTri);
  if (Number.isNaN(ngay.getTime())) {
    return 'Chưa có thông tin';
  }
  const haiChuSo = (so: number) => String(so).padStart(2, '0');
  return `${haiChuSo(ngay.getDate())}/${haiChuSo(
    ngay.getMonth() + 1,
  )}/${ngay.getFullYear()} ${haiChuSo(ngay.getHours())}:${haiChuSo(
    ngay.getMinutes(),
  )}`;
}

export function dinhDangNgay(giaTri?: string | null) {
  return dinhDangNgayGio(giaTri).split(' ')[0];
}

export function layTenLoaiThietBi(thietBi: ThietBi) {
  return thietBi.loaiThietBi?.tenLoai ?? thietBi.tenLoai ?? 'Chưa cập nhật';
}

function layChuoiViTri(viTri?: ViTri | null): string[] {
  if (!viTri) {
    return [];
  }
  if (viTri.duongDan?.length) {
    return viTri.duongDan.filter(Boolean);
  }
  const danhSach: string[] = [];
  let viTriHienTai: ViTri | null | undefined = viTri;
  while (viTriHienTai) {
    if (viTriHienTai.tenViTri) {
      danhSach.unshift(viTriHienTai.tenViTri);
    }
    viTriHienTai = viTriHienTai.viTriCha;
  }
  return danhSach;
}

export function layViTriThietBi(thietBi?: ThietBi | null) {
  if (!thietBi) {
    return 'Chưa cập nhật vị trí';
  }
  const danhSachViTri = layChuoiViTri(thietBi.viTri);
  return (
    danhSachViTri.join(' → ') || thietBi.tenViTri || 'Chưa cập nhật vị trí'
  );
}

export function layThoiGianSuCo(suCo: SuCo) {
  return dinhDangNgayGio(
    suCo.thoiGianBao ?? suCo.ngayTao ?? suCo.thoiGianXayRa,
  );
}
