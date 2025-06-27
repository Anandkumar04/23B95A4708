module.exports = function (req, res, next) {
  const token = req.headers.authorization;
  if (token === "Bearer test-token") return next();
  return res.status(401).json({ message: "Unauthorized" });
};