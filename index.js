const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());

const secretKey = "S3cr3tK3y";

const authenticateJwt = (req, res, next) => {
  const auth = req.headers.authorise;
  if (auth) {
    const token = auth.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        res.sendStatus(500);
      }
      req.user = user;
      next();
    });
  }
  else{
    res.sendStatus(500);
  }
};

//mongodb schemaas

const adminSchema = new mongoose.Schema({
  username : String,
  password : String,
});

const userSchema = new mongoose.Schema({
  username : String,
  password : String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new mongoose.Schema({
  title : String,
  description : String,
  price : Number,
  imageLink : String,
  published : Boolean
});

//define mongoose models
const User = mongoose.model('User',userSchema);
const Admin = mongoose.model('Admin',adminSchema);
const Course = mongoose.model('Course',courseSchema);

//connect db
const db = "mongodb+srv://pankajsuthar:mongodb@cluster0.z6ypah4.mongodb.net/";
async function connectDB(){
  try{
      await mongoose.connect(db);
      console.log("MongoDB is connected.");
  }
  catch(err){
      console.error(err.message);
  }
}
connectDB();


// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const {username,password} = req.body;
  function callback(admin){
    if(admin){
      res.status(403).json({message : "Admin already exists."});
    }
    else{
      const obj = {username : username, password : password};
      const newAdmin = new Admin(obj);
      newAdmin.save();
      const token = jwt.sign({username : username, role : "Admin" }, secretKey, {expiresIn : '1hr'});
      res.status(200).json({message : "Admin created successfully.", token});
    }
  }
  Admin.findOne({username}).then(callback);
});

app.post("/admin/login",async (req, res) => {
  // logic to log in admin
  const {username,password} = req.body;
  const admin = await Admin.findOne({username,password});
  const token = jwt.sign({username,role : "Admin"},secretKey,{expiresIn : '1hr'});
  if(admin){
      res.status(200).json({message : "Logged in successfully.", token});
    }
    else{
      res.status(403).json({message : "Invalid username or password."});
    }
});

app.post("/admin/courses",authenticateJwt,async (req, res) => {
  // logic to create a course
  const course = req.body;
  const newCourse = new Course(course);
  await newCourse.save();
  res.status(200).send("Course created successfully.");
});

app.put("/admin/courses/:courseId", authenticateJwt, async (req, res) => {
  try {
    // logic to edit a course
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });

    if (course) {
      res.status(200).json({ message: "Course updated successfully.", course });
    } else {
      res.status(404).json({ message: "Course not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while updating course." });
  }
});

app.get("/admin/courses",authenticateJwt,async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.json({courses});
});

// User routes
app.post("/users/signup",async (req, res) => {
  // logic to sign up user
  const {username,password} = req.body;
  const userfound =await User.findOne({username});
  if(userfound){
    res.status(404).json({message : "User already exists."});
  }
  else{
    const obj = {username : username, password : password};
    const user = new User(obj);
    await user.save();
    const token = jwt.sign({username : username, role : "User"}, secretKey,{expiresIn : "1hr"});
    res.status(201).json({message : "User created successfully.", token});
  }
});

app.post("/users/login", async (req, res) => {
  // logic to log in user
  const {username,password} = req.headers;
  const user =await User.findOne({username,password});
  if(user){
    const token = jwt.sign({username : username, role : "User"}, secretKey,{expiresIn : "1hr"});
    res.status(200).json({message : "Logged in successfully.", token});
  }
  else{
    res.status(404).json({message : "Invalid username or password."});
  }
});

app.get("/users/courses",authenticateJwt,async (req, res) => {
  // logic to list all courses
  const course = await Course.find({published : true});
  res.status(200).json(course);
});

app.post("/users/courses/:courseId",authenticateJwt, async (req, res) => {
  // logic to purchase a course
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  if(course){
    const user = await User.findOne({username : req.headers.username});
    if(user){
      user.purchasedCourses.push(course);
      await user.save();
      res.status(200).json({message : "Course purchased successfully."});
    }
    else{
      res.status(403).json({message : "User not found."});
    }
  }
  else{
    res.status(403).json({message : "Course not found."});
  }
});

app.get("/users/purchasedCourses",authenticateJwt,async (req, res) => {
  // logic to view purchased courses
  const user = await User.findOne({username : req.user.username}).populate('purchasedCourses');
  if(user){
    res.json({purchasedCourses : user.purchasedCourses || []});
  }
  else{
    res.status(403).json({message : "User not found."});
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
