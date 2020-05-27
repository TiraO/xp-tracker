#! /home/tira/.nvm/versions/node/v12.13.1/bin/node

const path = require('path');
const { configTree, connectionString } = require("./config_helper");
const createFile = require("./utils/create_file");
const bash = require("./utils/bash");

const createFlywayConf = async (datasourceConfig) => {
  let datasourceUrl = connectionString(datasourceConfig);
  let fileContents = `
flyway.url=${datasourceUrl}
flyway.locations=filesystem:src/config/migrations
`;
  await createFile(path.join(__dirname, 'flyway.generated.conf'), fileContents);
};

let setupDatabase = async function (config) {
  await createFlywayConf(config.datasource);
  console.log("creating database");
  let postgresSuperUser = 'postgres';
  bash(`
    sudo -u ${postgresSuperUser} psql -c "CREATE USER ${config.datasource.user} with password '${config.datasource.password}'"
    sudo -u ${postgresSuperUser} psql -c "ALTER USER ${config.datasource.user} with password '${config.datasource.password}'"
    sudo -u ${postgresSuperUser} dropdb ${config.datasource.database} -p ${config.datasource.port} --if-exists
    sudo -u ${postgresSuperUser} createdb ${config.datasource.database} -p ${config.datasource.port} --owner=${config.datasource.user}
  `);

  console.log("installing and running flyway");
  if (!bash('which flyway')) {
    // TODO
    // bash('cd ~/Applications && wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/6.4.2/flyway-commandline-6.4.2-linux-x64.tar.gz | tar xvz && sudo ln -s `pwd`/flyway-6.4.2/flyway /usr/local/bin')
  }

  bash('flyway migrate');
};
const prepareDevEnvironment = async () => {
  const appName = "xptracker";
  const config = configTree();
  bash("cd ~/ && pwd");
  let bashConfigPath = bash(`
if [ -e ~/.bashrc ]; then
    echo '~/.bashrc'
elif [ -e ~/.bash_profile ]; then
    echo '~/.bash_profile'
fi
`);
  console.log("found config at ", bashConfigPath);
  if (bash(`cat ${bashConfigPath} | grep '${appName} setup'`)) {
    console.log("user shell already configured for app.")
  } else {
    console.log("configuring user shell for app");
    bash(`
    echo '# ${appName} setup' >> ${bashConfigPath}
    echo 'export FLYWAY_CONFIG_FILES=${path.join(__dirname, 'flyway.generated.conf')}' >> ${bashConfigPath}
    `)
  }
  // TODO: install and use homebrew
  if(!bash('which brew')){
    bash(`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`)
  // bash(`echo 'eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)' >> ~/.bashrc`)
  }
  await setupDatabase(config);

  console.log('done');
  process.exit(0);
};

return prepareDevEnvironment();
