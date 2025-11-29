const Joi = require('joi');

const locationSchema = Joi.object({
  city: Joi.string().required(),
  coords: Joi.array().items(Joi.number().required()).length(2).required(),
});

exports.createProduct = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().default('XAF'),
    stock: Joi.number().integer().min(0).required(),
    categoryId: Joi.number().integer().min(1).required(),
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    location: locationSchema.required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

exports.updateProduct = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).optional(),
    description: Joi.string().min(10).optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
    stock: Joi.number().integer().min(0).optional(),
    categoryId: Joi.number().integer().min(1).optional(),
    images: Joi.array().items(Joi.string().uri()).min(1).optional(),
    location: locationSchema.optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
