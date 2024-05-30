const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const topicsRouter = require("./topics-router");
const userRouter = require("./users-router");

const apiRouter = require("express").Router();

apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/topics", topicsRouter);
module.exports = apiRouter;
