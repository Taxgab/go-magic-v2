import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  // Proporciona el path a tu app Next.js
  dir: './',
})

// Configuración personalizada de Jest
const config: Config = {
  // Entorno de testing para DOM
  testEnvironment: 'jest-environment-jsdom',

  // Setup inicial antes de los tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Patrones de archivos de test
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],

  // Módulos a ignorar en la transformación
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Module Name Mapper para path aliases de Next.js
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/app/**/page.tsx', // Excluir Server Components
    '!src/app/**/layout.tsx',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Limpia mocks entre tests
  clearMocks: true,

  // Muestra cobertura en resumen
  coverageReporters: ['text-summary', 'lcov'],
}

// createJestConfig exporta un async function que envuelve la config de Next.js
export default createJestConfig(config)
