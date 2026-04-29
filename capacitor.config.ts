import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.openmail',
  appName: 'OpenMail',
  webDir: 'out',
  // During development, point the shell at a running server so hot-reload
  // works. Remove / comment this block for a fully-bundled release build.
  server:
    process.env.CAP_SERVER_URL
      ? {
          url: process.env.CAP_SERVER_URL,
          cleartext: true,
        }
      : undefined,
  android: {
    buildOptions: {
      keystorePath: undefined,   // filled in for signed release builds
      releaseType: 'APK',
    },
  },
  plugins: {
    CapacitorHttp: {
      // Native HTTP plugin — bypasses WebView CORS for direct AI API calls
      enabled: true,
    },
  },
};

export default config;
