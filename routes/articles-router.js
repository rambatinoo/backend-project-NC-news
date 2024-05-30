const {
  getArticles,
  getArticleById,
  patchArticleById,
} = require("../controllers/articles-controllers");
const {
  getCommentsByArticleId,
  postNewComment,
} = require("../controllers/comments-controllers");

const articlesRouter = require("express").Router();

articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.post("/:article_id/comments", postNewComment);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.get("/", getArticles);

module.exports = articlesRouter;
