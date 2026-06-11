/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.ts',
    'expo-sqlite/localStorage/install': '<rootDir>/__mocks__/expo-sqlite-localStorage.ts',
    'react-native': '<rootDir>/__mocks__/react-native.ts',
  },
};
