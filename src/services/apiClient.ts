import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PhanHoiApi } from '../types';

const KHOA_TOKEN = '@factorycare/token';
const THOI_GIAN_CHO_TOI_DA = 15000;

let xuLyHetHan: (() => void) | undefined;

export class LoiApi extends Error {
  maTrangThai: number;
  loiTruong?: Record<string, string>;

  constructor(
    thongBao: string,
    maTrangThai = 0,
    loiTruong?: Record<string, string>,
  ) {
    super(thongBao);
    this.name = 'LoiApi';
    this.maTrangThai = maTrangThai;
    this.loiTruong = loiTruong;
  }
}

export function datXuLyHetHanToken(hamXuLy?: () => void) {
  xuLyHetHan = hamXuLy;
}

export async function luuToken(token: string) {
  await AsyncStorage.setItem(KHOA_TOKEN, token);
}

export async function layToken() {
  return AsyncStorage.getItem(KHOA_TOKEN);
}

export async function xoaToken() {
  await AsyncStorage.removeItem(KHOA_TOKEN);
}

function layDiaChiApi() {
  const diaChiApi = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!diaChiApi) {
    throw new LoiApi('Ứng dụng chưa được cấu hình địa chỉ máy chủ.');
  }
  return diaChiApi.replace(/\/$/, '');
}

function layThongBaoLoi(maTrangThai: number, thongBao?: string) {
  switch (maTrangThai) {
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này.';
    case 404:
      return 'Không tìm thấy dữ liệu.';
    case 409:
      return (
        thongBao ??
        'Dữ liệu đang ở trạng thái không thể thực hiện thao tác này.'
      );
    case 422:
      return thongBao ?? 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.';
    case 400:
      return thongBao ?? 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.';
    default:
      return 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}

export interface TuyChonYeuCau extends Omit<RequestInit, 'body'> {
  body?: unknown;
  boQuaXacThuc?: boolean;
}

export async function goiApi<T>(duongDan: string, tuyChon: TuyChonYeuCau = {}) {
  const boDieuKhien = new AbortController();
  const boDem = setTimeout(() => boDieuKhien.abort(), THOI_GIAN_CHO_TOI_DA);

  try {
    const token = tuyChon.boQuaXacThuc ? null : await layToken();
    const laFormData = tuyChon.body instanceof FormData;
    const headers = new Headers(tuyChon.headers);
    headers.set('Accept', 'application/json');
    if (!laFormData && tuyChon.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const phanHoi = await fetch(`${layDiaChiApi()}${duongDan}`, {
      ...tuyChon,
      body:
        tuyChon.body === undefined || laFormData
          ? (tuyChon.body as RequestInit['body'])
          : JSON.stringify(tuyChon.body),
      headers,
      signal: boDieuKhien.signal,
    });
    const vanBan = await phanHoi.text();
    const noiDung = vanBan ? JSON.parse(vanBan) : {};

    if (!phanHoi.ok || noiDung.thanhCong === false) {
      if (phanHoi.status === 401 && !tuyChon.boQuaXacThuc) {
        xuLyHetHan?.();
      }
      const thongBaoDangNhap =
        tuyChon.boQuaXacThuc && phanHoi.status === 401
          ? 'Email hoặc mật khẩu không đúng.'
          : tuyChon.boQuaXacThuc && phanHoi.status === 403
          ? 'Tài khoản không thể đăng nhập. Vui lòng liên hệ quản trị viên.'
          : undefined;
      throw new LoiApi(
        thongBaoDangNhap ?? layThongBaoLoi(phanHoi.status, noiDung.thongBao),
        phanHoi.status,
        noiDung.loi ?? noiDung.loiTruong,
      );
    }

    return (noiDung as PhanHoiApi<T>).duLieu;
  } catch (loi) {
    if (loi instanceof LoiApi) {
      throw loi;
    }
    if (loi instanceof SyntaxError) {
      throw new LoiApi(
        'Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.',
      );
    }
    if (loi instanceof Error && loi.name === 'AbortError') {
      throw new LoiApi('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.');
    }
    throw new LoiApi(
      'Không thể kết nối máy chủ. Vui lòng kiểm tra Internet và thử lại.',
    );
  } finally {
    clearTimeout(boDem);
  }
}

export function layThongBaoAnToan(loi: unknown) {
  return loi instanceof LoiApi
    ? loi.message
    : 'Có lỗi xảy ra. Vui lòng thử lại.';
}
