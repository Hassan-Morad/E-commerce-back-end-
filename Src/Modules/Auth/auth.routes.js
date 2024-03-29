import { Router } from "express";
import * as authController from "./auth.controller.js";
import expressAsyncHandler from "express-async-handler";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
const router = Router();

router.post("/", expressAsyncHandler(authController.signUp));
router.post("/login", expressAsyncHandler(authController.login));
router.get("/verify-email", expressAsyncHandler(authController.verifyEmail));

router.post(
  "/forgetpassword",
  expressAsyncHandler(authController.forgetPassword)
);
router.post(
  "/reset/:token",
  expressAsyncHandler(authController.verifyResetCode)
);
router.put(
  "/updateUser",
  auth([
    systemRoles.USER,
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.DELIEVER_ROLE,
  ]),
  expressAsyncHandler(authController.updateUserData)
);
router.put(
  "/updatePassword",
  auth([
    systemRoles.USER,
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.DELIEVER_ROLE,
  ]),
  expressAsyncHandler(authController.updatePassword)
);
router.get(
  "/getUserData",
  auth([
    systemRoles.USER,
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.DELIEVER_ROLE,
  ]),
  expressAsyncHandler(authController.getUserData)
);
router.delete(
  "/deleteUser",
  auth([
    systemRoles.USER,
    systemRoles.ADMIN,
    systemRoles.SUPER_ADMIN,
    systemRoles.DELIEVER_ROLE,
  ]),
  expressAsyncHandler(authController.softDeleteUser)
);

export default router;
