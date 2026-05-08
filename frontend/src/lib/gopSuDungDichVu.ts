export type DongSuDungDichVu = {
  id: number;
  idDichVu?: number;
  tenDichVu: string;
  soLuong: number;
  donGia?: number;
  thanhTien?: number;
};

export function gopSuDungDichVuHienThi(
  ds: DongSuDungDichVu[] | undefined | null,
): DongSuDungDichVu[] {
  if (!ds?.length) return [];
  const map = new Map<string, DongSuDungDichVu>();
  for (const d of ds) {
    const idDv = d.idDichVu;
    const key =
      idDv != null && !Number.isNaN(Number(idDv))
        ? `id:${idDv}`
        : `ten:${d.tenDichVu.trim().toLowerCase()}`;
    const sl = Math.max(0, Math.floor(Number(d.soLuong) || 0));
    const tien =
      d.thanhTien != null && !Number.isNaN(Number(d.thanhTien))
        ? Number(d.thanhTien)
        : 0;
    const dg =
      d.donGia != null && !Number.isNaN(Number(d.donGia))
        ? Number(d.donGia)
        : undefined;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, {
        id: d.id,
        idDichVu: idDv,
        tenDichVu: d.tenDichVu,
        soLuong: sl,
        donGia: dg,
        thanhTien: tien,
      });
    } else {
      cur.soLuong += sl;
      cur.thanhTien = (cur.thanhTien ?? 0) + tien;
      if (cur.donGia == null && dg != null) cur.donGia = dg;
    }
  }
  return [...map.values()]
    .map((row) => {
      const t = Number(row.thanhTien ?? 0);
      const sl = Math.max(0, row.soLuong);
      let dg = row.donGia != null ? Number(row.donGia) : NaN;
      if (!Number.isFinite(dg) && sl > 0) dg = t / sl;
      if (!Number.isFinite(dg)) dg = 0;
      return {
        ...row,
        soLuong: sl,
        thanhTien: t,
        donGia: dg,
      };
    })
    .sort((a, b) => a.tenDichVu.localeCompare(b.tenDichVu, "vi"));
}
