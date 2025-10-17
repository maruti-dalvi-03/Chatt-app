import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js'
import bcrypt from 'bcrypt';

// signup new user
export const signup = async (req, res) => {
    const {email, fullname, password, bio} = req.body;
    
    try {
        if(!email || !fullname || !password || !bio) {
            return res.json({success: false, message: "All fields are required"})
        }

        const userExists = await User.findOne({email});
        if(userExists) {
            return res.json({success: false, message: "Account already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User.create({
            email,
            fullname,
            password: hashedPassword,
            bio
        })

        const token = generateToken(newUser._id);

        res.json({success: true, userData: newUser, message: "Account created successfully", token})

    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    
    }
}

//login
export const login = async (req, res) => {
  

    try {
        const {email, password} = req.body; 
        
        const userData = await User.findOne({email});
        if(!userData) {
            return res.json({success: false, message: "Account does not exist"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid credintials"})
        }

        const token = generateToken(userData._id);
        res.json({success: true, userData, message: "Login successful", token})

    } catch(err) {
        console.log(err.message)
        res.json({success: false, message: err.message})
    }

}


// controller to check if user is authenticated
export const checkAuth = (req, res) => {  
    res.json({success: true, user: req.user})

}


// controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, fullname, bio} = req.body;
        
        const userId = req.user._id;
        let updatedUser;

        if(profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, {bio,fullname}, {new: true});
          
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {bio,fullname, profilePic: upload.secure_url}, {new: true});
        
        }
        res.json({success: true, userData: updatedUser, message: "Profile updated successfully"})


    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    
    }
}