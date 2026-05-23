module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(test).[jt]s'],
  clearMocks: true,
  collectCoverageFrom: [
    'Backend/src/**/*.js',
    'frontend/js/**/*.js',
    '!Backend/src/**/__tests__/**',
    '!frontend/js/**/__tests__/**'
  ]
};
