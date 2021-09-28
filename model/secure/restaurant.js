const yup = require('yup');

const validateSchema = yup.object().shape({
    name:yup.string().required('name is required'),
    bio:yup.string().required('bio is required').min(8,'bio must not be less than 8 characters'),
    phone:yup.string().required('phone is required'),
    address:yup.string().required('address is required')
}) 

module.exports = validateSchema