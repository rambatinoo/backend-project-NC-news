const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};

exports.selectTopic = (topic) => {
  if (!/^[a-z-_]/.test(topic)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }
  return db
    .query(`SELECT * FROM topics WHERE slug = $1`, [topic])
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: "That Topic Cannot Be Found",
        });
      }
      return result.rows[0];
    });
};

exports.addNewTopic = (slug, description) => {
  return db
    .query(
      `INSERT INTO topics (slug, description)
  VALUES ($1, $2)
  RETURNING *`,
      [slug, description]
    )
    .then((result) => {
      return result.rows[0];
    });
};
