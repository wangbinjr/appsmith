import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 30000,
  requestTimeout: 21000,
  responseTimeout: 30000,
  pageLoadTimeout: 30000,
  videoUploadOnPasses: false,
  videoCompression: false,
  numTestsKeptInMemory: 5,
  experimentalMemoryManagement : true,
  reporterOptions: {
    reportDir: "results",
    overwrite: false,
    html: true,
    json: false,
  },
  chromeWebSecurity: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  retries: {
    runMode: 1,
    openMode: 0,
  },
  e2e: {
    baseUrl: "http://localhost/",
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    experimentalSessionAndOrigin : true,
    specPattern: "cypress/e2e/**/*.{js,ts}",
    testIsolation: false,
  },
});
