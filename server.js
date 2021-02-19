const express = require("express")
const cors = require("cors")
const multer = require( 'multer')
const app = express();
var upload = multer();

app.use(cors())
app.use(express.json())
app.use(upload.array())
app.use(express.urlencoded({ extended: false }))


//imported routes
const
  gmail = require('./routes/parse_gmail')
  docs = require('./routes/route_docs')

//linked routes
app.use("/", [gmail, docs]);


//port
const PORT = process.env.PORT || 13377;
app.listen(PORT, function() {
  console.log("Server is running on port:", PORT);
});
