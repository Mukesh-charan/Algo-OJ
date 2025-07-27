const express = require('express');
const { executeCPP } = require('./executeCPP');
const { executePy } = require('./executePy');
const { executeJava } = require('./executeJava');
const { executeC } = require('./executeC')
const cors = require('cors');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post('/run', async (req, res) => {
  let { language, code, input = "" } = req.body;

  if (code === undefined) {
    return res.status(404).json({ success: false, error: "Empty code body!" });
  }

  language = language.toLowerCase();

  try {
    let output;
    if (language === 'cpp') {
      output = await executeCPP(code, input);
    } else if (language === 'py' || language === 'python') {
      output = await executePy(code, input);
    } else if (language === 'java') {
      output = await executeJava(code, input);
    } else if (language === 'c') {
      output = await executeC(code, input);
    } else {
      return res.status(400).json({ error: "Unsupported language" });
    }
    return res.json(output);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*app.post('/submit', async(req, res)) => {
  let {language, code, userID, problemID}=req.body;
  
}*/



const server = app.listen(5245, () => {
  console.log('Listening on port 5245!');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});