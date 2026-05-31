module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s'],
  clearMocks: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'frontend/js/**/*.js',
    '!frontend/js/**/__tests__/**'
  ]
};
