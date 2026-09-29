import type { SuCo } from '../src/types';
import {
  coLoiHoanThanh,
  kiemTraHoanThanhSuaChua,
  layHoSoSuaChuaCuoi,
  sapXepCongViec,
} from '../src/utils/nghiepVuCongViec';

function taoCongViec(
  id: number,
  mucDo: SuCo['mucDo'],
  trangThai: SuCo['trangThai'],
): SuCo {
  return {
    id,
    maSuCo: `SC-${id}`,
    tieuDe: `Công việc ${id}`,
    moTa: 'Mô tả',
    mucDo,
    trangThai,
    thoiGianBao: `2026-09-${String(id).padStart(2, '0')}T08:00:00+07:00`,
  };
}

describe('nghiệp vụ công việc kỹ thuật viên', () => {
  test('ưu tiên công việc khẩn cấp trước trạng thái', () => {
    const danhSach = [
      taoCongViec(1, 'CAO', 'DANG_XU_LY'),
      taoCongViec(2, 'NGHIEM_TRONG', 'DA_PHAN_CONG'),
      taoCongViec(3, 'THAP', 'DA_XU_LY'),
    ];

    expect(sapXepCongViec(danhSach).map(congViec => congViec.id)).toEqual([
      2, 1, 3,
    ]);
  });

  test('sau khẩn cấp ưu tiên công việc đang xử lý trước việc mới', () => {
    const danhSach = [
      taoCongViec(1, 'CAO', 'DA_PHAN_CONG'),
      taoCongViec(2, 'THAP', 'DANG_XU_LY'),
    ];

    expect(sapXepCongViec(danhSach).map(congViec => congViec.id)).toEqual([
      2, 1,
    ]);
  });

  test('báo lỗi gần từng trường khi dữ liệu hoàn thành chưa hợp lệ', () => {
    const loi = kiemTraHoanThanhSuaChua({
      nguyenNhan: '   ',
      cachXuLy: '',
      ketQua: undefined,
      linhKienThayThe: [{ tenLinhKien: '', soLuong: 0, donVi: 'cái' }],
    });

    expect(coLoiHoanThanh(loi)).toBe(true);
    expect(loi.nguyenNhan).toBeDefined();
    expect(loi.cachXuLy).toBeDefined();
    expect(loi.ketQua).toBeDefined();
    expect(loi.linhKienThayThe?.[0]).toBeDefined();
  });

  test('chấp nhận kết quả hoàn thành hợp lệ không có linh kiện', () => {
    const loi = kiemTraHoanThanhSuaChua({
      nguyenNhan: 'Vòng bi bị mòn',
      cachXuLy: 'Thay vòng bi và căn chỉnh trục',
      ketQua: 'DA_SUA_XONG',
      linhKienThayThe: [],
    });

    expect(coLoiHoanThanh(loi)).toBe(false);
  });

  test('đọc hồ sơ cuối từ đúng trường danh sách của API', () => {
    const congViec = taoCongViec(1, 'CAO', 'DA_XU_LY');
    congViec.danhSachHoSoSuaChua = [
      { id: 10, ghiChu: 'Lần đầu' },
      { id: 11, ghiChu: 'Đã chạy thử ổn định' },
    ];

    expect(layHoSoSuaChuaCuoi(congViec)?.id).toBe(11);
  });
});
