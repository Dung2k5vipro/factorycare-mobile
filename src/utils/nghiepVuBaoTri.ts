import type {
  HangMucBaoTri,
  LinhKienBaoTri,
  PhieuBaoTri,
  TrangThaiThietBi,
} from '../types';

const THU_TU_TRANG_THAI: Record<string, number> = {
  QUA_HAN: 5,
  DANG_THUC_HIEN: 4,
  CHO_THUC_HIEN: 3,
  HOAN_THANH: 2,
  DA_HUY: 1,
};

function layDauNgay(giaTri: Date) {
  return new Date(
    giaTri.getFullYear(),
    giaTri.getMonth(),
    giaTri.getDate(),
  ).getTime();
}

export function kiemTraNgayHomNay(giaTri?: string | null) {
  if (!giaTri) return false;
  const ngay = new Date(giaTri);
  if (Number.isNaN(ngay.getTime())) return false;
  return layDauNgay(ngay) === layDauNgay(new Date());
}

export function kiemTraNgaySapToi(giaTri?: string | null) {
  if (!giaTri) return false;
  const ngay = new Date(giaTri);
  if (Number.isNaN(ngay.getTime())) return false;
  return layDauNgay(ngay) > layDauNgay(new Date());
}

export function sapXepPhieuBaoTri(danhSachPhieu: PhieuBaoTri[]) {
  return [...danhSachPhieu].sort((phieuA, phieuB) => {
    const thuTuA =
      phieuA.trangThai === 'QUA_HAN'
        ? 6
        : kiemTraNgayHomNay(phieuA.ngayDuKien) &&
          !['HOAN_THANH', 'DA_HUY'].includes(phieuA.trangThai)
        ? 5
        : kiemTraNgaySapToi(phieuA.ngayDuKien) &&
          !['HOAN_THANH', 'DA_HUY'].includes(phieuA.trangThai)
        ? 4
        : THU_TU_TRANG_THAI[phieuA.trangThai] ?? 0;
    const thuTuB =
      phieuB.trangThai === 'QUA_HAN'
        ? 6
        : kiemTraNgayHomNay(phieuB.ngayDuKien) &&
          !['HOAN_THANH', 'DA_HUY'].includes(phieuB.trangThai)
        ? 5
        : kiemTraNgaySapToi(phieuB.ngayDuKien) &&
          !['HOAN_THANH', 'DA_HUY'].includes(phieuB.trangThai)
        ? 4
        : THU_TU_TRANG_THAI[phieuB.trangThai] ?? 0;
    if (thuTuA !== thuTuB) return thuTuB - thuTuA;
    return (
      new Date(phieuA.ngayDuKien).getTime() -
      new Date(phieuB.ngayDuKien).getTime()
    );
  });
}

function chuyenHangMuc(
  hangMuc: HangMucBaoTri | string,
): HangMucBaoTri | undefined {
  if (typeof hangMuc === 'string') {
    return hangMuc.trim()
      ? { noiDung: hangMuc.trim(), loai: 'CHECKLIST', batBuoc: true }
      : undefined;
  }
  if (!hangMuc.noiDung?.trim()) return undefined;
  return {
    ...hangMuc,
    noiDung: hangMuc.noiDung.trim(),
    loai: hangMuc.loai ?? 'CHECKLIST',
    batBuoc: hangMuc.batBuoc !== false,
  };
}

export function layDanhSachHangMucBaoTri(phieu: PhieuBaoTri) {
  const danhSachMau = phieu.danhSachHangMuc?.length
    ? phieu.danhSachHangMuc
    : phieu.mauChecklist?.danhSachHangMuc?.length
    ? phieu.mauChecklist.danhSachHangMuc
    : phieu.keHoachBaoTri?.mauChecklist?.danhSachHangMuc ?? [];
  const danhSachDaChuanHoa = danhSachMau
    .map(chuyenHangMuc)
    .filter((hangMuc): hangMuc is HangMucBaoTri => Boolean(hangMuc));
  const ketQuaDaChuanHoa = (phieu.ketQuaChecklist ?? [])
    .map(chuyenHangMuc)
    .filter((hangMuc): hangMuc is HangMucBaoTri => Boolean(hangMuc));

  if (!danhSachDaChuanHoa.length) return ketQuaDaChuanHoa;
  if (!ketQuaDaChuanHoa.length) return danhSachDaChuanHoa;

  const ketQuaTheoNoiDung = new Map(
    ketQuaDaChuanHoa.map(hangMuc => [hangMuc.noiDung, hangMuc]),
  );
  const danhSachDaGop = danhSachDaChuanHoa.map(hangMuc => ({
    ...hangMuc,
    ...ketQuaTheoNoiDung.get(hangMuc.noiDung),
    batBuoc: hangMuc.batBuoc,
    choPhepKhongApDung: hangMuc.choPhepKhongApDung,
  }));
  const noiDungDaCo = new Set(
    danhSachDaChuanHoa.map(hangMuc => hangMuc.noiDung),
  );

  return [
    ...danhSachDaGop,
    ...ketQuaDaChuanHoa.filter(hangMuc => !noiDungDaCo.has(hangMuc.noiDung)),
  ];
}

export interface DuLieuKiemTraBaoTri {
  danhSachHangMuc: HangMucBaoTri[];
  ketQuaBaoTri: string;
  trangThaiThietBi?: TrangThaiThietBi;
  linhKienThayThe: LinhKienBaoTri[];
}

export interface LoiBaoTri {
  hangMuc?: Record<number, string>;
  ketQuaBaoTri?: string;
  trangThaiThietBi?: string;
  linhKienThayThe?: Record<number, string>;
}

export function kiemTraDuLieuBaoTri(duLieu: DuLieuKiemTraBaoTri): LoiBaoTri {
  const loi: LoiBaoTri = {};
  duLieu.danhSachHangMuc.forEach((hangMuc, chiSo) => {
    if (hangMuc.batBuoc !== false && !hangMuc.trangThai) {
      loi.hangMuc = {
        ...loi.hangMuc,
        [chiSo]: 'Vui lòng chọn kết quả cho hạng mục bắt buộc.',
      };
    } else if (hangMuc.trangThai === 'KHONG_TOT' && !hangMuc.ghiChu?.trim()) {
      loi.hangMuc = {
        ...loi.hangMuc,
        [chiSo]: 'Vui lòng mô tả bất thường phát hiện được.',
      };
    }
  });

  if (!duLieu.ketQuaBaoTri.trim()) {
    loi.ketQuaBaoTri = 'Vui lòng nhập nội dung bảo trì đã thực hiện.';
  }
  if (!duLieu.trangThaiThietBi) {
    loi.trangThaiThietBi = 'Vui lòng chọn tình trạng thiết bị.';
  }
  duLieu.linhKienThayThe.forEach((linhKien, chiSo) => {
    if (!linhKien.ten.trim() || linhKien.soLuong <= 0) {
      loi.linhKienThayThe = {
        ...loi.linhKienThayThe,
        [chiSo]: 'Nhập tên linh kiện và số lượng lớn hơn 0.',
      };
    }
  });
  return loi;
}

export function coLoiBaoTri(loi: LoiBaoTri) {
  return Boolean(
    Object.keys(loi.hangMuc ?? {}).length ||
      loi.ketQuaBaoTri ||
      loi.trangThaiThietBi ||
      Object.keys(loi.linhKienThayThe ?? {}).length,
  );
}
