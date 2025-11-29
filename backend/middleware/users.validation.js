const Joi = require('joi');

exports.updateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?\d{9,15}$/).optional(),
    city: Joi.string().optional(),
    gender: Joi.string().optional(),
    cni: Joi.string().min(10).optional() // CNI can be updated if provided
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
