import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";
import { createCategoryController, uploadCategoryImagesController } from "../controllers/category.controller.js";


const categoryRouter = Router()

categoryRouter.post("/uploadCatImages", auth, upload.array('images'), uploadCategoryImagesController)
categoryRouter.post("/create-category", auth, upload.array('images'), createCategoryController)


export default categoryRouter