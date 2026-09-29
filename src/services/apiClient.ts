import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnhDaChon, PhanHoiApi } from '../types';

const KHOA_TOKEN = '@factorycare/token';
const THOI_GIAN_CHO_TOI_DA = 15000;
const THOI_GIAN_CHO_UPLOAD_TOI_DA = 90000;

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

export function taoDiaChiTaiNguyen(duongDan?: string | null) {
  if (!duongDan) return undefined;
  if (/^https?:\/\//i.test(duongDan)) return duongDan;
  try {
    const diaChiMayChu = layDiaChiApi().replace(/\/api\/?$/i, '');
    return `${diaChiMayChu}${duongDan.startsWith('/') ? '' : '/'}${duongDan}`;
  } catch {
    return undefined;
  }
}

function layLoaiTepAnh(anh: AnhDaChon) {
  if (anh.loaiTep?.startsWith('image/')) return anh.loaiTep;
  const duongDan = anh.uri.toLowerCase();
  if (duongDan.includes('.png')) return 'image/png';
  if (duongDan.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export function themAnhVaoFormData(
  formData: FormData,
  tenTruong: string,
  danhSachAnh: AnhDaChon[],
) {
  danhSachAnh.forEach((anh, chiSo) => {
    const loaiTep = layLoaiTepAnh(anh);
    const duoiTep = loaiTep === 'image/png' ? 'png' : loaiTep === 'image/webp' ? 'webp' : 'jpg';
    const tenTep = anh.tenTep?.trim() || `anh-${Date.now()}-${chiSo + 1}.${duoiTep}`;
    formData.append(
      tenTruong,
      { uri: anh.uri, name: tenTep, type: loaiTep } as unknown as Blob,
    );
  });
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

async function goiApiTaiAnh<T>(
  duongDan: string,
  formData: FormData,
  tuyChon: TuyChonYeuCau,
) {
  const token = tuyChon.boQuaXacThuc ? null : await layToken();

  return new Promise<T>((resolve, reject) => {
    const yeuCau = new XMLHttpRequest();
    yeuCau.open(
      tuyChon.method ?? 'POST',
      `${layDiaChiApi()}${duongDan}`,
      true,
    );
    yeuCau.timeout = THOI_GIAN_CHO_UPLOAD_TOI_DA;

    const headers = new Headers(tuyChon.headers);
    headers.set('Accept', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.forEach((giaTri, tenHeader) => {
      if (tenHeader.toLowerCase() !== 'content-type') {
        yeuCau.setRequestHeader(tenHeader, giaTri);
      }
    });

    yeuCau.onload = () => {
      let noiDung: Record<string, unknown> = {};
      try {
        noiDung = yeuCau.responseText ? JSON.parse(yeuCau.responseText) : {};
      } catch {
        reject(
          new LoiApi('Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.'),
        );
        return;
      }

      if (yeuCau.status < 200 || yeuCau.status >= 300 || noiDung.thanhCong === false) {
        if (yeuCau.status === 401 && !tuyChon.boQuaXacThuc) {
          xuLyHetHan?.();
        }
        reject(
          new LoiApi(
            layThongBaoLoi(
              yeuCau.status,
              typeof noiDung.thongBao === 'string'
                ? noiDung.thongBao
                : undefined,
            ),
            yeuCau.status,
            (noiDung.loi ?? noiDung.loiTruong) as
              | Record<string, string>
              | undefined,
          ),
        );
        return;
      }

      resolve((noiDung as unknown as PhanHoiApi<T>).duLieu);
    };
    yeuCau.onerror = () => {
      reject(
        new LoiApi(
          'Không thể tải ảnh lên máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
        ),
      );
    };
    yeuCau.ontimeout = () => {
      reject(
        new LoiApi(
          'Tải ảnh mất quá nhiều thời gian. Vui lòng thử lại với kết nối ổn định hơn.',
        ),
      );
    };
    yeuCau.onabort = () => {
      reject(new LoiApi('Yêu cầu tải ảnh đã bị hủy. Vui lòng thử lại.'));
    };
    yeuCau.send(formData);
  });
}

export async function goiApi<T>(duongDan: string, tuyChon: TuyChonYeuCau = {}) {
  const laFormData = tuyChon.body instanceof FormData;
  if (laFormData) {
    return goiApiTaiAnh<T>(duongDan, tuyChon.body as FormData, tuyChon);
  }
  const boDieuKhien = new AbortController();
  const boDem = setTimeout(() => boDieuKhien.abort(), THOI_GIAN_CHO_TOI_DA);

  try {
    const token = tuyChon.boQuaXacThuc ? null : await layToken();
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
    if (boDieuKhien.signal.aborted) {
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
