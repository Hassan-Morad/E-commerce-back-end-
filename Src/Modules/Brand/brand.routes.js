import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as brandController from "./brand.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();

router.post(
  "/add",
  auth([systemRoles.ADMIN, systemRoles.SUPER_ADMIN]),
  multerMiddleHost({
    extensions: allowedExtensions.image,
  }).single("image"),
  expressAsyncHandler(brandController.addBrand)
);

router.put(
  "/updateBrand",
  auth(systemRoles.SUPER_ADMIN),
  multerMiddleHost({
    extensions: allowedExtensions.image,
  }).single("image"),
  expressAsyncHandler(brandController.updateBrand)
);
router.delete(
  "/deleteBrand/:brandId",
  auth(systemRoles.SUPER_ADMIN),
  expressAsyncHandler(brandController.deleteBrand)
);

export default router;
