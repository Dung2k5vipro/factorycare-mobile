import type {
  DanhSachPhanTrang,
  AnhDaChon,
  HoSoSuaChua,
  KetQuaSuaChua,
  LinhKienThayThe,
  MucDoSuCo,
  SuCo,
  TrangThaiSuCo,
} from '../types';
import { goiApi, themAnhVaoFormData } from './apiClient';

export interface BoLocCongViec {
  trang?: number;
  gioiHan?: number;
  trangThai?: TrangThaiSuCo;
  mucDo?: MucDoSuCo;
  thietBiId?: number;
}

export interface DuLieuSuaChua {
  nguyenNhan?: string;
  cachXuLy?: string;
  linhKienThayThe?: LinhKienThayThe[];
  ketQua?: KetQuaSuaChua;
  ghiChu?: string;
}

export interface DanhSachHoSoSuaChua {
  danhSach: HoSoSuaChua[];
}

function taoBodySuaChua(
  duLieu: DuLieuSuaChua,
  danhSachAnh: AnhDaChon[],
) {
  if (!danhSachAnh.length) return duLieu;
  const formData = new FormData();
  Object.entries(duLieu).forEach(([tenTruong, giaTri]) => {
    if (giaTri === undefined) return;
    formData.append(
      tenTruong,
      typeof giaTri === 'string' ? giaTri : JSON.stringify(giaTri),
    );
  });
  themAnhVaoFormData(formData, 'hinhAnhSuaChua', danhSachAnh);
  return formData;
}

function taoThamSoCongViec(boLoc: BoLocCongViec) {
  const thamSo = new URLSearchParams({
    trang: String(boLoc.trang ?? 1),
    gioiHan: String(boLoc.gioiHan ?? 20),
  });
  if (boLoc.trangThai) thamSo.set('trangThai', boLoc.trangThai);
  if (boLoc.mucDo) thamSo.set('mucDo', boLoc.mucDo);
  if (boLoc.thietBiId) thamSo.set('thietBiId', String(boLoc.thietBiId));
  return thamSo;
}

export function layDanhSachCongViecCuaToi(boLoc: BoLocCongViec = {}) {
  const thamSo = taoThamSoCongViec(boLoc);
  return goiApi<DanhSachPhanTrang<SuCo>>(`/su-co/cong-viec-cua-toi?${thamSo}`);
}

export function layChiTietCongViec(id: number) {
  return goiApi<SuCo>(`/su-co/cong-viec-cua-toi/${id}`);
}

export function batDauXuLyCongViec(id: number) {
  return goiApi<SuCo>(`/su-co/${id}/bat-dau-xu-ly`, { method: 'PATCH' });
}

export function capNhatHoSoSuaChua(
  id: number,
  duLieu: DuLieuSuaChua,
  danhSachAnh: AnhDaChon[] = [],
) {
  return goiApi<HoSoSuaChua>(`/su-co/${id}/sua-chua`, {
    method: 'PATCH',
    body: taoBodySuaChua(duLieu, danhSachAnh),
  });
}

export function layHoSoSuaChua(id: number) {
  return goiApi<DanhSachHoSoSuaChua>(`/su-co/${id}/ho-so-sua-chua`);
}

export function hoanThanhCongViec(
  id: number,
  duLieu: DuLieuSuaChua,
  danhSachAnh: AnhDaChon[] = [],
) {
  return goiApi<HoSoSuaChua | SuCo>(`/su-co/${id}/hoan-thanh`, {
    method: 'POST',
    body: taoBodySuaChua(duLieu, danhSachAnh),
  });
}

export function nhanCongViecKhanCap(id: number) {
  return goiApi<SuCo>(`/su-co/${id}/nhan-cong-viec`, { method: 'PATCH' });
}

export function chuyenChoLinhKien(id: number, lyDo: string, ghiChu?: string) {
  return goiApi<SuCo>(`/su-co/${id}/cho-linh-kien`, {
    method: 'PATCH',
    body: { lyDo, ghiChu },
  });
}

export function tiepTucXuLyCongViec(id: number) {
  return goiApi<SuCo>(`/su-co/${id}/tiep-tuc-xu-ly`, { method: 'PATCH' });
}
