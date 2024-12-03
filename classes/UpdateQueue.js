const fs = require("fs");
const path = require("path");
const { loadData } = require("../utils/utils");

class UpdateQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.loadDataBuffer = loadData();
    this.writeScheduled = false;
  }

  enqueue(task) {
    this.queue.push(task);
    this.processNext();
  }

  async processNext() {
    if (this.processing || this.queue.length < 10) return;
    this.processing = true;

    const tasksToProcess = this.queue.splice(0, 10);
    try {
      for (const task of tasksToProcess) {
        await task(this.loadDataBuffer);
      }
    } catch (error) {
    } finally {
      this.processing = false;
      this.scheduleFileWrite();
    }
  }

  scheduleFileWrite() {
    if (this.writeScheduled) return;

    this.writeScheduled = true;

    setTimeout(() => {
      this.writeScheduled = false;
      this.writeToFile();
    }, 1000);
  }

  writeToFile() {
    try {
      const filePath = path.join(__dirname, "..", "loadData.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify(this.loadDataBuffer, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  }
}

module.exports = new UpdateQueue(); // export a singleton instance
