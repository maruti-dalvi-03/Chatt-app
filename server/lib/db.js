import mongoose from "mongoose";

//fun to connect to the mongodb database
export const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('Database connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`);
    }catch(err) {
        console.log(err);
    }
}

