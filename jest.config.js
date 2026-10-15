module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|zustand)',
  ],

  moduleNameMapper: {
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },

  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/.expo/',
  ],

  clearMocks: true,

  testTimeout: 15000,

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.web.tsx',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/**/styles.ts',
    '!src/theme/**',
    '!src/config/**',
    '!src/assets/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};