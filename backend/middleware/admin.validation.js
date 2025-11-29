const Joi = require('joi');

exports.suspendUser = (req, res, next) => {
  const schema = Joi.object({
    isSuspended: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
