const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  driver: Joi.object({
    name: Joi.string().required().min(2).max(255),
    current_shift_hours: Joi.number().min(0).max(24).default(0),
    past_7_day_work_hours: Joi.number().min(0).max(168).default(0),
    status: Joi.string().valid('available', 'busy', 'offline').default('available')
  }),

  route: Joi.object({
    route_id: Joi.string().required().min(1).max(50),
    distance_km: Joi.number().positive().required(),
    traffic_level: Joi.string().valid('Low', 'Medium', 'High').required(),
    base_time_minutes: Joi.number().positive().integer().required()
  }),

  order: Joi.object({
    order_id: Joi.string().required().min(1).max(50),
    value_rs: Joi.number().positive().required(),
    assigned_route: Joi.string().required().min(1).max(50),
    delivery_timestamp: Joi.date().iso().required()
  }),

  simulation: Joi.object({
    available_drivers: Joi.number().integer().min(1).required(),
    route_start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    max_hours_per_driver: Joi.number().min(1).max(24).required()
  }),

  updateDriver: Joi.object({
    name: Joi.string().min(2).max(255),
    current_shift_hours: Joi.number().min(0).max(24),
    past_7_day_work_hours: Joi.number().min(0).max(168),
    status: Joi.string().valid('available', 'busy', 'offline')
  }).min(1),

  updateRoute: Joi.object({
    distance_km: Joi.number().positive(),
    traffic_level: Joi.string().valid('Low', 'Medium', 'High'),
    base_time_minutes: Joi.number().positive().integer()
  }).min(1),

  updateOrder: Joi.object({
    value_rs: Joi.number().positive(),
    assigned_route: Joi.string().min(1).max(50),
    delivery_timestamp: Joi.date().iso(),
    status: Joi.string().valid('pending', 'assigned', 'delivered', 'cancelled')
  }).min(1)
};

module.exports = {
  validateRequest,
  validateQuery,
  schemas
};