import fs from "fs";
import path from "path";

const TEXT_COLOR = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
  RESET: "\x1b[0m",
} as const;

const databaseFolder = path.join(import.meta.dir, "../database");
const decoder = new TextDecoder();

function createDatabaseFolder() {
  try {
    if (!fs.existsSync(databaseFolder)) {
      fs.mkdirSync(databaseFolder);
      console.log(
        `${TEXT_COLOR.CYAN}Created database folder.${TEXT_COLOR.RESET}`
      );
    }
  } catch (error: any) {
    console.error(
      `${TEXT_COLOR.RED}Error creating database folder:${TEXT_COLOR.RESET}`
    );
    console.error(`${TEXT_COLOR.YELLOW}${error.message}${TEXT_COLOR.RESET}`);
  }
}

async function startBot() {
  const proc = Bun.spawn(["bun", "run", "start"], {
    stdout: "pipe",
    stderr: "pipe",
    stdin: "inherit",
  });

  (async () => {
    for await (const chunk of proc.stdout) {
      console.log(decoder.decode(chunk).trim());
    }
  })();
  (async () => {
    for await (const chunk of proc.stderr) {
      console.error(
        `${TEXT_COLOR.RED}${decoder.decode(chunk).trim()}${TEXT_COLOR.RESET}`
      );
    }
  })();

  const exitCode = await proc.exited;
  const msg = `Process exited with code ${exitCode}`;
  if (exitCode === 0) {
    console.log(`${TEXT_COLOR.GREEN}${msg}${TEXT_COLOR.RESET}`);
  } else {
    console.error(`${TEXT_COLOR.RED}${msg}${TEXT_COLOR.RESET}`);
    throw new Error(msg);
  }
}

async function main() {
  try {
    createDatabaseFolder();
    await startBot();
  } catch (err: any) {
    console.error(
      `${TEXT_COLOR.RED}An error occurred during execution:${TEXT_COLOR.RESET}`
    );
    console.error(`${TEXT_COLOR.YELLOW}${err.message}${TEXT_COLOR.RESET}`);
    process.exit(1);
  }
}

main();
