module.exports = (fn) => (req, res, next) =>
	fn(req, res, next).catch((err) => {
		console.log(err);
		return res.status(500).json({ message: 'internal server error' });
	});
