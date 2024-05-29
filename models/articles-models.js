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

exports.selectArticles = (topic) => {
  const queryArr = [];
  let queryStr = `SELECT article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
      FROM articles
      LEFT JOIN comments USING (article_id) `;

  if (topic) {
    queryStr += `WHERE topic = $1 `;
    queryArr.push(topic);
  }
  queryStr += `GROUP BY article_id
    ORDER BY articles.created_at DESC`;

  return db.query(queryStr, queryArr).then((result) => {
    return result.rows;
  });
};
