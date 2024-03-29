import { Router } from "express";
import * as category from "./category.controller.js";
import { auth } from "./../../middlewares/auth.middleware.js";
import { multerMiddleHost } from "./../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { systemRoles } from "../../utils/system-roles.js";
import expressAsyncHandler from "express-async-handler";
const router = Router();

router.post(
  "/add",
  auth(systemRoles.SUPER_ADMIN),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(category.addCatecory)
);
router.put(
  "/update/:categoryId",
  auth(systemRoles.SUPER_ADMIN),
  multerMiddleHost({
    extensions: allowedExtensions.image,
  }).single("image"),
  expressAsyncHandler(category.updateCategory)
);
router.get("/getAllCategory", expressAsyncHandler(category.getAllCategories));
router.get("/getAllSubCategoryForSpecificCategory/:categoryId", expressAsyncHandler(category.getAllSubCatecoryForSpecificCategory));
router.get("/getCtegoryById/:categoryId", expressAsyncHandler(category.getCtegoryById));
router.delete(
  "/delete/:categoryId",
  auth(systemRoles.SUPER_ADMIN),
  expressAsyncHandler(category.deleteCategory)
);

export default router;
