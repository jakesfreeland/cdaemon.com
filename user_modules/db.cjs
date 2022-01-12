const mariadb = require("mariadb");

let pool = mariadb.createPool({
  host: "techfriends-blog.ckmannigxkgw.us-east-2.rds.amazonaws.com",
  user: "admin",
  password: "3R7zzN5dRBbfh9BrZeFP",
  connectionLimit: 5
});

module.exports = {
  sendData: async function sendData(database, table, columns, data, replace=false) {
    columns = columns.join(", ");
    for (var i=0; i<data.length; ++i) {
      data[i] = `'${data[i]}'`;
    }
    data = data.join(", ");

    try {
      var conn = await pool.getConnection();
      if (replace == false) {
        return await conn.query(`INSERT INTO ${database}.${table} (${columns}) VALUES (${data})`);
      } else {
        return await conn.query(`REPLACE INTO ${database}.${table} (${columns}) VALUES (${data})`);
      }
    } finally {
      if (conn) conn.close();
    }
  },

  getData: async function getData(database, table) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table}`);
    } finally {
      if (conn) conn.close();
    }
  },

  getColumnData: async function getColumnData(database, table, column) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT ${column} FROM ${database}.${table}`);
    } finally {
      if (conn) conn.close();
    }
  },

  getValueData: async function getValueData(database, table, column, value) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} WHERE ${column}="${value}"`);
    } finally {
      if (conn) conn.close();
    }
  },

  getOrderedData: async function getOrderedData(database, table, column, order, limit) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} ORDER BY ${column} ${order} LIMIT ${limit}`);
    } finally {
      if (conn) conn.close();
    }
  }
}