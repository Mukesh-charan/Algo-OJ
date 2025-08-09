const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeCPP(code, input = '') {
  return new Promise((resolve, reject) => {
    const sourceFile = path.join(__dirname, 'temp.cpp');
    const outputFile = path.join(__dirname, 'temp_executable' + (process.platform === 'win32' ? '.exe' : ''));

    // Write the source code to file
    fs.writeFileSync(sourceFile, code);

    // Compile the CPP code
    const compile = spawn('g++', [sourceFile, '-o', outputFile]);

    let compileStderr = '';

    compile.stderr.on('data', (data) => {
      compileStderr += data.toString();
    });

    compile.on('close', (compileCode) => {
      if (compileCode !== 0) {
        // Compilation failed - return compile errors as resolved output
        // Clean up source file
        fs.unlinkSync(sourceFile);
        resolve(compileStderr);
      } else {
        // Compilation succeeded - run the executable
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
            resolve(stderr || `Process exited with code ${exitCode}`);
          } else {
            resolve(stdout);
          }
        });

        run.on('error', (err) => {
          // Clean up files on error too
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

module.exports = { executeCPP };
