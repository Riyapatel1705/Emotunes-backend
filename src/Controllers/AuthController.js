import User from "../db/models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validatePassword ,validateEmail,validateUsername,checkEmailExists,checkUsernameExists} from "../utils/validation.js";

export const register=async(req,res)=>{
    const {firstName,lastName,email,password,created_by}=req.body;
    const requiredFields=[firstName,lastName,email,password];
    const missingFields=requiredFields.filter(field=>!field);
    if(missingFields.length>0){
        return res.status(400).json({message:"Missing required fields ${missingFields.join(',')}"});
    };
    if(!validateUsername(firstName,lastName)){
        return res.status(400).json({message:"Invalid username format"});
    }
    if(!validateEmail(email)){
        return res.status(400).json({message:'Invalid email format'});
    }
    if(!validatePassword(password)){
        return res.status(400).json({message:"Invalid password format"});
    }
    try{
    const existingEmail=await checkEmailExists(email);
    if(existingEmail){
        return res.status(400).json({message:"Email already exists"});
    }
    const existingUsername=await checkUsernameExists(firstName,lastName);
    if(existingUsername){
        return res.status(400).json({message:"Username already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      created_by
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
    
}catch(err){
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Failed to register user!' });
}
};

export const login=async(req,res)=>{
     const {email,password}=req.body;
     const requiredFields=[email,password];
     const missingFields=requiredFields.filter(field=>!field);
     if(missingFields.length>0){
        return res.status(400).json({message:"Missing required fields ${missingFields.join(',')}"});
    };
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Invalid credentials"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid credentials"});
        }
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
        res.status(200).json({message:"Login successful",token});
    }catch(err){
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Failed to login' });
    }
    };

