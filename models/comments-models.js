const db = require("../db/connection");

exports.selectCommentsByArticleId = (article_id, limit = 10, p = 1) => {
  const offsetNum = limit * (p - 1);
  let queryStr = `SELECT * FROM comments WHERE article_id = $1 
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3`;

  return db.query(queryStr, [article_id, limit, offsetNum]).then((result) => {
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
      return result.rows[0];
    });
};

exports.removeComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then(() => {
      return "deleted";
    });
};

exports.selectComment = (comment_id) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [comment_id])
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: "No Comment With That Id Found",
        });
      }
      return result.rows[0];
    });
};

exports.updateComentVotes = (comment_id, voteChange) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *`,
      [voteChange, comment_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};
