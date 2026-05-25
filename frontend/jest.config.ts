import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  transform: {
    "^.+\\.vue$": ["@vue/vue3-jest", { tsconfig: "tsconfig.json" }],
    "^.+\\.tsx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "<rootDir>/src/__tests__/mocks/styleMock.ts",
    "\\.(png|jpg|jpeg|gif|svg|ico)$": "<rootDir>/src/__tests__/mocks/fileMock.ts",
  },
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "vue", "json"],
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  transformIgnorePatterns: ["/node_modules/(?!(axios)/)"],
};

export default config;
