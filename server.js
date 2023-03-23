/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var passport = require("passport");
var authController = require("./auth");
var authJwtController = require("./auth_jwt");
db = require("./db")(); //hack
var jwt = require("jsonwebtoken");
var cors = require("cors");

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
  var json = {
    headers: "No headers",
    key: process.env.UNIQUE_KEY,
    body: "No body",
  };

  if (req.body != null) {
    json.body = req.body;
  }

  if (req.headers != null) {
    json.headers = req.headers;
  }

  return json;
}

router.post("/signup", (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({
      success: false,
      msg: "Please include both username and password to signup.",
    });
  } else {
    var newUser = {
      username: req.body.username,
      password: req.body.password,
    };

    db.save(newUser); //no duplicate checking
    res.json({ success: true, msg: "Successfully created new user." });
  }
});

router.all("/signup", (req, res) => {
  res.status(501);
  res.send("Doesn't support the HTTP method");
});

router.post("/signin", (req, res) => {
  var user = db.findOne(req.body.username);

  if (!user) {
    res.status(401).send({
      success: false,
      msg: "Authentication failed. User not found.",
    });
  } else {
    if (req.body.password == user.password) {
      var userToken = { id: user.id, username: user.username };
      var token = jwt.sign(userToken, process.env.SECRET_KEY);
      res.json({ success: true, token: "JWT " + token });
    } else {
      res.status(401).send({ success: false, msg: "Authentication failed." });
    }
  }
});

router.all("/signin", (req, res) => {
  res.status(200);
  res.send("Doesn't support the HTTP method");
});

router
  .route("/movies")
  .get((req, res) => {
    let obj = getJSONObjectForMovieRequirement(req);
    obj.message = `GET movies`;
    obj.status = res.statusCode;
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .post((req, res) => {
    let obj = getJSONObjectForMovieRequirement(req);
    obj.message = "movie saved";
    obj.status = res.statusCode;
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .delete(authController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    let obj = getJSONObjectForMovieRequirement(req);
    obj.query = req.query || "No query string";
    //let obj = getJSONObjectForMovieRequirement(req);
    obj.status = res.status;
    obj.message = "movie deleted";
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .put(authJwtController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }
    let obj = getJSONObjectForMovieRequirement(req);
    obj.status = res.status;
    obj.message = "movie updated";
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .all((req, res) => {
    res.status(200);
    res.send("Doesn't support the HTTP method");
  });

router
  .route("/testcollection")
  .delete(authController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }
    let obj = getJSONObjectForMovieRequirement(req);
    obj.status = res.status;
    obj.message = "movie deleted";
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .put(authJwtController.isAuthenticated, (req, res) => {
    console.log(req.body);
    res = res.status(200);
    if (req.get("Content-Type")) {
      res = res.type(req.get("Content-Type"));
    }
    let obj = getJSONObjectForMovieRequirement(req);
    obj.status = res.status;
    obj.message = "movie updated";
    obj.query = req.query || "No query string";
    res.json(obj);
  })
  .all((req, res) => {
    res.status(200);
    res.send("Doesn't support the HTTP method");
  });

app.use("/", router);
app.use("/", (req, res) => {
  res.status(200);
  res.send("Doesn't support the HTTP method");
});
app.listen(process.env.PORT || 8080, () => {
  console.log("Listening on port:", process.env.PORT || 8080);
});
module.exports = app; 



