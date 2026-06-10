/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Sólo ejecuta los archivos dentro de __tests__ o con sufijo .test.ts
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  // Transforma TS con ts-jest
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // Relajamos algunos checks para tests (no necesitamos expo-env.d.ts etc.)
        strict: true,
        esModuleInterop: true,
      },
    }],
  },
  // Módulos nativos de React Native que no existen en Node: los mockeamos
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    'expo-sqlite/localStorage/install': '<rootDir>/__mocks__/expo-sqlite-localStorage.ts',
    'react-native': '<rootDir>/__mocks__/react-native.ts',
  },
};
