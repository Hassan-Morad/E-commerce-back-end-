import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import slugify from "slugify";
import generateUniqueString from "../../utils/generate-Unique-String.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import Brand from '../../../DB/Models/brand.model.js'
//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name } = req.body;
  const { categoryId } = req.params;
  const { _id } = req.authUser;

  // 2- check if the subcategory name is already exist
  const isNameDuplicated = await SubCategory.findOne({ name });
  if (isNameDuplicated) {
    return next({ cause: 409, message: "SubCategory name is already exist" });
    // return next( new Error('Category name is already exist' , {cause:409}) )
  }

  // 3- check if the category is exist by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return next({ cause: 404, message: "Category not found" });

  // 4- generate the slug
  const slug = slugify(name, "-");

  // 5- upload image to cloudinary
  if (!req.file) return next({ cause: 400, message: "Image is required" });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`,
    });

  // 6- generate the subCategory object
  const subCategory = {
    name,
    slug,
    Image: { secure_url, public_id },
    folderId,
    addedBy: _id,
    categoryId,
  };
  // 7- create the subCategory
  const subCategoryCreated = await SubCategory.create(subCategory);
  res.status(201).json({
    success: true,
    message: "subCategory created successfully",
    data: subCategoryCreated,
  });
};
//============================== Update SubCategory ==============================//

export const updateSubCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, oldPublicId } = req.body;
  // 2- destructuring the request params
  const { subCategoryId, categoryId } = req.query;
  // 3- destructuring _id from the request authUser
  const { _id } = req.authUser;

  // 4- check if the category is exist bu using categoryId
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory)
    return next({ cause: 404, message: "Sub-category not found" });
  const category = await Category.findById(categoryId);
  if (!category) return next({ cause: 404, message: "Category not found" });
  // 5- check if the use want to update the name field
  if (name) {
    // 5.1 check if the new category name different from the old name
    if (name == subCategory.name) {
      return next({
        cause: 400,
        message:
          "Please enter different subCategory name from the existing one.",
      });
    }

    // 5.2 check if the new category name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "subCategory name is already exist" });
    }

    // 5.3 update the category name and the category slug
    subCategory.name = name;
    subCategory.slug = slugify(name, "-");
  }

  // 6- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    const newPulicId = oldPublicId.split(`${subCategory.folderId}/`)[1];

    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`,
        public_id: newPulicId,
      }
    );

    subCategory.Image.secure_url = secure_url;
  }

  // 7- set value for the updatedBy field
  subCategory.updatedBy = _id;

  await subCategory.save();
  res.status(200).json({
    success: true,
    message: "subCategory updated successfully",
    data: subCategory,
  });
};
//============================== Delete SubCategory ==============================//
export const deleteSubCategory = async (req, res, next) => {
  const { subCategoryId,categoryId } = req.query;
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("Sub Category not found", { cause: 400 }));
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new Error("Sub Category not found", { cause: 400 }));
  }
  //  Delete the folder and its contents from Cloudinary
  const folderPath = `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${subCategory.folderId}`;
 await cloudinaryConnection().api.delete_resources_by_prefix(folderPath);
 await cloudinaryConnection().api.delete_folder(folderPath);

 const brand = await Brand.deleteMany({ subCategoryId:subCategory._id });
 if (brand.deletedCount <= 0) {
   console.log(brand.deletedCount);
   console.log("There is no related brand");
 }
  await SubCategory.findByIdAndDelete(subCategoryId);
  res.status(200).json({ message: "Sub-category deleted" });
};
export const getSubCtegoryById = async (req, res, next) => {
  const { subCategoryId } = req.params;
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return next(new Error("Category not found"));
  }
  res.status(200).json({ message: "Success", subCategory });
};
