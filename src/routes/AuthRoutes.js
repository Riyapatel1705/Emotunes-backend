import express from 'express';
import {register,login} from '../Controllers/AuthController.js';
 const AuthRouter=express.Router();

 AuthRouter.post('/register',register);
 AuthRouter.post('/login',login);

 export default AuthRouter;
