const fs = require('fs');

const createFile = (path, text) => {
  console.log("writing file to ", path);
  let rejectWritePromise, resolveWritePromise;

  const writePromise = new Promise((resolve, reject) => {
    resolveWritePromise = resolve;
    rejectWritePromise = reject;
  });

  fs.writeFile(path, text, {}, (error) => {
    if (error) {
      console.error('Error writing file:', error);
      rejectWritePromise();
    } else {
      resolveWritePromise();
    }
  });
  return writePromise;
};

module.exports = createFile;