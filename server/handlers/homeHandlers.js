exports.getHomePage = (req, res) => {
  res.status(200).json({ message: "Welcome" });
};
