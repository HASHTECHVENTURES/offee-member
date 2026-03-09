import { defineConfig } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/out/**", "**/build/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        fetch: "readonly",
        FormData: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        Node: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        Blob: "readonly",
        File: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        AbortController: "readonly",
        Promise: "readonly",
        Map: "readonly",
        Set: "readonly",
        Symbol: "readonly",
        Proxy: "readonly",
        Reflect: "readonly",
        ArrayBuffer: "readonly",
        Intl: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Number: "readonly",
        String: "readonly",
        Boolean: "readonly",
        Date: "readonly",
        RegExp: "readonly",
        Error: "readonly",
        Array: "readonly",
        Object: "readonly",
        Function: "readonly",
      },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
    },
  },
  prettier,
]);

export default eslintConfig;
