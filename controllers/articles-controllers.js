const { selectArticle, selectArticles } = require("../models/articles-models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic } = req.query;
  if (!/^[a-zA-Z\s-_]+$/.test(topic)) {
    return next({ status: 400, msg: "Invalid Topic Query" });
  }
  selectArticles(topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
