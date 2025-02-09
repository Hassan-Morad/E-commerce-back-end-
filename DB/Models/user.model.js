import { Schema, model } from "mongoose";
import { systemRoles } from "../../Src/utils/system-roles.js";

const userSchema = Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      tirm: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      tirm: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    addresses: [
      {
        type: String,
        required: true,
      },
    ],
    role: {
      type: String,
      enum: [
        systemRoles.USER,
        systemRoles.ADMIN,
        systemRoles.SUPER_ADMIN,
        systemRoles.DELIEVER_ROLE,
      ],
      default: systemRoles.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    OTP: {
      type: String,
      required: false,
    },
    token:{type:String}
  },
  { timestamps: true }
);

export default model("User", userSchema);
