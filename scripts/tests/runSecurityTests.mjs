import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['--test', 'tests/security/phase2.test.mjs'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    GCLOUD_PROJECT: 'demo-ezonthi-security',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8180',
    FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9299',
  },
});
process.exit(result.status ?? 1);
