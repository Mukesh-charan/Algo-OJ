const { spawn } = require("child_process");

function executePy(code, input = "") {
  return new Promise((resolve, reject) => {
    const pyProcess = spawn("python", ["-u", "-c", code]);

    let fullOutput = ""; // Will contain stdout + stderr combined

    pyProcess.stdout.on("data", (data) => {
      fullOutput += data.toString();
    });

    pyProcess.stderr.on("data", (data) => {
      fullOutput += data.toString();
    });

    pyProcess.on("close", (exitCode) => {
      // Optionally prepend an error note if process exited non-zero:
      if (exitCode !== 0) {
        fullOutput = `Error (exit code ${exitCode}):\n` + fullOutput;
      }
      resolve(fullOutput);
    });

    pyProcess.on("error", (err) => {
      reject(err.toString());
    });

    if (input) {
      pyProcess.stdin.write(input);
    }
    pyProcess.stdin.end();
  });
}

module.exports = { executePy };
