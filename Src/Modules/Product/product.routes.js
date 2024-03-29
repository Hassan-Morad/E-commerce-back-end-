import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as productController from './product.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { systemRoles } from '../../utils/system-roles.js'
const router = Router()



router.post('/addProduct',
    auth([systemRoles.SUPER_ADMIN,systemRoles.ADMIN]),
    multerMiddleHost({ extensions: allowedExtensions.image }).array('image', 3),
    expressAsyncHandler(productController.addProduct)
)


router.put('/updateProduct/:productId',
    auth([systemRoles.SUPER_ADMIN,systemRoles.ADMIN]),
    multerMiddleHost({ extensions: allowedExtensions.image }).single('image'),
    expressAsyncHandler(productController.updateProduct)
)
router.get('/getAllProducts', expressAsyncHandler(productController.getAllProducts))


export default router
