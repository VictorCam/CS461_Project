const express = require("express");
const cors = require("cors");
const app = express();
var multer = require( 'multer');
var upload = multer();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
