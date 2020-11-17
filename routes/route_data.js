const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require('fs');
const { Base64 } = require('js-base64');
const { isEmpty } = require("lodash");
const sqlite3 = require('sqlite3').verbose();
const axios = require("axios")
const db = new sqlite3.Database('./database/beavdms.db');

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
//Users: Name, Email, Major
// db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Travis Shands", "shandst@gmail.com", "Computer Science"]);
//Documents: Name, Description, Location, OwnerID, Project, DateAdded
// db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, (SELECT UserID FROM Users WHERE Email=?), (SELECT ProjID FROM Projects WHERE Name=?), (SELECT date('now')))", ["Beaver Doc", "Documentation of our project", "filepath", "shandst@gmail.com", "BeverDMS"]);

// db.get("SELECT DocID, Documents.Name AS Name, Users.Name AS Owner, Description FROM Documents INNER JOIN Users ON OwnerID=UserID WHERE Documents.Name='Beaver Doc'", function(err, dox) {
//   console.log("Name: ", dox.Name, " Owner: ", dox.Owner, "Description: ", dox.Description);
// });

var app = express();
//const connectsql = require("../server_connection"); // no server connection yet

/*
(does not work when sending follow up email)
access
title (gets date weirdly)
date
 * 
*/

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

async function post_msg_delete(access_tok, g_id) { //apparently axios does not work for this/
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/trash`
        const data = {}
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } catch (err) {
        console.log("err")
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


    if(g_raw.data.payload.hasOwnProperty('headers[17]')) {
    date = g_raw.data.payload.headers[17].value
    }

    if(g_raw.data.payload.hasOwnProperty('headers[19]')) {
    title = g_raw.data.payload.headers[19].value
    }

    
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


    if(typeof g_raw.data.payload.headers[20] != 'undefined') {
        console.log("wew made it")
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

    for (let n = 0; n < g_raw.data.payload.parts.length-1; n++) {
        if(g_raw.data.payload.parts[n+1].mimeType == "application/pdf") { //MUST BE PDF!
            var test = {"mime": g_raw.data.payload.parts[n+1].mimeType, "filename": g_raw.data.payload.parts[n+1].filename, "attach_id": g_raw.data.payload.parts[n+1].body.attachmentId, "raw": null}
            attachments.push(test)
        }
    }

    if(!isEmpty(attachments)) {
        for (let a = 0; a < attachments.length; a++) {
            var raw = await get_attachments(g_access, g_id, attachments[a].attach_id) //DO url REQUEST FOR ATTACHMENT!
            attachments[a].raw = raw.data.data
        }
    }

    content = {
        "id": idx,
        "g_id": g_id,
        "sender_name": sender_name,
        "sender_email": sender_email,
        "access": account_access,
        "title": title,
        "message": message,
        "attachments": attachments,
        "date": date
    }

    return content
}





router.get("/pizza", (req, res) => {
    res.status(200).json("data")
});


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
                db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, (SELECT UserID FROM Users WHERE Email=?), (SELECT ProjID FROM Projects WHERE Name=?), (SELECT date('now')))", [`${g_data.title}`, "We should probably have a description field", `./files/${g_data.g_id}-${j}.pdf`, `${g_data.sender_email}`, "BeverDMS"]);
            });
        }
        beav_data.push(g_data)
    }
        res.status(200).json(beav_data)
    }

    g_request()


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

});

router.use(cors());

module.exports = router;