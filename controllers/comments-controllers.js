const {
  selectCommentsByArticleId,
  addNewComment,
  removeComment,
  selectComment,
  updateComentVotes,
  selectComments,
} = require("../models/comments-models");
const { selectArticle } = require("../models/articles-models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  Promise.all([
    selectCommentsByArticleId(article_id, limit, p),
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
  if (typeof username !== "string" || typeof body !== "string") {
    next({ status: 400, msg: "Username And Body Are Required To Be Strings" });
  }
  addNewComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  selectComment(comment_id)
    .then(() => {
      return removeComment(comment_id);
    })
    .then(() => {
      res.status(204).send({});
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  const promises = [
    updateComentVotes(comment_id, inc_votes),
    selectComment(comment_id),
  ];
  Promise.all(promises)
    .then((result) => {
      const comment = result[0];
      res.status(200).send({ comment });
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  selectComments().then((comments) => {
    res.status(200).send({ comments });
  });
};
