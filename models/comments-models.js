const db = require("../db/connection");

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 
  ORDER BY created_at DESC`,
      [id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.addNewComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body)
    VALUES ($1, $2, $3)
    RETURNING *`,
      [article_id, username, body]
    )
    .then((result) => {
      console.log(result);
      return result.rows[0];
    });
};
