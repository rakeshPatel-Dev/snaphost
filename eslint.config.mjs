import { defineConfig, globalIgnores } from 'eslint/config'
import boundaries from 'eslint-plugin-boundaries'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'server', pattern: 'lib/server/*' },
        { type: 'client', pattern: 'components/*' },
        { type: 'shared', pattern: 'lib/*' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { types: { anyOf: ['client', 'shared'] } } },
              disallow: { to: { element: { type: 'server' } } },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['app/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/lib/server/*'],
              message: 'Server-only modules cannot be imported from app UI files.',
            },
          ],
        },
      ],
    },
  },
])

export default eslintConfig
