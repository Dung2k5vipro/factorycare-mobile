import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { boGoc, mauSac } from '../constants/theme';
import type { HangMucBaoTri, TrangThaiHangMucBaoTri } from '../types';
import { OThongTin } from './OThongTin';

interface HangMucChecklistProps {
  hangMuc: HangMucBaoTri;
  soThuTu: number;
  loi?: string;
  onChange: (hangMuc: HangMucBaoTri) => void;
}

const CAC_KET_QUA: {
  giaTri: TrangThaiHangMucBaoTri;
  nhan: string;
}[] = [
  { giaTri: 'TOT', nhan: 'Đạt' },
  { giaTri: 'KHONG_TOT', nhan: 'Không đạt' },
  { giaTri: 'KHONG_AP_DUNG', nhan: 'Không áp dụng' },
];

export function HangMucChecklist({
  hangMuc,
  soThuTu,
  loi,
  onChange,
}: HangMucChecklistProps) {
  const duocChonKhongApDung =
    hangMuc.choPhepKhongApDung === true ||
    hangMuc.trangThai === 'KHONG_AP_DUNG';

  return (
    <View style={[styles.khung, loi && styles.khungLoi]}>
      <View style={styles.dauHangMuc}>
        <View style={styles.soThuTu}>
          <Text style={styles.soThuTuChu}>{soThuTu}</Text>
        </View>
        <View style={styles.noiDungDau}>
          <Text style={styles.noiDung}>{hangMuc.noiDung}</Text>
          {hangMuc.batBuoc !== false ? (
            <Text style={styles.batBuoc}>Bắt buộc</Text>
          ) : (
            <Text style={styles.tuyChon}>Tùy chọn</Text>
          )}
        </View>
      </View>

      <View style={styles.danhSachLuaChon}>
        {CAC_KET_QUA.filter(
          luaChon => luaChon.giaTri !== 'KHONG_AP_DUNG' || duocChonKhongApDung,
        ).map(luaChon => {
          const dangChon = hangMuc.trangThai === luaChon.giaTri;
          return (
            <Pressable
              key={luaChon.giaTri}
              onPress={() =>
                onChange({
                  ...hangMuc,
                  trangThai: luaChon.giaTri,
                  ghiChu:
                    luaChon.giaTri === 'TOT' ? null : hangMuc.ghiChu ?? '',
                })
              }
              style={[
                styles.luaChon,
                dangChon && styles.luaChonDangChon,
                luaChon.giaTri === 'KHONG_TOT' &&
                  dangChon &&
                  styles.luaChonKhongDat,
              ]}
            >
              <Text
                style={[
                  styles.luaChonChu,
                  dangChon && styles.luaChonChuDangChon,
                  luaChon.giaTri === 'KHONG_TOT' &&
                    dangChon &&
                    styles.luaChonChuKhongDat,
                ]}
              >
                {luaChon.nhan}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hangMuc.trangThai === 'KHONG_TOT' ? (
        <OThongTin
          nhan="Mô tả bất thường"
          giaTri={hangMuc.ghiChu ?? ''}
          onChangeText={giaTri => onChange({ ...hangMuc, ghiChu: giaTri })}
          multiline
          placeholder="Mô tả tình trạng không đạt..."
        />
      ) : null}
      {loi ? <Text style={styles.loi}>{loi}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    backgroundColor: mauSac.beMat,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.lon,
    padding: 15,
    gap: 14,
  },
  khungLoi: { borderColor: mauSac.loi },
  dauHangMuc: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  soThuTu: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: mauSac.beMatPhu,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soThuTuChu: { color: mauSac.chuChinh, fontSize: 12, fontWeight: '800' },
  noiDungDau: { flex: 1, gap: 4 },
  noiDung: {
    color: mauSac.chuChinh,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  batBuoc: { color: mauSac.canhBao, fontSize: 11, fontWeight: '700' },
  tuyChon: { color: mauSac.chuPhu, fontSize: 11 },
  danhSachLuaChon: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  luaChon: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: boGoc.tron,
    borderWidth: 1,
    borderColor: mauSac.vien,
    backgroundColor: mauSac.beMat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luaChonDangChon: {
    borderColor: mauSac.chinh,
    backgroundColor: mauSac.chinhNhat,
  },
  luaChonKhongDat: {
    borderColor: mauSac.loi,
    backgroundColor: mauSac.loiNhat,
  },
  luaChonChu: { color: mauSac.chuPhu, fontSize: 13, fontWeight: '600' },
  luaChonChuDangChon: { color: mauSac.chinh },
  luaChonChuKhongDat: { color: mauSac.loi },
  loi: { color: mauSac.loi, fontSize: 13, lineHeight: 18 },
});
