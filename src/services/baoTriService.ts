import type {
  DanhSachPhanTrang,
  HangMucBaoTri,
  LinhKienBaoTri,
  PhieuBaoTri,
  TrangThaiPhieuBaoTri,
  TrangThaiThietBi,
} from '../types';
import { goiApi } from './apiClient';

export interface BoLocPhieuBaoTri {
  trang?: number;
  gioiHan?: number;
  trangThai?: TrangThaiPhieuBaoTri;
  thietBiId?: number;
  tuNgay?: string;
  denNgay?: string;
}

export interface DuLieuKetQuaBaoTri {
  linhKienThayThe: LinhKienBaoTri[];
  ketQuaBaoTri: string;
  ghiChu?: string;
}

export interface DuLieuHoanThanhBaoTri extends DuLieuKetQuaBaoTri {
  ketQuaChecklist: HangMucBaoTri[];
  trangThaiThietBi: TrangThaiThietBi;
}

function taoThamSoPhieuBaoTri(boLoc: BoLocPhieuBaoTri) {
  const thamSo = new URLSearchParams({
    trang: String(boLoc.trang ?? 1),
    gioiHan: String(boLoc.gioiHan ?? 20),
  });
  if (boLoc.trangThai) thamSo.set('trangThai', boLoc.trangThai);
  if (boLoc.thietBiId) thamSo.set('thietBiId', String(boLoc.thietBiId));
  if (boLoc.tuNgay) thamSo.set('tuNgay', boLoc.tuNgay);
  if (boLoc.denNgay) thamSo.set('denNgay', boLoc.denNgay);
  return thamSo;
}

export function layDanhSachPhieuBaoTriCuaToi(boLoc: BoLocPhieuBaoTri = {}) {
  const thamSo = taoThamSoPhieuBaoTri(boLoc);
  return goiApi<DanhSachPhanTrang<PhieuBaoTri>>(
    `/bao-tri/phieu/cua-toi?${thamSo}`,
  );
}

export function layChiTietPhieuBaoTri(id: number) {
  return goiApi<PhieuBaoTri>(`/bao-tri/phieu/${id}`);
}

export function batDauPhieuBaoTri(id: number) {
  return goiApi<PhieuBaoTri>(`/bao-tri/phieu/${id}/bat-dau`, {
    method: 'POST',
  });
}

export function luuChecklistBaoTri(
  id: number,
  ketQuaChecklist: HangMucBaoTri[],
) {
  return goiApi<PhieuBaoTri>(`/bao-tri/phieu/${id}/checklist`, {
    method: 'PUT',
    body: { ketQuaChecklist },
  });
}

export function luuKetQuaBaoTri(id: number, duLieu: DuLieuKetQuaBaoTri) {
  return goiApi<PhieuBaoTri>(`/bao-tri/phieu/${id}/ket-qua`, {
    method: 'PUT',
    body: duLieu,
  });
}

export function hoanThanhPhieuBaoTri(
  id: number,
  duLieu: DuLieuHoanThanhBaoTri,
) {
  return goiApi<PhieuBaoTri>(`/bao-tri/phieu/${id}/hoan-thanh`, {
    method: 'POST',
    body: duLieu,
  });
}
