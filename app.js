const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const { getEndpoints } = require("./controllers/general-controllers");
const { getArticleById } = require("./controllers/articles-controllers");
const {
  customErrors,
  errorsWithCodes,
} = require("./error-handling/error-handling");

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);

app.use("/", (req, res, next) => {
  res.status(404).send({ msg: "Non existent endpoint" });
});

app.use(customErrors);
app.use(errorsWithCodes);

module.exports = app;
