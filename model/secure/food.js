const yup = require('yup');

const validateSchema = yup.object().shape({
    name:yup.string().required('food name is required'),
    price:yup.number().required('food price is required'),
    bio:yup.string().required('food bio is required').min(8,'food bio must not be less than 8 characters')
}) 

module.exports = validateSchema