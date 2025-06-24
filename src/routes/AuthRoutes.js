import express from 'express';
import {register,login} from '../Controllers/AuthController.js';
 const AuthRouter=express.Router();

 AuthRouter.post('/register',register);//register the user
 AuthRouter.post('/login',login);//login  the user

 export default AuthRouter;
