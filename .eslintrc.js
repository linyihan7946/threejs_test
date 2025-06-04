/*
 * @Author: LinYiHan
 * @Date: 2023-06-26 16:02:31
 * @Description: 
 * @Version: 1.0
 */
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-strongly-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    // 支持空的构造函数
    '@typescript-eslint/no-empty-function': 'off',
    // 不启用自动推断类型
    '@typescript-eslint/no-inferrable-types': 'off',
    // 将const类型提示改为warn，默认是error
    'prefer-const': 'warn',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ]
}