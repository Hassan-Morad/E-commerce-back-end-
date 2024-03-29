
import Coupon from '../../DB/Models/coupon.model.js'
import CouponUsers from '../../DB/Models/coupon-users.model.js'
import { DateTime } from 'luxon'

export async function applyCouponValidation(couponCode, userId){

    // couponCodeCheck
    const coupon  = await Coupon.findOne({couponCode})
    if(!coupon) return { msg: 'CouponCode is invalid' , status:400}

    // couponStatus Check
    console.log( DateTime.fromISO(coupon.toDate),DateTime.now());
    if(
        coupon.couponStatus == 'expired' || 
        DateTime.fromISO(coupon.toDate) < DateTime.now()
    ) return { msg: 'this coupon is  expired' , status:400}
    // start date check
    if(
        DateTime.now() < DateTime.fromISO(coupon.fromDate) 
    ) return { msg: 'this coupon is not started yet' , status:400}


    // user cases
    const isUserAssgined = await CouponUsers.findOne({couponId:coupon._id , userId})
    if(!isUserAssgined) return { msg: 'this coupon is not assgined to you' , status:400}

    // maxUsage Check
    if(isUserAssgined.maxUsage <= isUserAssgined.usageCount)  return { msg: 'you have exceed the usage count for this coupon' , status:400}

    return coupon

}


// 10 pm
// 12 am 