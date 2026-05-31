module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'Backend/src/**/*.js',
    '!Backend/src/**/__tests__/**'
  ]
};
