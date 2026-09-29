import type { DanhSachThongBao } from '../types';
import { goiApi } from './apiClient';

export function layDanhSachThongBao(gioiHan = 50) {
  return goiApi<DanhSachThongBao>(
    `/thong-bao?trang=1&gioiHan=${encodeURIComponent(String(gioiHan))}`,
  );
}

export function danhDauThongBaoDaDoc(id: number) {
  return goiApi<{ id: number; daDoc: true }>(`/thong-bao/${id}/da-doc`, {
    method: 'PATCH',
  });
}

export function danhDauTatCaThongBaoDaDoc() {
  return goiApi<{ soLuongDaCapNhat: number }>('/thong-bao/da-doc-tat-ca', {
    method: 'PATCH',
  });
}
