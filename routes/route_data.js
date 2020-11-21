const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require('fs');
const { Base64 } = require('js-base64');
const { isEmpty } = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const axios = require("axios")
const db = new sqlite3.Database('./database/beavdms.db');
var createBody = require('gmail-api-create-message-body');

const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document

db.serialize(function () {
    db.run(
        "CREATE TABLE IF NOT EXISTS Projects (ProjID INTEGER PRIMARY KEY, Name TEXT NOT NULL, GitHub TEXT NOT NULL)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS Users (UserID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Email TEXT NOT NULL, Major TEXT NOT NULL)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS Documents (DocID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Description TEXT, Location TEXT NOT NULL, OwnerID INTEGER NOT NULL, Project INTEGER, DateAdded TEXT NOT NULL, FOREIGN KEY(OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE, FOREIGN KEY(Project) REFERENCES Projects(ProjID) ON DELETE CASCADE)"
    );
    db.run(
        "CREATE TABLE IF NOT EXISTS Permissions (PermID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions INTEGER NOT NULL, FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON DELETE CASCADE)"
    );
});

/**
 * Example INSERT and SELECT statements
 */

//Projects: Name, GitHub
// db.run("INSERT INTO Projects (Name, GitHub) VALUES (?, ?)", ["BeaverDMS", "https://github.com/VictorCam/CS461_Project"]);
// // Users: Name, Email, Major
// db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Travis Shands", "shandst@gmail.com", "Computer Science"]);
// db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Bryce Albertazzi", "albertab@oregonstate.edu", "Computer Science"]);
// // Documents: Name, Description, Location, OwnerID, Project, DateAdded
// db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, (SELECT UserID FROM Users WHERE Email=?), (SELECT ProjID FROM Projects WHERE Name=?), (SELECT date('now')))", ["Beaver Doc", "Documentation of our project", "filepath", "shandst@gmail.com", "BeverDMS"]);
// db.get("SELECT DocID, Documents.Name AS Name, Users.Name AS Owner, Description FROM Documents INNER JOIN Users ON OwnerID=UserID WHERE Documents.Name='Beaver Doc'", function(err, dox) {
//   console.log("Name: ", dox.Name, " Owner: ", dox.Owner, "Description: ", dox.Description);
// });
// var currentDate = new Date();
// db.run("DELETE FROM Documents");
// db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)", ["TechProject", "A tech project", "Corvallis", 1, null, currentDate]);
// db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)", ["SportsProject", "A sports project", "Portland", 1, null, currentDate]);
// db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)", ["ExerciseProject", "An exercise project", "Seattle", 1, null, currentDate]);


var app = express();
//const connectsql = require("../server_connection"); // no server connection yet

//global constants
const userId = "gobeavdms@gmail.com"

async function get_token() {
    try {
        c_id = "407454790116-p7a8mm51ncd0fpuqmq1rf6fh44184nc7.apps.googleusercontent.com" //client id
        c_secret = "mWl-YURPy82Dmf3_EkUPFjy2" //client secret
        c_retoken = "1//06EZSqyMbPOsbCgYIARAAGAYSNwF-L9IrWh_vgBazeV84ZRrZ6dDADXVqFkh_-CCE7GMq18bDM2n1D_RKCKS7fsHxn5VdwGgPC20" //refresh token
        const url = `https://accounts.google.com/o/oauth2/token?client_id=${c_id}&client_secret=${c_secret}&refresh_token=${c_retoken}&grant_type=refresh_token`
        return await axios.post(url)
    } catch (err) {
        console.log(err)
    }
}

async function get_msg_id(access_tok) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log(err)
    }
}

async function get_msg_data(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`, "Content-type": `application/json`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log(err)
    }
}

async function post_msg_delete(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/trash`
        const data = {}
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } catch (err) {
        console.log(err)
    }
}


async function get_attachments(access_tok, g_id, a_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/attachments/${a_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log(err)
    }
}

