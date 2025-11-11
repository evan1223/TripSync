// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  projects: [
    '<rootDir>/jest.api.config.ts',
    '<rootDir>/jest.react.config.ts',
  ],
};

export default config;
