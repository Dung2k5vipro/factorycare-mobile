import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { NguoiDung } from '../types';
import {
  dangNhap as goiDangNhap,
  dangXuat as goiDangXuat,
  layNguoiDungHienTai,
} from '../services/authService';
import {
  datXuLyHetHanToken,
  layToken,
  luuToken,
  xoaToken,
} from '../services/apiClient';

interface AuthContextValue {
  nguoiDung: NguoiDung | null;
  dangKhoiTao: boolean;
  dangNhap: (email: string, matKhau: string) => Promise<void>;
  dangXuat: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(null);
  const [dangKhoiTao, setDangKhoiTao] = useState(true);

  const xoaPhien = useCallback(async () => {
    await xoaToken();
    setNguoiDung(null);
  }, []);

  useEffect(() => {
    datXuLyHetHanToken(() => {
      xoaPhien();
    });
    return () => datXuLyHetHanToken(undefined);
  }, [xoaPhien]);

  useEffect(() => {
    async function khoiTaoPhien() {
      try {
        const token = await layToken();
        if (!token) {
          return;
        }
        const nguoiDungDaLuu = await layNguoiDungHienTai();
        if (nguoiDungDaLuu.vaiTro !== 'NHAN_VIEN') {
          await xoaToken();
          return;
        }
        setNguoiDung(nguoiDungDaLuu);
      } catch {
        await xoaToken();
      } finally {
        setDangKhoiTao(false);
      }
    }
    khoiTaoPhien();
  }, []);

  const dangNhap = useCallback(async (email: string, matKhau: string) => {
    const ketQua = await goiDangNhap(email, matKhau);
    if (ketQua.nguoiDung.vaiTro !== 'NHAN_VIEN') {
      throw new Error('Tài khoản này không thuộc vai trò Nhân viên.');
    }
    if (ketQua.nguoiDung.trangThai === 'NGUNG_HOAT_DONG') {
      throw new Error(
        'Tài khoản đã ngừng hoạt động. Vui lòng liên hệ quản trị viên.',
      );
    }
    await luuToken(ketQua.token);
    setNguoiDung(ketQua.nguoiDung);
  }, []);

  const dangXuat = useCallback(async () => {
    try {
      await goiDangXuat();
    } finally {
      await xoaPhien();
    }
  }, [xoaPhien]);

  const giaTri = useMemo(
    () => ({ nguoiDung, dangKhoiTao, dangNhap, dangXuat }),
    [dangKhoiTao, dangNhap, dangXuat, nguoiDung],
  );

  return <AuthContext.Provider value={giaTri}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const giaTri = useContext(AuthContext);
  if (!giaTri) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider.');
  }
  return giaTri;
}
