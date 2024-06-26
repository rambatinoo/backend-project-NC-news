const db = require("../db/connection");
const format = require("pg-format");

exports.selectArticle = (article_id) => {
  return db
    .query(
      `SELECT articles.*, CAST(COUNT(comments.comment_id) AS INT) AS comment_count 
      FROM articles 
      LEFT JOIN comments USING (article_id)
    WHERE articles.article_id = $1 
    GROUP BY articles.article_id`,
      [article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No Article With That Id Found",
        });
      }
      return result.rows[0];
    });
};

exports.selectArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  sort_by = sort_by.toLowerCase();
  order = order.toUpperCase();
  const offsetNum = limit * (p - 1);
  const validSortBy = [
    "article_id",
    "author",
    "title",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrder = ["ASC", "DESC"];
  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid Sort By Query" });
  }
  if (!validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid Order Query" });
  }

  const queryArr = [];
  let queryStr = `SELECT article_id, articles.author, title, topic, articles.created_at, articles.votes, article_img_url, 
  CAST(COUNT(comments.comment_id) AS INT) AS comment_count, CAST(COUNT(*) OVER() AS INT) AS total_count
      FROM articles
      LEFT JOIN comments USING (article_id) `;

  if (topic) {
    queryStr += `WHERE topic = $1 `;
    queryArr.push(topic);
    queryStr += `GROUP BY article_id
      ORDER BY ${sort_by} ${order}
      LIMIT $2 OFFSET $3`;
  } else {
    queryStr += `GROUP BY article_id
    ORDER BY ${sort_by} ${order}
    LIMIT $1 OFFSET $2`;
  }

  queryArr.push(limit);
  queryArr.push(offsetNum);
  return db.query(queryStr, queryArr).then((result) => {
    const articles = result.rows;
    let totalCount = 0;
    if (result.rows.length) {
      totalCount = result.rows[0].total_count;
      articles.forEach((article) => {
        delete article.total_count;
      });
    }

    return { articles, totalCount };
  });
};

exports.updateArticleVotes = (article_id, numOfVotes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 
  WHERE article_id = $2
  RETURNING *`,
      [numOfVotes, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.addNewArticle = (author, title, body, topic, article_img_url) => {
  let queryStr = `INSERT INTO articles (author, title, body, topic, article_img_url)
  VALUES ($1, $2, $3, $4, `;
  const queryArr = [author, title, body, topic];

  if (article_img_url) {
    queryStr += `$5)`;
    queryArr.push(article_img_url);
  } else {
    queryStr += `DEFAULT)`;
  }
  queryStr += `RETURNING *`;
  return db.query(queryStr, queryArr).then((result) => {
    return result.rows[0];
  });
};

exports.removeArticle = (article_id) => {
  return db.query(`DELETE FROM articles WHERE article_id = $1`, [article_id]);
};
