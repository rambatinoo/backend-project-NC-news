const cors = require("cors");
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
const apiRouter = require("./routes/api-router");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.get("/api", getEndpoints);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Non existent endpoint" });
});

app.use(customErrors);
app.use(errorsWithCodes);

module.exports = app;
