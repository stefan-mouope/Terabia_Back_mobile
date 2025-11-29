const Joi = require('joi');

const orderItemSchema = Joi.object({
  productId: Joi.number().integer().min(1).required(),
  qty: Joi.number().integer().min(1).required(),
});

exports.createOrder = (req, res, next) => {
  const schema = Joi.object({
    items: Joi.array().items(orderItemSchema).min(1).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

exports.updateOrderStatus = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'accepted', 'in_transit', 'delivered', 'cancelled').required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
