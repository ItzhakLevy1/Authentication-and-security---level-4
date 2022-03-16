require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// By adding "new mongoose.Schema this is now an object created from the "mongoose.Schema" class as required in the mongoose-encryption documentaion (and no longer a simple javascript object).
const userSchema = new mongoose.Schema ({   
  email: String,
  password: String
});


const User = new mongoose.model("User", userSchema)

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

////////////////////////// Level  - Salting and hashing passwords with bcrypt //////////////////////////

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {  // Using bcrypt we add salting to the user's password and hash all of it.
    const newUser = new User({
      email: req.body.username,    // Catching whatever the user typed into the username field.
      password: hash   // Catching whatever the user typed into the password field and turning it into a hashed password. 
    });
  
    newUser.save(function(err){
      if (err) {
        console.log(err);
      } else {
        res.render("Secrets");
      }
    });
});
 
});


app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;   

//  Looking through our "User.findOne" collection of users in our data base to see if the "email" field which is in our database matches with the "username" that is the user name who is trying to log in.
  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      // Checking if the user username "foundUser" that was found matches the password that the user typed in the loging page.
      if (foundUser) {  
        // Using bcrypt we comparing the password that the user has typed into the password field and is trying to log in with to the password inside our data base "foundUser.password".
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result == true) { // If the password with the salt and after hashing is equal to the hash "foundUser.password" that we have got stored in our data base.
            res.render("secrets");
          }
        });
      }
    }
  });    
});






app.listen(3000, function(req, res){
  console.log("Server started on port 3000.");
});
