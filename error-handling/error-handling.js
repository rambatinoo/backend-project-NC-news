exports.customErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
};

exports.errorsWithCodes = (err, req, res, next) => {
  if (err.code) {
    // console.log(err.code);
    switch (err.code) {
      case "22P02":
        res.status(400).send({ msg: "Bad Request" });
    }
  } else next(err);
};
