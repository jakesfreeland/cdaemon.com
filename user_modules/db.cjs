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
        conn.query(`INSERT INTO ${database}.${table} (${columns}) VALUES (${data})`)
        .catch(err => console.log(err));
      } else {
        conn.query(`REPLACE INTO ${database}.${table} (${columns}) VALUES (${data})`);
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) conn.close();
    }
  },

  getData: async function getData(database, table) {
    try {
      conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table}`);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) conn.close();
    }
  },

  getColumnData: async function getColumnData(database, table, column) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT ${column} FROM ${database}.${table}`);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) conn.close();
    }
  },

  getValueData: async function getValueData(database, table, column, value) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} WHERE ${column}="${value}"`);
    } catch (err) {
      console.log(err);
    } finally {
      if (conn) conn.close();
    }
  }
}