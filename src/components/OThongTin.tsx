import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { boGoc, kichThuocCham, mauSac } from '../constants/theme';

interface OThongTinProps extends Omit<TextInputProps, 'style'> {
  nhan: string;
  giaTri: string;
  onChangeText: (giaTri: string) => void;
  loi?: string;
  laMatKhau?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export function OThongTin({
  nhan,
  giaTri,
  onChangeText,
  loi,
  laMatKhau = false,
  ...props
}: OThongTinProps) {
  const [hienMatKhau, setHienMatKhau] = useState(false);

  return (
    <View style={styles.khoi}>
      <Text style={styles.nhan}>{nhan}</Text>
      <View style={[styles.khung, loi ? styles.khungLoi : null]}>
        <TextInput
          {...props}
          accessibilityLabel={nhan}
          value={giaTri}
          onChangeText={onChangeText}
          placeholderTextColor={mauSac.chuPhu}
          secureTextEntry={laMatKhau && !hienMatKhau}
          style={[styles.oNhap, props.multiline ? styles.nhieuDong : null]}
        />
        {laMatKhau ? (
          <Pressable
            accessibilityLabel={hienMatKhau ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            hitSlop={8}
            onPress={() => setHienMatKhau(giaTriHienTai => !giaTriHienTai)}
            style={styles.nutMatKhau}
          >
            {hienMatKhau ? (
              <EyeOff color={mauSac.chuPhu} size={21} />
            ) : (
              <Eye color={mauSac.chuPhu} size={21} />
            )}
          </Pressable>
        ) : null}
      </View>
      {loi ? <Text style={styles.loi}>{loi}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khoi: {
    gap: 7,
  },
  nhan: {
    color: mauSac.chuChinh,
    fontSize: 14,
    fontWeight: '600',
  },
  khung: {
    minHeight: kichThuocCham,
    borderWidth: 1,
    borderColor: mauSac.vien,
    borderRadius: boGoc.vua,
    backgroundColor: mauSac.beMat,
    flexDirection: 'row',
    alignItems: 'center',
  },
  khungLoi: {
    borderColor: mauSac.loi,
  },
  oNhap: {
    flex: 1,
    minHeight: kichThuocCham,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: mauSac.chuChinh,
    fontSize: 16,
  },
  nhieuDong: {
    minHeight: 116,
    textAlignVertical: 'top',
  },
  nutMatKhau: {
    width: kichThuocCham,
    height: kichThuocCham,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loi: {
    color: mauSac.loi,
    fontSize: 13,
    lineHeight: 18,
  },
});
