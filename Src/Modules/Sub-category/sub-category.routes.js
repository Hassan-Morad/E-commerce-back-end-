import { Router } from "express";
import { auth } from "./../../middlewares/auth.middleware.js";
import { multerMiddleHost } from "./../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import expressAsyncHandler from "express-async-handler";
import * as subCategoryController from "./sub-category.controller.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.post(
  "/add/:categoryId",
  auth(systemRoles.SUPER_ADMIN),
  multerMiddleHost({
    extensions: allowedExtensions.image,
  }).single("image"),
  expressAsyncHandler(subCategoryController.addSubCategory)
);
router.put(
  "/updateSubCategory",
  auth(systemRoles.SUPER_ADMIN),
  multerMiddleHost({
    extensions: allowedExtensions.image,
  }).single("image"),
  expressAsyncHandler(subCategoryController.updateSubCategory)
);
router.delete(
  "/deleteSubCategory",
  auth(systemRoles.SUPER_ADMIN),
  expressAsyncHandler(subCategoryController.deleteSubCategory)
);  
router.get("/getSubCtegoryById/:subCategoryId", expressAsyncHandler(subCategoryController.getSubCtegoryById));

export default router;
