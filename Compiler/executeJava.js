const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeJava(code, input = '') {
  return new Promise((resolve, reject) => {
    const sourceFile = path.join(__dirname, 'Main.java');

    fs.writeFileSync(sourceFile, code);

    const run = spawn('java', [sourceFile]);
    let stdout = '';
    let stderr = '';

    run.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    run.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    run.on('close', (exitCode) => {
      fs.unlinkSync(sourceFile);

      if (exitCode !== 0) {
        resolve(stderr)
      } else {
        resolve(stdout);
      }
    });

    run.on('error', (err) => {
      reject(err);
    });

    // Write input if provided
    if (input) {
      run.stdin.write(input);
    }
    run.stdin.end();
  });
}

module.exports = { executeJava };
