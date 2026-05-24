import React, { createContext, useContext, useState } from "react";
import api from "../api/client";

export type NguoiDungSession = {
  idNguoiDung: number;
  tenDangNhap: string;
  email: string;
  vaiTro: string[];
};

type KieuNguCanhXacThuc = {
  user: NguoiDungSession | null;
  refreshSession: () => Promise<void>;
  login: (tenDangNhap: string, matKhau: string) => Promise<void>;
  register: (data: {
    tenDangNhap: string;
    matKhau: string;
    email: string;
    hoTen: string;
    soDienThoai?: string;
    loaiTaiKhoan?: string;
  }) => Promise<void>;
  logout: () => void;
  isQuanTri: boolean;
  isLeTan: boolean;
  isVangLai: boolean;
  isBuongPhong: boolean;
  isKhachHang: boolean;
};

const NguCanhXacThuc = createContext<KieuNguCanhXacThuc | null>(null);

export function NhaCungCapXacThuc({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NguoiDungSession | null>(() => {
    try {
      const t = localStorage.getItem("tokenTruyCap");
      const u = localStorage.getItem("nguoiDung");
      if (t && u) return JSON.parse(u) as NguoiDungSession;
    } catch {}
    return null;
  });

  const login = async (tenDangNhap: string, matKhau: string) => {
    const { data } = await api.post("/xac-thuc/dang-nhap", {
      tenDangNhap,
      matKhau,
    });
    localStorage.setItem("tokenTruyCap", data.tokenTruyCap);
    if (data.tokenLamMoi)
      localStorage.setItem("tokenLamMoi", data.tokenLamMoi);
    const u: NguoiDungSession = {
      idNguoiDung: data.idNguoiDung,
      tenDangNhap: data.tenDangNhap,
      email: data.email,
      vaiTro: data.vaiTro || [],
    };
    localStorage.setItem("nguoiDung", JSON.stringify(u));
    setUser(u);
  };

  const register = async (data: {
    tenDangNhap: string;
    matKhau: string;
    email: string;
    hoTen: string;
    soDienThoai?: string;
    loaiTaiKhoan?: string;
  }) => {
    const res = await api.post("/xac-thuc/dang-ky", data);
    const d = res.data;
    localStorage.setItem("tokenTruyCap", d.tokenTruyCap);
    if (d.tokenLamMoi) localStorage.setItem("tokenLamMoi", d.tokenLamMoi);
    const u: NguoiDungSession = {
      idNguoiDung: d.idNguoiDung,
      tenDangNhap: d.tenDangNhap,
      email: d.email,
      vaiTro: d.vaiTro || [],
    };
    localStorage.setItem("nguoiDung", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("tokenTruyCap");
    localStorage.removeItem("tokenLamMoi");
    localStorage.removeItem("nguoiDung");
    setUser(null);
  };

  const refreshSession = async () => {
    const t = localStorage.getItem("tokenTruyCap");
    if (!t) return;
    try {
      const { data } = await api.get("/xac-thuc/toi");
      if (!data.idNguoiDung) return;
      const u: NguoiDungSession = {
        idNguoiDung: data.idNguoiDung,
        tenDangNhap: data.tenDangNhap,
        email: data.email,
        vaiTro: data.vaiTro || [],
      };
      localStorage.setItem("nguoiDung", JSON.stringify(u));
      setUser(u);
    } catch {
      logout();
    }
  };

  const isQuanTri = !!user?.vaiTro?.includes("ROLE_QUAN_TRI");
  const isLeTan =
    !!user?.vaiTro?.includes("ROLE_LE_TAN") || isQuanTri;
  const isVangLai = !!user?.vaiTro?.includes("ROLE_VANG_LAI");
  const isBuongPhong = !!user?.vaiTro?.includes("ROLE_BUONG_PHONG");
  const isKhachHang = !!user?.vaiTro?.includes("ROLE_KHACH_HANG");

  return (
    <NguCanhXacThuc.Provider
      value={{
        user,
        refreshSession,
        login,
        register,
        logout,
        isQuanTri,
        isLeTan,
        isVangLai,
        isBuongPhong,
        isKhachHang,
      }}
    >
      {children}
    </NguCanhXacThuc.Provider>
  );
}

export function dungXacThuc() {
  const ctx = useContext(NguCanhXacThuc);
  if (!ctx) throw new Error("dungXacThuc phải nằm trong NhaCungCapXacThuc");
  return ctx;
}
