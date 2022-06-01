require('dotenv').config();
const mariadb = require(`mariadb`);

let pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectionLimit: 5
});

module.exports = {
  insertData: async function insertData(database, table, columns, data) {
    if (Array.isArray(columns) && Array.isArray(data)) {
      columns = columns.join(", ");

      for (var i=0; i<data.length; ++i) {
        data[i] = pool.escape(data[i]);
      }
      data = data.join(", ");
    } else {
      data = pool.escape(data);
    }

    try {
      var conn = await pool.getConnection();
      return await conn.query(`INSERT INTO ${database}.${table} (${columns}) VALUES (${data})`);
    } finally {
      if (conn) conn.close();
    }
  },

  updateData: async function updateData(database, table, columns, data, condition) {
    if (!Array.isArray(condition)) {
      throw "condition is not an array";
    }

    if (Array.isArray(columns) && Array.isArray(data)) {
      var update = "";
      for (var i=0; i<data.length-1; ++i) {
        update += `${columns[i]}=${pool.escape(data[i])}, `;
      }
      update += `${columns[i]}=${pool.escape(data[i])}`;
    } else {
      update = `${columns}=${pool.escape(data)}`;
    }

    try {
      var conn = await pool.getConnection();
      return await conn.query(`UPDATE ${database}.${table} SET ${update} WHERE ${condition[0]}=?`, condition[1]);
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
      return await conn.query(`SELECT * FROM ${database}.${table} WHERE ${column}=?`, [value]);
    } finally {
      if (conn) conn.close();
    }
  },

  dropValueData: async function dropValueData(database, table, column, value) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`DELETE FROM ${database}.${table} WHERE ${column}=?`, [value]);
    } finally {
      if (conn) conn.close();
    }
  },

  getOrderedData: async function getOrderedData(database, table, column, order) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} ORDER BY ${column} ${order}`);
    } finally {
      if (conn) conn.close();
    }
  },

  getOrderedLimitData: async function getOrderedLimitData(database, table, column, order, limit) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} ORDER BY ${column} ${order} LIMIT ${limit}`);
    } finally {
      if (conn) conn.close();
    }
  },

  getJSONData: async function getJSONData(database, table, column, value, property) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT * FROM ${database}.${table} WHERE JSON_CONTAINS(${column}, ?, '$.${property}')`, [`"${value}"`]);
    } finally {
      if (conn) conn.close();
    }
  },

  getInnerJoin: async function innerJoin(database1, table1, column1, database2, table2, column2, queryColumn, query) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT ${database1}.${table1}.* FROM ${database1}.${table1}
                               INNER JOIN ${database2}.${table2}
                               ON ${database1}.${table1}.${column1} = ${database2}.${table2}.${column2}
                               WHERE ${queryColumn}=?`, [query]);
    } finally {
      if (conn) conn.close();
    }
  },

  getDistinct: async function getDistinct(database, table, column) {
    try {
      var conn = await pool.getConnection();
      return await conn.query(`SELECT DISTINCT(${column}) FROM ${database}.${table}`);
    } finally {
      if (conn) conn.close();
    }
  }

}
