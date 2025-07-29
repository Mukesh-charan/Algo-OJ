const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const languageExtensionMap = {
  python: "py",
  py: "py",
  cpp: "cpp",
  c: "c",
  java: "java",
};

async function generateFile(language, code) {
  const ext = languageExtensionMap[language.toLowerCase()] || "txt";
  const filename = `${uuidv4()}.${ext}`;
  const filepath = path.join(__dirname, "code", filename);

  if (!fs.existsSync(path.dirname(filepath))) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
  }
  await fs.promises.writeFile(filepath, code, "utf8");
  return filepath;
}

module.exports = { generateFile };