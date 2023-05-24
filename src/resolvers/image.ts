import { GraphQLUpload } from "graphql-upload-minimal";
import { CustomError } from "../util/errors";
import { StatusCodes } from "http-status-codes";
import image_uploader from "../util/imageUploader";
import vendorModel from "../models/vendor";
import { AuthenticationError } from "apollo-server-core";
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const image_resolvers = {
    Upload: GraphQLUpload,
    Mutation: {
        uploadImage: async (_: any, file: any, userId: any) => {
            return new Promise(async (resolve, reject) => {
                try {
                    console.log(userId, "s;lslslsl")
                    if (JSON.stringify(userId) === '{}') {
                        console.log(userId, "flfllflflfllf")
                        reject(new CustomError('Token Expired', StatusCodes.BAD_GATEWAY))
                    } else {
                        if (!(file.file)) {
                            reject(new CustomError('Please Upload Image', StatusCodes.BAD_GATEWAY))
                        } else {
                            const { createReadStream, filename } = await file.file;
                            const uploadOptions = {
                                folder: 'uploads', // Optional: Set a folder name for organizing your uploads
                                public_id: filename, // Optional: Set a specific public_id for the uploaded image
                            };
                            createReadStream()
                                .pipe(cloudinary.uploader.upload_stream(uploadOptions, async (error: any, result: any) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        const updateProfile = (await vendorModel.updateOne({ _id: userId.id }, { image: result.secure_url })).modifiedCount
                                        resolve(updateProfile);
                                    }
                                }));
                        }
                    }
                } catch (err) {
                    reject(err);
                }
            });
        },
    },
};

export default image_resolvers;

// uploadImage: async (_: any, { file }: any) => {
        //     try {
        //         //   console.log(process.env.CLOUD_NAME,"dldl")
        //         //   const path = require('path');
        //         //   const mainDir = path.dirname(require.main?.filename)
        //         //   const fileName = `${mainDir}/graphql/public/image/traditional-food-around-the-world-Travlinmad.jpg`
        //         //   console.log(fileName, "slsls")
        //         //   const result = await cloudinary.v2.uploader.upload(fileName);

        //         const { createReadStream, filename } = await file;
        //         const stream = createReadStream();
        //         console.log(stream, "d;ldld", createReadStream, "dldldldld", filename)
        //         const uploadOptions = {
        //             folder: 'your_folder_name', // Optional folder name
        //             public_id: filename, // Use the filename as the public ID
        //             overwrite: true,
        //             resource_type: 'auto', // Determine resource type dynamically based on file content
        //         };

        //         // Upload the image to Cloudinary
        //         const result = await cloudinary.uploader.upload(stream, uploadOptions);
        //         // Return the uploaded image details
        //         return {
        //             // name:file.name,
        //             public_id: "result.public_id",
        //             secure_url: "result.secure_url",
        //             format: "result.format,"
        //         };
        //     } catch (err) {
        //         console.log(err)
        //     }
        // }