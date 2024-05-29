const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const {
  getCommentsByArticleId,
  postNewComment,
  deleteComment,
} = require("./controllers/comments-controllers");
const { getEndpoints } = require("./controllers/general-controllers");
const {
  getArticleById,
  getArticles,
  patchArticleById,
} = require("./controllers/articles-controllers");
const {
  customErrors,
  errorsWithCodes,
} = require("./error-handling/error-handling");
const { getUsers } = require("./controllers/users-controllers");

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postNewComment);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete("/api/comments/:comment_id", deleteComment);

app.use("/", (req, res, next) => {
  res.status(404).send({ msg: "Non existent endpoint" });
});

app.use(customErrors);
app.use(errorsWithCodes);

module.exports = app;
