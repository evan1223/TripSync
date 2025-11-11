// jest.react.config.ts
import type { Config } from 'jest';

const config: Config = {
  displayName: 'react',
  testMatch: ['<rootDir>/__tests__/app/**/*.test.tsx'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.react.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json', //使用這份 tsconfig 處理 JSX
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
};

export default config;
