const yup = require('yup');

const validateSchema = yup.object().shape({
    name:yup.string().required('name is required'),
    description:yup.string().required('bio is required').min(8,'description must not be less than 8 characters'),
    phone:yup.string().required('phone is required'),
    address:yup.string().required('address is required'),
    username:yup.string().required('username is required').min(4,'username must not be less than 8 characters'),
    password:yup.string().required('password is required').min(6,'password must not be less than 8 characters'),
    confirmPassword:yup.string().required('confirm Password is required').oneOf([yup.ref('password'),null])
}) 

module.exports = validateSchema