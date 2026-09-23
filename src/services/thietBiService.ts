import type { DanhSachPhanTrang, ThietBi } from '../types';
import { goiApi, LoiApi } from './apiClient';

export function quetMaThietBi(noiDungQr: string) {
  return goiApi<ThietBi>('/thiet-bi/quet-qr', {
    method: 'POST',
    body: { noiDungQr },
  });
}

export async function timThietBiTheoMa(maThietBi: string) {
  const thamSo = new URLSearchParams({
    trang: '1',
    gioiHan: '10',
    tuKhoa: maThietBi,
  });
  const ketQua = await goiApi<DanhSachPhanTrang<ThietBi>>(
    `/thiet-bi?${thamSo}`,
  );
  const thietBi = ketQua.danhSach.find(
    banGhi =>
      banGhi.maThietBi.toLocaleUpperCase() === maThietBi.toLocaleUpperCase(),
  );
  if (!thietBi) {
    throw new LoiApi('Không tìm thấy thiết bị với mã đã nhập.', 404);
  }
  return thietBi;
}

export function layChiTietThietBi(id: number) {
  return goiApi<ThietBi>(`/thiet-bi/${id}`);
}
