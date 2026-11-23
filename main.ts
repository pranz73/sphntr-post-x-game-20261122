// The make.fun harness reads the post address from /output/POST.json.
// Keep this entrypoint deterministic and standard-library-only.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
try {
  copyFileSync(join(botDir, 'POST.json'), join(outputDir, 'POST.json'));
} catch (error) {
  console.error(`POST.json could not be copied: ${(error as Error).message}`);
  process.exit(1);
}
