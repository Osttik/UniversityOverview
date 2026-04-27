const fs = require("node:fs/promises");
const path = require("node:path");

class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read(defaultValue = []) {
    try {
      const file = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(file);
    } catch (error) {
      if (error.code === "ENOENT") {
        return defaultValue;
      }

      throw error;
    }
  }

  async write(value) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const payload = `${JSON.stringify(value, null, 2)}\n`;
    await fs.writeFile(this.filePath, payload, "utf8");
  }
}

module.exports = JsonStore;
