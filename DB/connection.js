import mongoose from "mongoose";

const db_connection = async()=>{
    mongoose.connect('mongodb://127.0.0.1:27017/E-commerce')
    .then((res)=>console.log('Connected to MongoDB'))
    .catch((err)=>console.log('MongoDB connection error:', err))
}
export default db_connection;
