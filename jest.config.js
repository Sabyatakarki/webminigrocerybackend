module.exports = {
  preset: 'ts-jest/presets/js-with-ts', // better for mixing TS + ESM
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/__tests__/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  transform: {
    '^.+\\.ts?$': ['ts-jest', { useESM: true }], 
  },

  transformIgnorePatterns: [
    "node_modules/(?!(uuid|multer|jsonwebtoken)/)", 
  ],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', 
  },
};