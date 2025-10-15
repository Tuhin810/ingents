import { 
  verifyToken, 
  signupUser, 
  loginUser, 
  logoutUser, 
  getOtp, 
  googleSignUp, 
  createUsers, 
  getUsers 
} from "./auth/auth.api";

export const api = {
  auth: {
    verifyToken,
    signupUser,
    loginUser,
    logoutUser,
    getOtp,
    googleSignUp,
    createUsers,
    getUsers
  }
}