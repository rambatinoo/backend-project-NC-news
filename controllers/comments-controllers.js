const {
  selectCommentsByArticleId,
  addNewComment,
} = require("../models/comments-models");
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

exports.postNewComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  addNewComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
