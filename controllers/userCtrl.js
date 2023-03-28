const userModel = require('../models/userModels.js')
const bcrypt = require('bcryptjs')
const jwt  =require('jsonwebtoken')


const registerController = async (req, resp) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return resp.status(200).send({ message: 'user already exist', success: false })
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt);
        req.body.password = hashpassword;
        const newUser = new userModel(req.body);
        await newUser.save();
        resp.status(201).send({ message: 'Register Succesfully', success: true })
    } catch (error) {
        console.log(error);
        resp.status(500).send({ success: false, message: `register controller ${error.message}` })
    }
}




const loginController = async (req, resp) => {
    try {
        const user = await userModel.findOne({ email: req.body.email })
        if (!user) {
            return resp.status(200).send({ message: 'user not found', success: false })

        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            return resp.status(200).send({ message: 'invalid Email or Password', success: false })
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1d'})
        resp.status(200).send({message:'Login sucess', success: true, token})

    } catch (error) {
        console.log(error)
        resp.status(500).send({ message: `Error in Login ${error.message}` })
    }
};


module.exports = { registerController, loginController };