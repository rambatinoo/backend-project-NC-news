const {
  selectArticle,
  selectArticles,
  updateVotes,
} = require("../models/articles-models");
const { selectTopic } = require("../models/topics-models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  let { topic, sort_by, order } = req.query;
  if (topic) topic = topic.toLowerCase();
  const promises = [selectArticles(topic, sort_by, order)];
  if (topic) promises.push(selectTopic(topic));
  Promise.all(promises)
    .then((result) => {
      const articles = result[0];
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== "number") {
    next({ status: 400, msg: "inc_votes Must Be A Number" });
  }
  const promises = [
    updateVotes(article_id, inc_votes),
    selectArticle(article_id),
  ];
  Promise.all(promises)
    .then((result) => {
      article = result[0];
      res.status(200).send({ article });
    })
    .catch(next);
};
