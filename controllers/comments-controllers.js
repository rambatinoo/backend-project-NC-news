const { selectCommentsByArticleId } = require("../models/comments-models");
const { selectArticle } = require("../models/articles-models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    selectCommentsByArticleId(article_id),
    selectArticle(article_id),
  ])
    .then((result) => {
      const comments = result[0];
      res.status(200).send({ comments });
    })
    .catch(next);
};
