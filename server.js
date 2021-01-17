const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
var multer = require( 'multer');
var upload = multer();
// const serveStatic = require("serve-static")
// const path = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.array());


//imported routes
const
  data = require('./routes/route_data')

// app.use('/', serveStatic(path.join(__dirname, '/dist')))


//linked routes (route middleware)
app.use("/", [data]);


//port
const PORT = process.env.PORT || 13377;
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT);
});
