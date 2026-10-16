#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    'Usage: node scripts/android/gradlew-runner.mjs <gradle-task> [args...]',
  );
  process.exit(1);
}

const androidDir = resolve(process.cwd(), 'android');
const isWindows = process.platform === 'win32';
const wrapperName = 'gradlew';
const wrapperPath = resolve(androidDir, wrapperName);

if (!existsSync(wrapperPath)) {
  console.error(`Gradle wrapper not found at: ${wrapperPath}`);
  process.exit(1);
}

const env = {
  ...process.env,
  LANG: process.env.LANG ?? 'en_US.UTF-8',
  LC_ALL: process.env.LC_ALL ?? 'en_US.UTF-8',
};

const result = isWindows
  ? spawnSync('cmd.exe', ['/c', 'gradlew.bat', ...args], {
      cwd: androidDir,
      stdio: 'inherit',
      env,
      shell: false,
    })
  : spawnSync('./gradlew', args, {
      cwd: androidDir,
      stdio: 'inherit',
      env,
      shell: false,
    });

if (result.error) {
  if (isWindows && result.error.code === 'ENOENT') {
    console.error(
      'Git Bash (bash) was not found in PATH. Open the project in Git Bash and retry.',
    );
  }
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
