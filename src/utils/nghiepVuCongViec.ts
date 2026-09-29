import type {
  HoSoSuaChua,
  KetQuaSuaChua,
  LinhKienThayThe,
  SuCo,
} from '../types';

export function layHoSoSuaChuaCuoi(
  suCo?: SuCo,
): HoSoSuaChua | undefined {
  if (!suCo) return undefined;
  const danhSach = suCo.danhSachHoSoSuaChua;
  if (danhSach?.length) return danhSach.at(-1);
  if (Array.isArray(suCo.hoSoSuaChua)) return suCo.hoSoSuaChua.at(-1);
  return suCo.hoSoSuaChua ?? undefined;
}

const DO_UU_TIEN_MUC_DO: Record<string, number> = {
  NGHIEM_TRONG: 4,
  CAO: 3,
  TRUNG_BINH: 2,
  THAP: 1,
};

const DO_UU_TIEN_TRANG_THAI: Record<string, number> = {
  DANG_XU_LY: 4,
  CHO_LINH_KIEN: 3,
  DA_PHAN_CONG: 3,
  MOI: 2,
  DA_XU_LY: 1,
  DA_HUY: 0,
};

export function sapXepCongViec(danhSachCongViec: SuCo[]) {
  return [...danhSachCongViec].sort((congViecA, congViecB) => {
    const khanCapA = congViecA.mucDo === 'NGHIEM_TRONG' ? 1 : 0;
    const khanCapB = congViecB.mucDo === 'NGHIEM_TRONG' ? 1 : 0;
    if (khanCapA !== khanCapB) return khanCapB - khanCapA;

    const trangThaiA = DO_UU_TIEN_TRANG_THAI[congViecA.trangThai] ?? 0;
    const trangThaiB = DO_UU_TIEN_TRANG_THAI[congViecB.trangThai] ?? 0;
    if (trangThaiA !== trangThaiB) return trangThaiB - trangThaiA;

    const mucDoA = DO_UU_TIEN_MUC_DO[congViecA.mucDo] ?? 0;
    const mucDoB = DO_UU_TIEN_MUC_DO[congViecB.mucDo] ?? 0;
    if (mucDoA !== mucDoB) return mucDoB - mucDoA;

    const thoiGianA = new Date(
      congViecA.thoiGianBao ?? congViecA.ngayTao ?? 0,
    ).getTime();
    const thoiGianB = new Date(
      congViecB.thoiGianBao ?? congViecB.ngayTao ?? 0,
    ).getTime();
    return thoiGianB - thoiGianA;
  });
}

export interface DuLieuKiemTraHoanThanh {
  nguyenNhan: string;
  cachXuLy: string;
  ketQua?: KetQuaSuaChua;
  linhKienThayThe: LinhKienThayThe[];
}

export interface LoiHoanThanh {
  nguyenNhan?: string;
  cachXuLy?: string;
  ketQua?: string;
  linhKienThayThe?: Record<number, string>;
}

export function kiemTraHoanThanhSuaChua(
  duLieu: DuLieuKiemTraHoanThanh,
): LoiHoanThanh {
  const loi: LoiHoanThanh = {};
  if (!duLieu.nguyenNhan.trim()) {
    loi.nguyenNhan = 'Vui lòng nhập nguyên nhân sự cố.';
  }
  if (!duLieu.cachXuLy.trim()) {
    loi.cachXuLy = 'Vui lòng nhập phương án xử lý.';
  }
  if (!duLieu.ketQua) {
    loi.ketQua = 'Vui lòng chọn tình trạng thiết bị sau xử lý.';
  }

  duLieu.linhKienThayThe.forEach((linhKien, chiSo) => {
    if (!linhKien.tenLinhKien.trim() || linhKien.soLuong <= 0) {
      loi.linhKienThayThe = {
        ...loi.linhKienThayThe,
        [chiSo]: 'Nhập tên linh kiện và số lượng lớn hơn 0.',
      };
    }
  });
  return loi;
}

export function coLoiHoanThanh(loi: LoiHoanThanh) {
  return Boolean(
    loi.nguyenNhan ||
      loi.cachXuLy ||
      loi.ketQua ||
      Object.keys(loi.linhKienThayThe ?? {}).length,
  );
}
