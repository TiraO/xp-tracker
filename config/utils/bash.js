const childProcess = require("child_process");
const { treeToVars } = require("../config_helper");
const bash = (command, options = {}, raiseOnError = false) => {

  let output;
  try {
    output = childProcess.execSync(command,
      [],
      {
        env: { ...treeToVars(config), ...options.env },
        ...options,
        shell: '/bin/bash'
      });
  } catch (e) {
    if (raiseOnError) {
      throw e;
    }
  }

  if (output) {
    let returnString = output.toString('utf8');
    console.log(returnString);
    if (!returnString.endsWith('\n')) {
      console.error("huh. I assumed it would always end with a line break")
    }
    return returnString.slice(0, returnString.length - 1)
  }
};

module.exports = bash;