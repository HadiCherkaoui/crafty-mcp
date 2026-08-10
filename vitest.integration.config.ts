// SPDX-FileCopyrightText: Hadi Cherkaoui <contact@hide.cherkaoui.ch>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    globals: false,
    globalSetup: [
      "tests/integration/globalSetup.ts",
      "tests/integration/globalTeardown.ts",
    ],
    testTimeout: 30000,
    hookTimeout: 60000,
    pool: "forks",
  },
});
