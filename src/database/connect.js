import mongoose from "mongoose";

const connectDb = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URL}`)
    } catch (error) {
        console.log("MongoDB connection failed" , error);
        process.exit(1)
        
    }
}

export default connectDb;