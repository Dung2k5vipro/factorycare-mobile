import type {
  DanhSachPhanTrang,
  AnhDaChon,
  MucDoSuCo,
  SuCo,
  TrangThaiSuCo,
} from '../types';
import { goiApi, themAnhVaoFormData } from './apiClient';

export interface BoLocSuCo {
  trang?: number;
  gioiHan?: number;
  trangThai?: TrangThaiSuCo;
  thietBiId?: number;
}

export function layDanhSachSuCoCuaToi(boLoc: BoLocSuCo = {}) {
  const thamSo = new URLSearchParams({
    trang: String(boLoc.trang ?? 1),
    gioiHan: String(boLoc.gioiHan ?? 20),
  });
  if (boLoc.trangThai) {
    thamSo.set('trangThai', boLoc.trangThai);
  }
  if (boLoc.thietBiId) {
    thamSo.set('thietBiId', String(boLoc.thietBiId));
  }
  return goiApi<DanhSachPhanTrang<SuCo>>(`/su-co/cua-toi?${thamSo}`);
}

export function layChiTietSuCo(id: number) {
  return goiApi<SuCo>(`/su-co/cua-toi/${id}`);
}

export interface DuLieuTaoSuCo {
  thietBiId: number;
  tieuDe: string;
  moTa: string;
  mucDo: MucDoSuCo;
  thoiGianXayRa?: string;
  hinhAnh?: string[];
}

export function taoSuCo(
  duLieuTao: DuLieuTaoSuCo,
  danhSachAnh: AnhDaChon[] = [],
) {
  if (danhSachAnh.length) {
    const formData = new FormData();
    formData.append('thietBiId', String(duLieuTao.thietBiId));
    formData.append('tieuDe', duLieuTao.tieuDe);
    formData.append('moTa', duLieuTao.moTa);
    formData.append('mucDo', duLieuTao.mucDo);
    if (duLieuTao.thoiGianXayRa) {
      formData.append('thoiGianXayRa', duLieuTao.thoiGianXayRa);
    }
    themAnhVaoFormData(formData, 'hinhAnh', danhSachAnh);
    return goiApi<SuCo>('/su-co', { method: 'POST', body: formData });
  }
  return goiApi<SuCo>('/su-co', {
    method: 'POST',
    body: duLieuTao,
  });
}
