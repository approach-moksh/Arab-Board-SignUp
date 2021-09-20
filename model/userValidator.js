const Joi = require('joi');

const schema = Joi.object({
    firstname: Joi.string()
        .min(3)
        .max(10)
        .required(),
    
    lastname: Joi.string()
        .min(3)
        .max(10)
        .required(),
    
    phone: Joi.number()
        .integer()
        .required(),
        
    gender:Joi.string()
        .required(),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net',] } })
        .required(),

    password: Joi.string()
        .alphanum()
        .min(8)
        .max(10)
        .required(),

    categoryId: Joi.number()
        .integer()
        .required(),
})


module.exports = schema;