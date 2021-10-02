const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const validation = require('../validations/restaurant');

const restaurantSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	adminUsername: { type: String, required: true },
	adminPassword: { type: String, required: true },
	score: { type: Number, default: 0 },
	photo: { type: String, default: 'default.jpeg' },
	phone: { type: Number, required: true },
	address: { type: String, required: true },
	active: { type: Boolean, default: true },
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
	role: {
		type: String,
		default: 'restaurant',
	},
	createAt: {
		type: Date,
		default: Date.now(),
	},
});

restaurantSchema.pre('save', async function (next) {
	if (!this.isModified('adminPassword')) return next();

	this.password = await bcrypt.hash(this.password, 10);
	next();
});

restaurantSchema.methods.changedPasswordAfter = function (jwtTime) {
	const passwordChangedTime = this.passwordChangedAt;
	if (passwordChangedTime) {
		const changeTime = parseInt(passwordChangedTime.getTime() / 1000, 10);

		return jwtTime < changeTime;
	}

	return false;
};

restaurantSchema.statics.validateBody = function (body) {
	return validation.validate(body, { abortEarly: false });
};

module.exports = mongoose.model('restaurants', restaurantSchema);
