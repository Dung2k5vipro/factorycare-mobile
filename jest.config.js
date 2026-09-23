module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@expo|expo|expo-modules-core|react-native-safe-area-context|react-native-screens|react-native-svg|lucide-react-native|standard-navigation)/)',
  ],
};
