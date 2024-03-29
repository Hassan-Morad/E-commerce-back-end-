import { Router } from 'express'
const router = Router()

import * as orderController from './order.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { systemRoles } from '../../utils/system-roles.js'
import expressAsyncHandler from 'express-async-handler'



router.post('/createOrder', 
auth([systemRoles.USER]),
 expressAsyncHandler(orderController.createOrder))


router.post('/cartToOrder',
auth([systemRoles.USER]),
expressAsyncHandler(orderController.convertFromcartToOrder))


router.put('/delieverOrder/:orderId',
auth([systemRoles.DELIEVER_ROLE]),
expressAsyncHandler(orderController.delieverOrder))


export default router