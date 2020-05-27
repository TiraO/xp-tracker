#! /home/tira/.nvm/versions/node/v12.13.1/bin/node

const path = require('path');
const { configTree, connectionString } = require("./config_helper");
const createFile = require("./utils/create_file");
const bashFactory = require("./utils/bash");

const createFlywayConf = async (datasourceConfig) => {
  let datasourceUrl = connectionString(datasourceConfig);
  let fileContents = `
flyway.url=${datasourceUrl}
flyway.locations=filesystem:config/migrations
`;
  await createFile(path.join(__dirname, 'flyway.generated.conf'), fileContents);
};

let setupDatabase = async function (config, bash) {
  await createFlywayConf(config.datasource);
  console.log("creating database");
  let postgresSuperUser = bash('if id "postgres" >/dev/null 2>&1; then\n' +
    '    echo "postgres"\n' +
    'else\n' +
    '    # macOS can use current user\n' +
    '    whoami\n' +
    'fi');
  bash(`sudo -u ${postgresSuperUser} psql -c "CREATE USER ${config.datasource.user} with password '${config.datasource.password}'"`);
  bash(`sudo -u ${postgresSuperUser} psql -c "ALTER USER ${config.datasource.user} with password '${config.datasource.password}'"`, true);
  bash(`sudo -u ${postgresSuperUser} dropdb ${config.datasource.database} -p ${config.datasource.port} --if-exists`);
  bash(`sudo -u ${postgresSuperUser} createdb ${config.datasource.database} -p ${config.datasource.port} --owner=${config.datasource.user}`, true);

  console.log("installing and running flyway");
  if (!bash('which flyway')) {
    // TODO
    console.log("Attempting to install flyway");
    bash('brew install flyway', true)

  }
  bash('flyway migrate', true);
};
const prepareDevEnvironment = async () => {
  const appName = "xptracker";
  const config = configTree();
  const bash = bashFactory(config);

  let bashConfigPath = bash(`
if [ -e ~/.bashrc ]; then
    echo '~/.bashrc'
elif [ -e ~/.bash_profile ]; then
    echo '~/.bash_profile'
fi`);

  console.log("found config at ", bashConfigPath);
  if (bash(`cat ${bashConfigPath} | grep '${appName} setup'`)) {
    console.log("user shell already configured for app.")
  } else {
    console.log("configuring user shell for app");
    bash(`
    echo '# ${appName} setup' >> ${bashConfigPath}
    echo 'export FLYWAY_CONFIG_FILES=config/flyway.generated.conf >> ${bashConfigPath}
    `)
  }
  // TODO: install and use homebrew
  if (!bash('which brew')) {
    console.log("Installing Homebrew");
    bash(`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`)
    if (isLinux()) {
      bash(`echo 'eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)' >> ${bashConfigPath}`)
      bash(`brew tap linuxbrew/xorg`)
    }
  }
  await setupDatabase(config, bash);

  console.log('done');
  process.exit(0);
};

const isLinux = () => {
  return !isMacOs(); // close enough
};
const isMacOs = () => {
  let bash = bashFactory({});
  return bash('unameOut="$(uname -s)"\n' +
    'case "${unameOut}" in\n' +
    '    Linux*)     machine=Linux;;\n' +
    '    Darwin*)    machine=Mac;;\n' +
    '    CYGWIN*)    machine=Cygwin;;\n' +
    '    MINGW*)     machine=MinGw;;\n' +
    '    *)          machine="UNKNOWN:${unameOut}"\n' +
    'esac\n' +
    'echo ${machine}') === 'Mac'
};

return prepareDevEnvironment();
