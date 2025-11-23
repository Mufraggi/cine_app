import * as path from "node:path"
import tsconfigPaths from "vite-tsconfig-paths" // <--- 1. On importe le plugin
import type { UserConfig } from "vitest/config"

// La fonction createAliases et la logique manuelle sont supprimées.
// C'est le plugin qui va lire ton tsconfig.base.json et comprendre
// que @template/domain pointe vers packages/domain/src

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: UserConfig = {
  plugins: [
    tsconfigPaths() // <--- 2. On active le plugin ici
  ],
  esbuild: {
    target: "es2020"
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  // 3. On supprime la section 'resolve: { alias: ... }' car le plugin s'en charge
  test: {
    setupFiles: [path.join(__dirname, "setupTests.ts")],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    include: ["test/**/*.test.ts"],
    // 4. On supprime aussi 'alias: ...' ici
  }
}

export default config
