const { selectTopics, addNewTopic } = require("../models/topics-models");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;
  if (!slug || !description) {
    return next({
      status: 400,
      msg: "topics must contain: slug and description",
    });
  }
  addNewTopic(slug, description)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch(next);
};
