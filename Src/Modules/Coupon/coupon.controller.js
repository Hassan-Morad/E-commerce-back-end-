
import Coupon from '../../../DB/Models/coupon.model.js'
import CouponUsers from '../../../DB/Models/coupon-users.model.js'
import User from '../../../DB/Models/user.model.js'
import { applyCouponValidation } from '../../utils/coupon.validation.js'

//============================== Add Coupon API ==============================//
/**
 * @param {*} req.body  { couponCode , couponAmount , fromDate, toDate , isFixed , isPercentage, Users}
 * @param {*} req.authUser  { _id:userId} 
 * @returns  {message: "Coupon added successfully",coupon, couponUsers}
 * @description create coupon and couponUsers
 */
export const addCoupon = async (req, res,next) => {
    const {
        couponCode , 
        couponAmount , 
        fromDate, 
        toDate , 
        isFixed ,
        isPercentage,
        Users  // [{userId, maxUsage},{userId,maxUsage}]  => [{userId, maxUsage, couponId}]
    } = req.body

    const {_id:addedBy } = req.authUser

    // couponcode check
    const isCouponCodeExist = await Coupon.findOne({couponCode})
    if(isCouponCodeExist) return next({message: "Coupon code already exist", cause: 409})

    if(isFixed == isPercentage) return next({message: "Coupon can be either fixed or percentage", cause: 400})

    if(isPercentage) {
        if(couponAmount > 100) return next({message: "Percentage should be less than 100", cause: 400})
    }

    const couponObject = {
        couponCode,
        couponAmount,
        fromDate,
        toDate,
        isFixed,
        isPercentage,
        addedBy
    }

    const coupon = await Coupon.create(couponObject)

    const userIds =[]
    for (const user of Users) {
        userIds.push(user.userId)
    }
    const isUserExist = await User.find({_id:{$in:userIds}})
    if( isUserExist.length  != Users.length) return next({message: "User not found", cause: 404})
    

    const couponUsers = await CouponUsers.create(
        Users.map(ele => ({...ele, couponId: coupon._id}))
        )
    res.status(201).json({message: "Coupon added successfully",coupon, couponUsers})

}
 
/**
 * Anotehr APIs from coupon module
 * getAllCoupons
 * getCouponByCode
 * updateCoupon  , set the loggedInUserId as updatedBy
 * deleteCoupon
*/


//=========================== For Testing ===========================//
export const validteCouponApi = async (req,res,next)=>{
    const {code} = req.body
    const {_id:userId} = req.authUser // const userId  = req.authUser._id

    // applyCouponValidation
    const isCouponValid = await applyCouponValidation(code , userId)
    if(isCouponValid.status){
        return next({message:isCouponValid.msg , cause:isCouponValid.status})
    }

    res.json({message:'coupon is valid', coupon:isCouponValid})
   
}