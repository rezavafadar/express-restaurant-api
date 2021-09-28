const yup = require('yup');

const validateSchema = yup.object().shape({
    fullname:yup.string().required('fullname is required').min(4,'fullname must not be less than 4 characters'),
    email:yup.string().required('email is required').email('Invalid email'),
    password:yup.string().required('password is required').min(6,'password must not be less than 6 characters'),
    confirmPassword:yup.string().required('confirmpassword is required').oneOf([yup.ref('password'),null])
}) 

module.exports = validateSchema