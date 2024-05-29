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
  let { topic } = req.query;
  // if (topic) topic = topic.toLowerCase();

  // if (topic && !/^[a-z-_]+$/.test(topic)) {
  //   return next({ status: 400, msg: "Invalid Topic Query" });
  // }
  selectArticles(topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};
