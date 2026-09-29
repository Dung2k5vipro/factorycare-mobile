import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HangMucBaoTri, LinhKienBaoTri, TrangThaiThietBi } from '../types';

const TIEN_TO_KHOA_BAN_NHAP = '@factorycare/ban-nhap-bao-tri/';

export interface BanNhapBaoTri {
  danhSachHangMuc: HangMucBaoTri[];
  ketQuaBaoTri: string;
  ghiChu: string;
  trangThaiThietBi?: TrangThaiThietBi;
  linhKienThayThe: LinhKienBaoTri[];
}

function layKhoaBanNhap(phieuBaoTriId: number) {
  return `${TIEN_TO_KHOA_BAN_NHAP}${phieuBaoTriId}`;
}

export async function luuBanNhapBaoTri(
  phieuBaoTriId: number,
  banNhap: BanNhapBaoTri,
) {
  await AsyncStorage.setItem(
    layKhoaBanNhap(phieuBaoTriId),
    JSON.stringify(banNhap),
  );
}

export async function layBanNhapBaoTri(phieuBaoTriId: number) {
  const noiDung = await AsyncStorage.getItem(layKhoaBanNhap(phieuBaoTriId));
  if (!noiDung) return undefined;
  try {
    return JSON.parse(noiDung) as BanNhapBaoTri;
  } catch {
    await AsyncStorage.removeItem(layKhoaBanNhap(phieuBaoTriId));
    return undefined;
  }
}

export function xoaBanNhapBaoTri(phieuBaoTriId: number) {
  return AsyncStorage.removeItem(layKhoaBanNhap(phieuBaoTriId));
}
