const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const TEXT_COLOR = {
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
  RESET: "\x1b[0m",
};

const distPath = path.join(__dirname, "../dist");
const databaseFolder = path.join(__dirname, "../database");

function cleanDist() {
  try {
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true });
      console.log(
        `${TEXT_COLOR.GREEN}Dist directory cleaned successfully:${TEXT_COLOR.RESET}`
      );
    }
  } catch (error) {
    console.error(
      `${TEXT_COLOR.RED}Error cleaning dist directory:${TEXT_COLOR.RESET}`
    );
    console.error(`${TEXT_COLOR.YELLOW}${error.message}${TEXT_COLOR.RESET}`);
  }
}

function createDatabaseFolder() {
  try {
    if (!fs.existsSync(databaseFolder)) {
      fs.mkdirSync(databaseFolder);
      console.log(
        `${TEXT_COLOR.GREEN}Database folder created successfully:${TEXT_COLOR.RESET}`
      );
    }
  } catch (error) {
    console.error(
      `${TEXT_COLOR.RED}Error creating database folder:${TEXT_COLOR.RESET}`
    );
    console.error(`${TEXT_COLOR.YELLOW}${error.message}${TEXT_COLOR.RESET}`);
  }
}

function startBot() {
  return new Promise((resolve, reject) => {
    const process = spawn("npm", ["start"], {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    process.stdout.on("data", (data) => {
      console.log(data.toString().trim());
    });

    process.stderr.on("data", (data) => {
      console.error(
        `${TEXT_COLOR.RED}${data.toString().trim()}${TEXT_COLOR.RESET}`
      );
    });

    process.on("close", (code) => {
      const msg = `Process exited with code ${code}`;
      if (code === 0) {
        console.log(`${TEXT_COLOR.GREEN}${msg}${TEXT_COLOR.RESET}`);
        resolve(code);
      } else {
        console.error(`${TEXT_COLOR.RED}${msg}${TEXT_COLOR.RESET}`);
        reject(new Error(msg));
      }
    });

    process.on("error", (err) => {
      console.error(
        `${TEXT_COLOR.MAGENTA}Failed to start process:${TEXT_COLOR.RESET}`
      );
      console.error(`${TEXT_COLOR.RED}|> ${err.name}${TEXT_COLOR.RESET}`);
      console.error(`${TEXT_COLOR.YELLOW}${err.message}${TEXT_COLOR.RESET}`);
      reject(err);
    });
  });
}

async function main() {
  try {
    cleanDist();
    createDatabaseFolder();
    await startBot();
  } catch (err) {
    console.error(
      `${TEXT_COLOR.RED}An error occurred during execution:${TEXT_COLOR.RESET}`
    );
    console.error(`${TEXT_COLOR.YELLOW}${err.message}${TEXT_COLOR.RESET}`);
    process.exit(1);
  }
}

main();
