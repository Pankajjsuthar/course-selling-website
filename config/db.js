const mongoose = require("mongoose");
const db = "mongodb+srv://pankaj:suthar@cluster0.ahockzo.mongodb.net/";

mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async ()=> {
    try{
        await mongoose.connect(db);
        console.log("MongoDB is connected.");
    }
    catch(err){
        console.error(err.message);
    }
};

module.exports(connectDB);