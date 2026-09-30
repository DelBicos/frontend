// Mocks globais para modulos nativos indisponiveis no ambiente de teste.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
