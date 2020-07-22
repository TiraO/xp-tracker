const treeToVars = (config, env = process.env, prefix = "_APP") => {
  let keys = Object.keys(config);
  return keys.map((key) => {
    let value = config[key];
    if (key === '__env') {
      return treeToVars(value, '');
    }
    if (key.includes('_')) {
      console.warn('config key ', key, 'includes an underscore, which may result in unexpected behavior')
    }
    if (key !== key.toLowerCase()) {
      console.warn('config key ', key, 'includes uppercase letters, which may result in unexpected behavior')
    }

    let variableName = (prefix + '_' + key).toUpperCase();
    if (env[variableName] !== undefined) {
      value = env[variableName]
    }

    let result;
    if (typeof value == 'object') {
      result = {
        [variableName]: JSON.stringify(value),
        ...treeToVars(value, variableName)
      }
    } else {
      result = { [variableName]: value }
    }
    return result;
  }).reduce((soFar, branch) => {
    return {
      ...soFar,
      ...branch
    };
  }, {})
};

const assignPath = (object, pathArray, value) => {
  let currentTarget = object;
  pathArray.forEach((pathPart, i) => {
    if (i === pathArray.length - 1) {
      currentTarget[pathPart] = value;
      return object;
    } else {
      if (typeof currentTarget[pathPart] !== 'object') {
        currentTarget[pathPart] = {};
      }
      currentTarget = currentTarget[pathPart];
    }
  })
};

const coerceRawValue = (rawValue) => {
  let result = rawValue;
  try {
    result = JSON.parse(rawValue);
  } catch (e) {
  }

  return result;
};

const varsToTree = (env = process.env, stripPrefix = "_APP") => {
  let result = {};
  Object.keys(env).forEach((key) => {
    let value = coerceRawValue(env[key]);
    let objectPath;
    if (key.startsWith(stripPrefix)) {
      objectPath = key.toLowerCase().slice(stripPrefix.length + 1).split('_');
    } else {
      objectPath = key.toLowerCase().split('_');
      objectPath.unshift('__env')
    }
    assignPath(result, objectPath, value);
  });
  return result;
};
let rawConfigTree = (envName) => {
  if (!envName) {
    envName = process.env.environment;
  }
  if (!envName) {
    envName = 'default';
  }
  return require("./" + envName + "_env");
};

const configVars = (envName) => {
  // TODO merge with process.env
  return {
    ...treeToVars(rawConfigTree(envName)),
    ...process.env
  }

};

const configTree = rawConfigTree;

const connectionString = (datasourceConfig) => {
  let { host, port, database, user, password } = datasourceConfig;
  // return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  return `jdbc:postgresql://${host}:${port}/${database}?password=${password}&user=${user}`;
};
const parseDatabaseUrl = (databaseUrl) => {
  let [matchedPortion, user, password, host, port, database] =
    /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/.exec(databaseUrl);
  return { user, password, host, port, database };
};

module.exports = {
  connectionString,
  treeToVars,
  varsToTree,
  assignPath,
  configVars,
  configTree,
  parseDatabaseUrl
};