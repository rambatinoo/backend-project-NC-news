const db = require("../db/connection");
const format = require("pg-format");

exports.selectArticle = (article_id) => {
  return db
    .query(
      `SELECT * FROM articles 
    WHERE article_id = $1`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No Article With that Id Found",
        });
      }
      return result.rows[0];
    });
};
