import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: [
      "**/node_modules/**", 
      "**/build/**", 
      "**/*.test.*",
      "**/*.test.js",
      "**/*.test.jsx",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/__tests__/**"
    ],
  },
  {languageOptions: { globals: globals.browser }},
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
];