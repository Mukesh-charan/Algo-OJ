const express = require('express');
const { executeCPP } = require('./executeCPP');
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');
const { executeC } = require('./executeC');
const { generateFile } = require('./generateFile');
const cors = require('cors');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

function withTimeout(promise, timeout = 7000) {
    return Promise.race([
        promise,
        new Promise((resolve) =>
            setTimeout(() => resolve({ status: "TLE" }), timeout)
        ),
    ]);
}

app.post('/run', async (req, res) => {
    let { language, code, input = "" } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code body!" });
    }

    language = language.toLowerCase();
    try {
        let execPromise;
        if (language === 'cpp') {
            execPromise = executeCPP(code, input);
        } else if (language === 'py' || language === 'python') {
            execPromise = executePy(code, input);
        } else if (language === 'java') {
            execPromise = executeJava(code, input);
        } else if (language === 'c') {
            execPromise = executeC(code, input);
        } else {
            return res.status(400).json({ error: "Unsupported language" });
        }
        
        const output = await withTimeout(execPromise);

        if (output && output.status === "TLE") {
            return res.status(200).json({ status: "TLE" });
        }
        return res.json(output);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/submit', async (req, res) => {
    let { language, code, input = "" } = req.body;
    if (code === undefined) {
        return res.status(404).json({ success: false, error: "Empty code body!" });
    }

    language = language.toLowerCase();
    try {
        // Save file and get UUID
        const filepath = await generateFile(language, code);
        // Extract UUID from filename: e.g., 'tempfiles/uuid.py' → uuid part
        const uuid = filepath.split('/').pop().split('.')[0];

        let execPromise;
        if (language === 'cpp') {
            execPromise = executeCPP(code, input);
        } else if (language === 'py' || language === 'python') {
            execPromise = executePy(code, input);
        } else if (language === 'java') {
            execPromise = executeJava(code, input);
        } else if (language === 'c') {
            execPromise = executeC(code, input);
        } else {
            return res.status(400).json({ error: "Unsupported language" });
        }
        
        const output = await withTimeout(execPromise);

        if (output && output.status === "TLE") {
            return res.status(200).json({ status: "TLE" });
        }
        // Do NOT return output!
        res.json({ uuid });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(5245, () => {
    console.log('Listening on port 5245!');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
