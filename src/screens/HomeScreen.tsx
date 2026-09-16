import { StyleSheet, Text, View } from 'react-native';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>QLSC & QLTB</Text>
      <Text style={styles.title}>Mobile</Text>
      <Text style={styles.description}>
        Bo khung React Native da san sang de phat trien cac man hinh nghiep vu
        sau.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  eyebrow: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#020617',
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    marginTop: 16,
    maxWidth: 420,
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
});
