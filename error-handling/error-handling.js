exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.errorsWithCodes = (err, req, res, next) => {
  console.log(err);
  if (err.code) {
    switch (err.code) {
      case "22P02":
        res.status(400).send({ msg: "Bad Request" });
        break;
      case "23503":
        if (err.constraint.includes("article_id")) {
          res.status(404).send({ msg: "No Article With That Id Found" });
        }
        if (err.constraint.includes("author")) {
          res.status(404).send({ msg: "User Cannot Be Found" });
        }
        break;
      case "23502":
        res.status(400).send({ msg: "Incorrect Information For Request" });
    }
  } else next(err);
};
