// jest.api.config.ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'api',
  testMatch: ['<rootDir>/__tests__/api/**/*.test.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/database/(.*)$': '<rootDir>/src/database/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;

