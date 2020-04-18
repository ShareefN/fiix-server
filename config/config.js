module.exports = {
  development: {
    username: "root",
    password: "t51d34f5",
    database: "fiix-sandbox",
    host: "127.0.0.1",
    dialect: "mysql",
    operatorsAliases: false,
    logging: false
  },
  production: {
    use_env_variable: "JAWSDB_URL",
    dialect: "mysql",
    logging: false
  }
};
