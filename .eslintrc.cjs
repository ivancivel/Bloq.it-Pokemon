module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended', // Adiciona o Prettier como regra do ESLint
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Regras personalizadas para o teu conforto:
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Avisa se criares variáveis e não usares
    '@typescript-eslint/no-explicit-any': 'warn', // Avisa se usares 'any' (mas não proíbe, para não bloquear o dev)
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
  },
}