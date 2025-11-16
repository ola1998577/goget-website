const Joi = require('joi');

const registerSchema = Joi.object({
  fName: Joi.string().required().min(2).max(50),
  lName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().required().pattern(/^[0-9]{10,15}$/),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyOTPSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().required().length(4),
});

const resendOTPSchema = Joi.object({
  phone: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
};
