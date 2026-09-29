import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnhDaChon, KetQuaSuaChua, LinhKienThayThe } from '../types';

const TIEN_TO_KHOA_BAN_NHAP = '@factorycare/ban-nhap-sua-chua/';

export interface BanNhapSuaChua {
  nguyenNhan: string;
  cachXuLy: string;
  ketQua?: KetQuaSuaChua;
  ghiChu: string;
  linhKienThayThe: LinhKienThayThe[];
  danhSachAnh: AnhDaChon[];
}

function layKhoaBanNhap(suCoId: number) {
  return `${TIEN_TO_KHOA_BAN_NHAP}${suCoId}`;
}

export async function luuBanNhapSuaChua(
  suCoId: number,
  banNhap: BanNhapSuaChua,
) {
  await AsyncStorage.setItem(layKhoaBanNhap(suCoId), JSON.stringify(banNhap));
}

export async function layBanNhapSuaChua(suCoId: number) {
  const noiDung = await AsyncStorage.getItem(layKhoaBanNhap(suCoId));
  if (!noiDung) return undefined;
  try {
    return JSON.parse(noiDung) as BanNhapSuaChua;
  } catch {
    await AsyncStorage.removeItem(layKhoaBanNhap(suCoId));
    return undefined;
  }
}

export function xoaBanNhapSuaChua(suCoId: number) {
  return AsyncStorage.removeItem(layKhoaBanNhap(suCoId));
}
