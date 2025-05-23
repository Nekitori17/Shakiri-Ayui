const { spawn } = require("child_process");

const command = "npm";
const args = ["start"];
const process = spawn(command, args, { shell: true });

process.stdout.on("data", (data) => {
    console.log(data.toString());
});

process.stderr.on("data", (data) => {
    console.error(data.toString());
});

process.on("close", (code) => {
    console.log(`Process exited with code: ${code}`);
});
