const fs = require("fs/promises");
const path = require("path");

const dataFilePath = path.join(__dirname, "..", "data", "university.json");

async function readData() {
  const raw = await fs.readFile(dataFilePath, "utf8");
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(dataFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function createId(prefix, collection) {
  const now = Date.now().toString(36);
  let suffix = 1;
  let id = `${prefix}-${now}`;
  const ids = new Set(collection.map((item) => item.id));

  while (ids.has(id)) {
    suffix += 1;
    id = `${prefix}-${now}-${suffix}`;
  }

  return id;
}

module.exports = {
  createId,
  readData,
  writeData
};
