import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import User from "../../../DB/Models/user.model.js";
import sendEmailService from "../services/Send-email.service.js";
import otpGenerator from "otp-generator";


// ========================================= SignUp API ================================//

/**
 * destructuring the required data from the request body
 * check if the user already exists in the database using the email
 * if exists return error email is already exists
 * password hashing
 * create new document in the database
 * return the response
 */
export const signUp = async (req, res, next) => {
// 1- destructure the required data from the request body
  const { username, email, password, age, role, phoneNumbers, addresses } =
    req.body;
// 2- check if the user already exists in the database using the email
  const isEmailDuplicated = await User.findOne({ email });
  if (isEmailDuplicated) {
    return next(
      new Error("Email already exists,Please try another email", { cause: 409 })
    );
  }
// 3- send confirmation email to the user
  const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m' })

  const isEmailSent = sendEmailService({
    to: email,
    subject: "Verify your email",
    message: `
    <h2>please clich on this link to verfiy your email</h2>
    <a href='http://localhost:3000/auth/verify-email?token=${usertoken}'>Verify Email</a>`,
  });
// 4- check if email is sent successfully
  if (!isEmailSent) {  
    return next(
      new Error("Email is not sent, please try again later", { cause: 500 })
    );
  } 
// 5- password hashing
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

// 6- create new document in the database
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    age,
    role,
    phoneNumbers,
    addresses,
  });

// 7- return the response
  res.status(201).json({
    success: true,
    message:
      "User created successfully, please check your email to verify your account",
    data: newUser,
  });
};
// ========================================= Verify Email API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get user by email , isEmailVerified = false
 * if not return error user not found
 * if found
 * update isEmailVerified = true
 * return the response
 */
export const verifyEmail = async (req, res, next) => {
    const { token } = req.query
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION)
    // get uset by email , isEmailVerified = false
    const user = await User.findOneAndUpdate({
        email: decodedData.email, isEmailVerified: false
    }, { isEmailVerified: true }, { new: true })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }

    res.status(200).json({
        success: true,
        message: 'Email verified successfully, please try to login'
    })
}
// ========================================= SignIn API ================================//

/**
 * destructuring the required data from the request body 
 * get user by email and check if isEmailVerified = true
 * if not return error invalid login credentails
 * if found
 * check password
 * if not return error invalid login credentails
 * if found
 * generate login token
 * updated isLoggedIn = true  in database
 * return the response
 */
export const login = async (req,res,next)=>{
    const{email,password}=req.body
    //get user by email
    const user = await User.findOne({email,isEmailVerified:true,isDeleted:false})
    if (!user) {
        return next(new Error('Invalid login credentails', { cause: 404 }))
    }
    //check password
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
        return next(new Error('Invalid login credentails', { cause: 404 }))
    }
     // generate login token
     const token = jwt.sign({ email, id: user._id, loggedIn: true }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1d' })
     user.token = token
     // updated isLoggedIn = true  in database
     user.isLoggedIn = true
     await user.save()
 
     res.status(200).json({
         success: true,
         message: 'User logged in successfully',
         data: {
             token
         }
     })

}
// ========================================= Forget Password API ================================//

export const forgetPassword = async (req, res, next)=>{
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found", { cause: 400 }));
  const OTP = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  await User.updateOne({ email }, { $set: { OTP } });
  const token = jwt.sign({ email, id: user._id, OTP }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1h' })
  const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/reset/${token}`
  await sendEmailService({
    to:email,
    subject:'Reset Password',
    message:`<h1>Please check click this link to reset your password ${resetPasswordLink}</h1>`,
})
  res.status(200).json({ message: `Done,Check your email` });
}
// ========================================= Verify Reset Code API ================================//

export const verifyResetCode = async (req, res, next)=>{
  const { newPassword } = req.body;
  const {token} = req.params
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_LOGIN)
  console.log(decodedData);
  const user = await User.findOne({ email:decodedData.email,OTP:decodedData.OTP});
  if (!user) return next(new Error("you already reset your password", { cause: 400 }));
  await User.updateOne({ email:decodedData.email }, { $unset: { OTP: 1 } });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.save();
  res.status(200).json({ message: `Success Password Updated` });
}

// ========================================= Update User Data API ================================//

export const updateUserData = async (req, res, next)=>{
  const userId = req.authUser._id;
  const { username, email,  age,  phoneNumbers, addresses} = req.body;
  const user = await User.findById(userId);
  // Check for conflicts  email
  if (email) {
    if (email == user.email)
      return next(new Error("Email already in use by you.", { cause: 400 }));
    const emailConflict = await User.findOne({ email });
    if (emailConflict)
      return next(
        new Error("Email already in use by another user.", { cause: 400 })
      );
  }

  // Update user account data
  user.email = email || user.email;
  user.phoneNumbers = phoneNumbers || user.phoneNumbers;
  user.username = username || user.username;
  user.age = age || user.age;
  user.addresses = addresses || user.addresses;

  await user.save();

  res.status(200).json({ message: "Account updated successfully." });
}
// ========================================= Update Password API ================================//

export const updatePassword = async (req, res, next)=> {
  const { password, newPassword } = req.body;
  const user = await User.findById(req.authUser._id);
  if (!user) return next(new Error("User not found", { cause: 400 }));
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return next(new Error("Invalid password", { cause: 400 }));
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.findByIdAndUpdate(
    req.authUser._id,
    {
      password: hashedPassword,
    },
    { new: true }
  );
  res.status(200).json({ message: "Success" });
}
// ========================================= Get User Data API ================================//

export const getUserData = async (req, res, next)=> {
  const user = await User.findById(req.authUser._id, "-_id -password -__v -OTP ");
  if (!user) return next(new Error("User not found"));
  res.status(200).json({ message: "Success", user });
}
// ========================================= Soft Delelte User API ================================//
export const softDeleteUser = async (req,res,next)=>{
  const user = await User.findByIdAndUpdate(req.authUser._id, { isDeleted: true });
  if (!user) return next(new Error("Delelte user fail"));
  res.status(200).json({ message: "User deleted successfully" });
}