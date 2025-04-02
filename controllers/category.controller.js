import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import CategoryModel from '../models/category.model.js';


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,       // Click 'View API Keys' above to copy your API secret
    secure: true
});



/// Category Image Upload 
var imagesArr = []
const uploadCategoryImagesController = async (req, res) => {
    try {
        imagesArr = [];

        const userId = req.userId;  // Auth Middleware
        const image = req.files;

        // ---- Original Image Store ====


        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false
        }

        for (let i = 0; i < image?.length; i++) {
            const img = await cloudinary.uploader.upload(
                image[i]?.path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req?.files[i]?.filename}`);
                    console.log(result);
                }
            )

            return res.status(200).json({
                images: imagesArr
            })
        }

    } catch (error) {
        console.error("Error uploading avatar:", error.message);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};

// Create a Category 
const createCategoryController = async (req, res) => {
    try {
        const userId = req.userId

        let category = new CategoryModel({
            name: req.body.name,
            images: imagesArr,
            color: req.body.color,
            parentId: req.body.parentId,
            parentCatName: req.body.parentCatName
        })

        category = await category.save()
        return res.status(200).json({
            message: "Create Category Successfully",
            error: false,
            success: true,
            category: category
        });

    } catch (error) {
        console.error("Error uploading avatar:", error.message);
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};


export { uploadCategoryImagesController, createCategoryController }