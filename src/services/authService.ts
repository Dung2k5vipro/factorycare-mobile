import type { DuLieuDangNhap, NguoiDung } from '../types';
import { goiApi } from './apiClient';

export function dangNhap(email: string, matKhau: string) {
  return goiApi<DuLieuDangNhap>('/xac-thuc/dang-nhap', {
    method: 'POST',
    body: { email, matKhau },
    boQuaXacThuc: true,
  });
}

export function layNguoiDungHienTai() {
  return goiApi<NguoiDung>('/xac-thuc/toi');
}

export function dangXuat() {
  return goiApi<null>('/xac-thuc/dang-xuat', { method: 'POST' });
}

export function doiMatKhau(matKhauCu: string, matKhauMoi: string) {
  return goiApi<null>('/nguoi-dung/toi/mat-khau', {
    method: 'PATCH',
    body: { matKhauCu, matKhauMoi },
  });
}
