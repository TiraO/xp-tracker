const childProcess = require("child_process");
const { treeToVars } = require("../config_helper");
const uft8Error = (error) => {
  if (error.output) {
    error.output = error.output.map((s) => s ? s.toString('utf8') : s);
  }
  if (error.stdout) {
    error.stdout = error.stdout.toString('utf8');
  }
  if (error.stderr) {
    error.stderr = error.stderr.toString('utf8');
  }
}
const bashFactory = (config) => {
  const bash = (command, raiseOnError = false, options = {}) => {
    console.log('             $ ', command);
    let output;
    try {
      let envVars = { ...treeToVars(config), ...process.env};
      output = childProcess.execSync(command,
        {
          env: {
            ...envVars,
            ...options.env
          },

          ...options,
          shell: '/bin/bash'
        });
    } catch (error) {
      uft8Error(error);
      if (raiseOnError) {
        console.error(error);
        throw error;
      } else {
        console.log("IGNORED-ERROR " + error.message.split('\n').join('; '));
      }
    }

    if (output) {
      let returnString = output.toString('utf8');
      if (returnString.endsWith('\n')) {
        returnString.slice(0, returnString.length - 1);
      }
      console.log(returnString);
      return returnString;
    }
  };
  return bash;
};

module.exports = bashFactory;