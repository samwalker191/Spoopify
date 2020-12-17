const express = require("express");
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;
const db = require('./config/keys').mongoURI;
const bodyParser = require('body-parser');

// connect to db
mongoose
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.log(err));

// import routers
const users = require('./routes/api/users');

// install middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
require('./config/passport')(passport);

// setup routes
app.use("/api/users", users);

app.listen(port, () => console.log(`Server is running on port ${port}`));