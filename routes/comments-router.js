const {
  deleteComment,
  patchComment,
  getComments,
} = require("../controllers/comments-controllers");

const commentsRouter = require("express").Router();

commentsRouter.delete("/:comment_id", deleteComment);
commentsRouter.patch("/:comment_id", patchComment);
commentsRouter.get("/", getComments);

module.exports = commentsRouter;
