const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeC(code, input = '') {
  return new Promise((resolve, reject) => {
    const sourceFile = path.join(__dirname, 'temp.c');
    const outputFile = path.join(__dirname, 'temp_executable' + (process.platform === 'win32' ? '.exe' : ''));

    // Write the source code to a file
    fs.writeFileSync(sourceFile, code);

    // Compile using gcc
    const compile = spawn('gcc', [sourceFile, '-o', outputFile]);

    let compileStderr = '';

    compile.stderr.on('data', (data) => {
      compileStderr += data.toString();
    });

    compile.on('close', (compileCode) => {
      if (compileCode !== 0) {
        // Compilation failed: resolve with compiler errors
        fs.unlinkSync(sourceFile);
        resolve(compileStderr);
      } else {
        // Compilation succeeded: run the executable
        const run = spawn(outputFile);

        let stdout = '';
        let stderr = '';

        run.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        run.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        run.on('close', (exitCode) => {
          // Clean up temp files
          fs.unlinkSync(sourceFile);
          fs.unlinkSync(outputFile);

          if (exitCode !== 0) {
            stdout = `Process exited with code ${exitCode}`;
          }
          resolve(stdout);
        });

        run.on('error', (err) => {
          // Clean files in case of error
          fs.unlinkSync(sourceFile);
          if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
          reject(err);
        });

        if (input) {
          run.stdin.write(input);
        }
        run.stdin.end();
      }
    });

    compile.on('error', (err) => {
      // Compilation process error
      if (fs.existsSync(sourceFile)) fs.unlinkSync(sourceFile);
      reject(err);
    });
  });
}

module.exports = { executeC };
