/* The linter is here to catch the mistakes the other checks cannot see: a
   variable nobody reads, a hook called inside a condition, an effect that
   forgot what it depends on. It has no opinions about layout; that is
   Prettier's job, and the two are kept from arguing by never asking ESLint
   about style at all. */
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  { ignores: ["dist/", "dev-dist/", "node_modules/", "public/"] },

  js.configs.recommended,

  {
    rules: {
      /* A catch that names its error and then ignores it is all over this
         codebase on purpose: localStorage, the clipboard and history can
         each refuse, and the right response is usually to carry on. Each of
         those blocks holds a comment saying so, which is also what keeps
         no-empty quiet. */
      "no-unused-vars": ["error", { caughtErrors: "none", argsIgnorePattern: "^_" }],
    },
  },

  /* The app: browser globals, JSX, React 19's automatic runtime. */
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: { react, "react-hooks": reactHooks },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      /* The two classic hook rules, named rather than taken from the
         plugin's preset, which now also carries React Compiler rules this
         project has not opted into. */
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      /* No PropTypes and no TypeScript here; the components are small and
         their props are documented where they are composed. */
      "react/prop-types": "off",
      /* Nana's words are full of apostrophes and quotation marks, and they
         live in the dictionaries, not in JSX text. */
      "react/no-unescaped-entities": "off",
    },
  },

  /* The tests, the scripts and the config run in Node. */
  {
    files: ["src/**/*.test.js", "scripts/**/*.mjs", "*.js"],
    languageOptions: { globals: globals.node },
  },
];
