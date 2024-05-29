exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.errorsWithCodes = (err, req, res, next) => {
  if (err.code) {
    console.log(err.code);
    switch (err.code) {
      case "22P02":
        res.status(400).send({ msg: "Bad Request" });
        break;
      case "23503":
        res.status(404).send({ msg: "No Article With that Id Found" });
    }
  } else next(err);
};
