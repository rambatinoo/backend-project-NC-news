const { selectArticle, selectArticles } = require("../models/articles-models");
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
  let { topic } = req.query;
  if (topic) topic = topic.toLowerCase();
  const promises = [selectArticles(topic)];
  if (topic) promises.push(selectTopic(topic));
  Promise.all(promises)
    .then((result) => {
      const articles = result[0];
      res.status(200).send({ articles });
    })
    .catch(next);
};
