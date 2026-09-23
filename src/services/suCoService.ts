import type {
  DanhSachPhanTrang,
  MucDoSuCo,
  SuCo,
  TrangThaiSuCo,
} from '../types';
import { goiApi } from './apiClient';

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

export function taoSuCo(duLieuTao: DuLieuTaoSuCo) {
  return goiApi<SuCo>('/su-co', {
    method: 'POST',
    body: duLieuTao,
  });
}
