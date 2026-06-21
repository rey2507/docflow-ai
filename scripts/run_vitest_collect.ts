import { execSync } from 'child_process';
import { writeFileSync } from 'fs';


const command = 'npx vitest run --reporter verbose --no-color src/services/documents/orchestrator.service.test.ts';

let stdout = '';
let stderr = '';
let exitCode: number | null = null;

try {
  // Capture both streams so we can write them in a single simple file.
  // execSync will throw on non-zero exit.
  const out = execSync(command, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
  });
  stdout = out;
} catch (err: any) {
  exitCode = typeof err?.status === 'number' ? err.status : null;
  stdout = err?.stdout?.toString?.() ?? '';
  stderr = err?.stderr?.toString?.() ?? '';
}

const report = {
  command,
  exitCode,
  stdout,
  stderr,
};

writeFileSync('vitest_trace.json', JSON.stringify(report, null, 2), 'utf8');

// Keep process exit code consistent.
process.exit(exitCode ?? 0);

