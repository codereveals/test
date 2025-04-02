import mongoose from "mongoose";

const ConnectDb = async () => {
    if (!process.env.MONGODB_URL) {
        throw new Error("Please provide the MongoDB URL in the environment variables.");
    }

    try {
        // Setting some options for mongoose connection
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(process.env.MONGODB_URL, options);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message || error);
        process.exit(1); // Exit the process with failure
    }
};

export default ConnectDb;
