
import { Router } from "express";
import * as  couponController from "./coupon.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import * as validators from  './coupon.validationSchemas.js';
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();
             
router.post('/addCoupon' , 
auth([systemRoles.ADMIN,systemRoles.SUPER_ADMIN]) ,
validationMiddleware(validators.addCouponSchema),
 expressAsyncHandler(couponController.addCoupon))


 
router.post('/valid' , 
auth(systemRoles.USER) ,
 expressAsyncHandler(couponController.validteCouponApi))


export default router;