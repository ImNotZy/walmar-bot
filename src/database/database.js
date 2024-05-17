const Squelize = require ('sequelize');

const sequelize = new Squelize('database', 'user', 'password', {
  dialect: 'sqlite',
  host: 'localhost',

  storage: 'database.sqlite',
  logging: false,
});

const Employee = sequelize.define('employee', {
  name: Squelize.STRING,
  userID: Squelize.INTEGER,
  position: Squelize.STRING,
  tasksCompleted: Squelize.INTEGER,
  tasksFailed: Squelize.INTEGER
}, {
  tableName: 'employees'
});

const Server = sequelize.define('server', {
  userID: Squelize.INTEGER,
  isTimeUp: Squelize.BOOLEAN
}, {
  tableName: 'serverSettings'
});

module.exports = {
  sequelize,
  Employee,
  Server
}