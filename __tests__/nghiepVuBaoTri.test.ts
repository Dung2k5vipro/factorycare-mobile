import type { PhieuBaoTri } from '../src/types';
import {
  coLoiBaoTri,
  kiemTraDuLieuBaoTri,
  layDanhSachHangMucBaoTri,
  sapXepPhieuBaoTri,
} from '../src/utils/nghiepVuBaoTri';

function taoPhieu(
  id: number,
  trangThai: PhieuBaoTri['trangThai'],
  ngayDuKien: string,
): PhieuBaoTri {
  return { id, trangThai, ngayDuKien };
}

describe('nghiệp vụ bảo trì', () => {
  test('sắp xếp quá hạn, hôm nay, sắp tới rồi hoàn thành', () => {
    const homNay = new Date();
    const ngayMai = new Date(homNay);
    ngayMai.setDate(ngayMai.getDate() + 1);
    const danhSach = [
      taoPhieu(1, 'HOAN_THANH', homNay.toISOString()),
      taoPhieu(2, 'CHO_THUC_HIEN', ngayMai.toISOString()),
      taoPhieu(3, 'QUA_HAN', homNay.toISOString()),
      taoPhieu(4, 'CHO_THUC_HIEN', homNay.toISOString()),
    ];

    expect(sapXepPhieuBaoTri(danhSach).map(phieu => phieu.id)).toEqual([
      3, 4, 2, 1,
    ]);
  });

  test('lấy checklist từ mẫu và mặc định hạng mục là bắt buộc', () => {
    const phieu = taoPhieu(1, 'CHO_THUC_HIEN', new Date().toISOString());
    phieu.keHoachBaoTri = {
      mauChecklist: {
        danhSachHangMuc: ['Kiểm tra dầu', { noiDung: 'Kiểm tra dây điện' }],
      },
    };

    expect(layDanhSachHangMucBaoTri(phieu)).toEqual([
      { noiDung: 'Kiểm tra dầu', loai: 'CHECKLIST', batBuoc: true },
      {
        noiDung: 'Kiểm tra dây điện',
        loai: 'CHECKLIST',
        batBuoc: true,
      },
    ]);
  });

  test('gộp kết quả đã lưu mà không làm mất hạng mục chưa xử lý', () => {
    const phieu = taoPhieu(1, 'DANG_THUC_HIEN', new Date().toISOString());
    phieu.danhSachHangMuc = [
      { noiDung: 'Kiểm tra dầu', choPhepKhongApDung: false },
      { noiDung: 'Kiểm tra dây điện', batBuoc: false },
    ];
    phieu.ketQuaChecklist = [
      {
        noiDung: 'Kiểm tra dầu',
        loai: 'CHECKLIST',
        trangThai: 'TOT',
        ghiChu: 'Bình thường',
      },
    ];

    expect(layDanhSachHangMucBaoTri(phieu)).toEqual([
      {
        noiDung: 'Kiểm tra dầu',
        loai: 'CHECKLIST',
        batBuoc: true,
        choPhepKhongApDung: false,
        trangThai: 'TOT',
        ghiChu: 'Bình thường',
      },
      {
        noiDung: 'Kiểm tra dây điện',
        loai: 'CHECKLIST',
        batBuoc: false,
      },
    ]);
  });

  test('báo lỗi tại hạng mục và linh kiện chưa hợp lệ', () => {
    const loi = kiemTraDuLieuBaoTri({
      danhSachHangMuc: [
        { noiDung: 'Kiểm tra dầu', batBuoc: true },
        {
          noiDung: 'Kiểm tra dây điện',
          batBuoc: true,
          trangThai: 'KHONG_TOT',
          ghiChu: ' ',
        },
      ],
      ketQuaBaoTri: '',
      trangThaiThietBi: undefined,
      linhKienThayThe: [{ ten: '', soLuong: 0 }],
    });

    expect(coLoiBaoTri(loi)).toBe(true);
    expect(loi.hangMuc?.[0]).toBeDefined();
    expect(loi.hangMuc?.[1]).toBeDefined();
    expect(loi.ketQuaBaoTri).toBeDefined();
    expect(loi.trangThaiThietBi).toBeDefined();
    expect(loi.linhKienThayThe?.[0]).toBeDefined();
  });

  test('chấp nhận phiếu hoàn thành hợp lệ không thay linh kiện', () => {
    const loi = kiemTraDuLieuBaoTri({
      danhSachHangMuc: [
        {
          noiDung: 'Kiểm tra dầu',
          batBuoc: true,
          trangThai: 'TOT',
        },
      ],
      ketQuaBaoTri: 'Đã vệ sinh và chạy thử ổn định',
      trangThaiThietBi: 'DANG_HOAT_DONG',
      linhKienThayThe: [],
    });

    expect(coLoiBaoTri(loi)).toBe(false);
  });
});