async function post_send_msg(access_tok, raw) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/send`
        const data = { "raw": `${raw}` };
        const config = {headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } catch (err) {
        console.log("err on msg", err)
    }
}

function makeBody(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

function makeBody_w_attach(){

    receiverId = "vdcampa0@gmail.com"
    subject = "access to [name] documents"
    boundary = "dms"
    message = "hello! here are your attachments"
    attach =  'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
    'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
    'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
    'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
    'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
    'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
    'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
    'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
    'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
    'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
    'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
    'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
    'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G'

var str = [
    "MIME-Version: 1.0",
    "Content-Transfer-Encoding: 7bit",
    "to: " + receiverId,
    "subject: " + subject,
    "Content-Type: multipart/alternate; boundary=" + boundary + "\n",
    "--" + boundary,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit" + "\n",
    message+ "\n",
    "--" + boundary,
    "--" + boundary,
    "Content-Type: Application/pdf; name=myPdf.pdf",
    'Content-Disposition: attachment; filename=myPdf.pdf',
    "Content-Transfer-Encoding: base64" + "\n",
    attach,
    "--" + boundary,
    "--" + boundary,
    "Content-Type: Application/pdf; name=myPdf2.pdf",
    'Content-Disposition: attachment; filename=myPdf2.pdf',
    "Content-Transfer-Encoding: base64" + "\n",
    attach,
    "--" + boundary + "--"
].join("\n");

    var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

function parse_from(index, g_raw){
    sender_name_and_email = g_raw.data.payload.headers[index].value
    sender_name = sender_name_and_email.replace(/(?:\\[rn]|[\r\n<>"]+)+/g, "")

    var words = sender_name.split(' ')
    sender_email = words[words.length - 1]
    words.splice(-1, 1)
    sender_name = words.join(' ')
    return sender_name + "=" + sender_email
}

async function parse_data(g_raw, idx, g_access) {

    g_id = g_raw.data.id
    console.log("GOOGLE IDENTIFICATION: ", g_raw.data.id)
    sender_name_and_email = []
    sender_email = []
    sender_name = []
    date = []
    title = []
    account_access = []
    attachments = []
    message = []

    found_cmd = "no_cmd"

    //get attachments that are pdfs (this must be outside of loop)
    for (let n = 0; n < g_raw.data.payload.parts.length-1; n++) {
        if(g_raw.data.payload.parts[n+1].mimeType == "application/pdf") { //MUST BE PDF!
            var attach_json = {"mime": g_raw.data.payload.parts[n+1].mimeType, "filename": g_raw.data.payload.parts[n+1].filename, "attach_id": g_raw.data.payload.parts[n+1].body.attachmentId, "raw": null}
            attachments.push(attach_json)
        }
    }

    //subject (outside of loop so I can check first cmd on the title if not then I don't do any parsing)
    if(typeof g_raw.data.payload.headers[19] != 'undefined') {
        if(g_raw.data.payload.headers[19].name == "Subject")
            title = g_raw.data.payload.headers[19].value
    }
    if(typeof g_raw.data.payload.headers[21] != 'undefined') {
        if(g_raw.data.payload.headers[21].name == "Subject")
            title = g_raw.data.payload.headers[21].value
    }
    if(typeof g_raw.data.payload.headers[3] != 'undefined') {
        if(g_raw.data.payload.headers[3].name == "Subject")
            title = g_raw.data.payload.headers[3].value
    }
    if(typeof g_raw.data.payload.headers[4] != 'undefined') {
        if(g_raw.data.payload.headers[4].name == "Subject")
            title = g_raw.data.payload.headers[4].value
    }

    //commands: help, save, get
    if(!isEmpty(title)) {
        f_cmd = title.split(' ')

        console.log(f_cmd)
        
        //save attachments to db
        if(f_cmd[0] == "save") {
            found_cmd = "save"
        }
        else if(f_cmd[0] == "help") {
            found_cmd = "help"
        }
        else if(f_cmd[0] == "get") {
            found_cmd = "get"
        }
        else {
            found_cmd = "no_cmd"
        }
    }


    //get the new title now
    if(found_cmd != "no_cmd") {
        f_cmd.shift()
        console.log("msg", f_cmd)
        title = f_cmd.join(" ")
    }
    //if attachments is empty or if cmd not found then there is no point in parsing the rest of the data :/
    if(!isEmpty(attachments) && found_cmd != "no_cmd") {


        //query to get raw base64 attachments added in order to save them
        for (let a = 0; a < attachments.length; a++) {
            var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
            attachments[a].raw = raw.data.data
        }

        //sender name and sender email
        if(typeof g_raw.data.payload.headers[16] != 'undefined') {
            if(g_raw.data.payload.headers[16].name == "From") {
                var raw_from = parse_from(16, g_raw)
                var words = raw_from.split('=')
                sender_name = words[0]
                sender_email = words[1]
            }
        }
        if(typeof g_raw.data.payload.headers[4] != 'undefined') {
            if(g_raw.data.payload.headers[4].name == "From") {
                var raw_from = parse_from(4, g_raw)
                var words = raw_from.split('=')
                sender_name = words[0]
                sender_email = words[1]
            }
        }
        if(typeof g_raw.data.payload.headers[18] != 'undefined') {
            if(g_raw.data.payload.headers[18].name == "From") {
                var raw_from = parse_from(18, g_raw)
                var words = raw_from.split('=')
                sender_name = words[0]
                sender_email = words[1]
            }
        }
        if(typeof g_raw.data.payload.headers[5] != 'undefined') {
            if(g_raw.data.payload.headers[5].name == "From") {
                var raw_from = parse_from(5, g_raw)
                var words = raw_from.split('=')
                sender_name = words[0]
                sender_email = words[1]
            }
        }

        //date
        if(typeof g_raw.data.payload.headers[17] != 'undefined') {
            if(g_raw.data.payload.headers[17].name == "Date")
                date = g_raw.data.payload.headers[17].value
        }
        if(typeof g_raw.data.payload.headers[1] != 'undefined') {
            if(g_raw.data.payload.headers[1].name == "Date")
                date = g_raw.data.payload.headers[1].value
        }
        if(typeof g_raw.data.payload.headers[19] != 'undefined') {
            if(g_raw.data.payload.headers[19].name == "Date")
                date = g_raw.data.payload.headers[19].value
        }
        
        //message (body)
        if (g_raw.data.payload.parts[0].body.data) {
            //this exists when there is no attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r 
        } 
        else if(g_raw.data.payload.parts[0].parts[0].body.data) {
            //this exists when there is an attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        }
        else if(g_raw.data.payload.parts[0].parts[0].parts[0].body.data) {
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        }
        else {
            message = g_raw.data.snippet.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        }

        //who has access to this document
        if(typeof g_raw.data.payload.headers[20] != 'undefined') {
            if(g_raw.data.payload.headers[20].name == "To") {
                p_access = g_raw.data.payload.headers[20].value
                p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                account_access = [...new Set(p_access_regex)]
            }
        }
        if(typeof g_raw.data.payload.headers[22] != 'undefined') {
            if(g_raw.data.payload.headers[22].name == "To") {
                p_access = g_raw.data.payload.headers[22].value
                p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                account_access = [...new Set(p_access_regex)]
            }
        }
        if(typeof g_raw.data.payload.headers[5] != 'undefined') {
            if(g_raw.data.payload.headers[5].name == "To") {
                p_access = g_raw.data.payload.headers[5].value
                p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                account_access = [...new Set(p_access_regex)]
            }
        }
        if(typeof g_raw.data.payload.headers[6] != 'undefined') {
            if(g_raw.data.payload.headers[6].name == "To") {
                p_access = g_raw.data.payload.headers[6].value
                p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                account_access = [...new Set(p_access_regex)]
            }
        }
    }


    //json format
    content = {
        "id": idx,
        "g_id": g_id,
        "sender_name": sender_name,
        "sender_email": sender_email,
        "access": account_access,
        "title": title,
        "message": message,
        "attachments": attachments,
        "date": date,
        "cmd": found_cmd
    }

    return content
}



router.get("/", (req, res) => {

    async function g_request() {
        const g_access = await get_token() //getting access token 
        const g_id = await get_msg_id(g_access.data.access_token) //getting messages
        
        if (g_id.data.resultSizeEstimate == 0) { //no content meaning there is no need to preform requests
            return res.status(200).json({"No Content": "There is not content to display"})
        }

        beav_data = []
        console.log(g_id.data.resultSizeEstimate)
        for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
            var g_raw = await get_msg_data(g_access.data.access_token, g_id.data.messages[idx].id)
            //await post_msg_delete(g_access.data.access_token, g_id.data.messages[idx].id)
            var g_data = await parse_data(g_raw, idx, g_access.data.access_token)

            if(g_data.cmd != "no_cmd") {
                for(var j = 0; j < Object.keys(g_data.attachments).length; j++) {

                fs.writeFile(`./files/${g_data.g_id}-${j}.pdf`, g_data.attachments[j].raw, { encoding: 'base64' }, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
                
                db.serialize(function () {
                    db.get(`SELECT * FROM Users WHERE Email='${g_data.sender_email}'`, function (err, user) {
                        if (err) {
                            console.log(err);
                        }
                        if(!user){
                            db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Anonymous", `${g_data.sender_email}`, "Unkown"]);
                        }
                    });
                    db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, (SELECT UserID FROM Users WHERE Email=?), (SELECT ProjID FROM Projects WHERE Name=?), (SELECT date('now')))", [`${g_data.title}`, `${g_data.message}`, `./files/${g_data.g_id}-${j}.pdf`, `${g_data.sender_email}`, "BeverDMS"]);
                });
            }
            beav_data.push(g_data)
        }
    }
    //sending msg with and without attachments (DO NOT DELETE) 
    //raw = makeBody("gobeavdms@gmail.com", "gobeavdms@gmail.com", "hello loser", "hi ugly")
    //raw = makeBody_w_attach()
    //post_send_msg(g_access.data.access_token, raw)

    res.status(200).json(test)
}

    g_request()
});

router.get("/test", (req, res) => {
    // async function g_request() {
    //     const g_access = await get_token() //getting access token 


    //     res.status(200).json("ok")
    // }

    // g_request()

    // db.serialize(function () {
    //     db.all(`SELECT Documents.Location FROM Documents WHERE Documents.OwnerID = ${1}`, function (err, row, col) {
    //         if (err) {
    //             console.log(err);
    //         }
    //         else {
    //             console.log(row)
    //             res.status(200).send(row)
    //         }
    //     })
    // })

    content =  {
        "id": 0,
        "g_id": "175e1655290f7f8f",
        "sender_name": "Beaver DMS",
        "sender_email": "gobeavdms@gmail.com",
        "access": [
          "vdcampa0@gmail.com",
          "gobeavdms@gmail.com"
        ],
        "title": "hello team here is a pdf",
        "message": "I attached it here",
        "attachments": [
          {
            "mime": "application/pdf",
            "filename": "W7L5-AuthenticationProtocols-II.pdf",
            "attach_id": "ANGjdJ8w4X5Q-MOIhPyyzdNl-YIVW_VRhQqcf70Uurc9IjPmH3zaP5hvltkrClp38CjPdEP5dYFA8u1S6orONuX1g61KvZrF8Pi0f06cidXZdYXOAEOcLNPms_oXI-0hklYKrbIaX906u5CB8pWxHJuLL4e3gkMKznkpopVmo7vPVYHEpk30zzJpImhHktbZCSj1xzdSOZBQN5wVw8CGtu3n87zJO0wN70yHOU1W-g",
            "raw": "rawrxd"
          }
        ],
        "date": "Thu, 19 Nov 2020 16:45:16 +0000",
        "cmd": "save"
      }

    location_test = "./files/175e1655290f7f8f-0.pdf"



    //assume the UID is already saved


    //how to get data when user requests it
    //USERS: get their userID by (using their email)
    //PERMISSIONS: get their get DID they have access to (using their userID)
    //DOCUMENTS: grab thoses specific DID and give them Location aka "FILE" if the email matches request from user


    var currentDate = new Date();

        var loaded_documents = [];
        
        db.serialize(function () {
            db.all(`SELECT DocID, OwnerID, Location FROM Documents WHERE Location = "${location_test}"`, function (err, docs) {
                if (err) {
                    console.log('going to print err')
                    console.log(err);
                }
                if(!docs){
                    console.log("No documents exist!");
                } else {
                    //console.log(this.lastID)
                    //assigning documents to corresponding permissions
                    for (let a = 0; a < Object.keys(content.access).length; a++) {
                        //query saving the user who has access
                        //test = db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Anonymous", `${content.access[a]}`, "Unkown"])
    
                            db.all("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Anonymous", `${content.access[a]}`, "Unkown"], function (err, user) {
                                if (err) {
                                    console.log(err);
                                }
                                if(!user){
                                    //console.log(this.lastID)
                                    console.log(user)
                                    //db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Anonymous", `${g_data.sender_email}`, "Unkown"]);
                                }
                            });

                        //console.log(test)
                        for (let u = 0; u < docs.length; u++) {
                            console.log("assigning", content.access[a], " ->", docs[u].Location)
                            db.run("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)", [`${docs[u].DocID}`, `no_id_yet`, 1])
                        }
                    }
                }
            })
        })



        res.status(200).json("hello");

    // console.log(test)
    // db.run("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)", [`${}`])
})

router.get("/home", (req, res) => {
    //no need to do an async call
    db.serialize(function () {
        db.all("SELECT * FROM Documents", function (err, docs) {
            if (err) {
                console.log(err);
            }
            if(!docs){
                console.log("No documents exist!");
            } else {
                loaded_documents = docs;
            }
            res.status(200).json(loaded_documents);
        })
    })
});

router.use(cors());

module.exports = router;

