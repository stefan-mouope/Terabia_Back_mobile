const Joi = require('joi');

exports.initiatePayment = (req, res, next) => {
  const schema = Joi.object({
    orderId: Joi.number().integer().min(1).required(),
    amount: Joi.number().min(0).required(),
    provider: Joi.string().valid('MTN', 'Orange', 'M-Pesa', 'Other').required(),
    buyerPhoneNumber: Joi.string().pattern(/^\+?\d{9,15}$/).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
