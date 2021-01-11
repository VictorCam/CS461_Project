const express = require("express")
const router = express.Router()
const cors = require("cors")
const fs = require('fs')
const { Base64 } = require('js-base64')
const { isEmpty } = require("lodash")
const axios = require("axios")
const Database = require('better-sqlite3')
const db = new Database('./database/beavdms.db')
const validator = require('validator')
const helpers = require('./helpers')

//global constants
var currentDate = new Date(); //current date for database saving
const userId = "gobeavdms@gmail.com" //user id for api requests
const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document
db.exec("CREATE TABLE IF NOT EXISTS Projects (ProjID INTEGER PRIMARY KEY, Name TEXT NOT NULL, GitHub TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS Users (UserID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Email TEXT NOT NULL, Major TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS Documents (DocID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Description TEXT, Location TEXT NOT NULL, OwnerID INTEGER NOT NULL, Project INTEGER, DateAdded TEXT NOT NULL, FOREIGN KEY(OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE, FOREIGN KEY(Project) REFERENCES Projects(ProjID) ON DELETE CASCADE)");
db.exec("CREATE TABLE IF NOT EXISTS Permissions (PermID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions INTEGER NOT NULL, FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON DELETE CASCADE)");

async function get_token() {
    try {
        c_id = "407454790116-p7a8mm51ncd0fpuqmq1rf6fh44184nc7.apps.googleusercontent.com" //client id
        c_secret = "mWl-YURPy82Dmf3_EkUPFjy2" //client secret
        c_retoken = "1//06EZSqyMbPOsbCgYIARAAGAYSNwF-L9IrWh_vgBazeV84ZRrZ6dDADXVqFkh_-CCE7GMq18bDM2n1D_RKCKS7fsHxn5VdwGgPC20" //refresh token
        const url = `https://accounts.google.com/o/oauth2/token?client_id=${c_id}&client_secret=${c_secret}&refresh_token=${c_retoken}&grant_type=refresh_token`
        return await axios.post(url)
    } catch (err) {
        console.log("err with get_token()")
    }
}

async function get_msg_id(access_tok) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log("err with get_msg_id()")
    }
}

async function get_msg_data(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`, "Content-type": `application/json`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log("err with get_msg_data()")
    }
}

async function post_msg_delete(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/trash`
        const data = {}
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } catch (err) {
        console.log("err with post_msg_delete()")
    }
}


async function get_attachments(access_tok, g_id, a_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/attachments/${a_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } catch (err) {
        console.log("err with get_attachments()")
    }
}

async function post_send_msg(access_tok, raw) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/send`
        const data = { "raw": `${raw}` };
        const config = {headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } catch (err) {
        console.log("err with post_send_msg()")
    }
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
  

async function parse_data(g_raw, idx, g_access) {
    g_id = g_raw.data.id
    console.log("GOOGLE IDENTIFICATION: ", g_raw.data.id)
    sender_email = [], sender_name = [], date = [], title = [], rec_name = [], rec_email = [], rec_perm = [], attachments = [], message = [], found_cmd = "no_cmd"

    //subject (outside of loop so I can check first cmd on the title if not then I don't do any parsing)
    title = helpers.findSubject(g_raw)

    //commands: help, save, get
    found_cmd = helpers.findCmd(title)

    //get attachments that are pdfs (this must be outside of loop)
    attachments = helpers.findAttachments(g_raw)

    //sender name and sender email (outside loop so we can determine error)
    sender_info = helpers.findSenderInfo(g_raw)
    sender_name = sender_info[0]
    sender_email = sender_info[1]

    console.log(attachments.length)

    //if attachments is empty or if cmd not found then there is no point in parsing the rest of the data :/
    if (!isEmpty(attachments) && found_cmd != "no_cmd") {

        //query to get raw base64 attachments added in order to save them
        for (let a = 0; a < attachments.length; a++) {
            var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
            attachments[a].raw = raw.data.data
        }

        //date
        date = helpers.findDate(g_raw)

        //find the message in the body
        message = helpers.findBody(g_raw)

        console.log(message)

        m_parse = message.split(":")

        console.log("p1", m_parse)

        //get title //get title when parsing the subject
        title = 'NA'


        // console.log(message)

    //     try {
    //         c_parse = message.split(",")
    //         for (let i = 0; i < c_parse.length; i++) {
    //             if(c_parse[i] != "") {
    //                 user_data = c_parse[i].split("=")
    //                 rec_name.push(user_data[0].replace(/\s/g, ''))  //regex removes spaces
    //                 rec_email.push(user_data[1].replace(/\s/g, ''))
    //                 rec_perm.push(user_data[2].replace(/\s/g, ''))
    //             }
    //         }
    //     }
    //     catch(err) {
    //         console.log("BAD FORMAT! [SEND A MSG TO USER THAT ERROR OCCURED AND DO NOT ALLOW QUERY]")
    //     }
    }

    //json format
    content = {
        "id": idx,
        "g_id": g_id,
        "sender_name": sender_name,
        "sender_email": sender_email,
        //"rec_name": rec_name,
        // "rec_email": rec_email,
        // "rec_perm": rec_perm,
        "title": title,
        "message": message,
        //"attachments": attachments,
        "date": date,
        "cmd": found_cmd
    }

    // console.log(content.attachments.length)

    //break;
    //return content
}

const get_user = db.prepare("SELECT * FROM Users WHERE Email= ?")
const insert_user = db.prepare("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)")
const insert_doc = db.prepare("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)")
const find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?")
const insert_perm = db.prepare("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)")

async function g_request() {
    const g_access = await get_token() //getting access token 
    const g_id = await get_msg_id(g_access.data.access_token) //getting messages
    if (g_id.data.resultSizeEstimate == 0) { return null } //called when there is no maills to look through

    //loop through all messages and save them
    for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
        var g_raw = await get_msg_data(g_access.data.access_token, g_id.data.messages[idx].id) //getting data
        await post_msg_delete(g_access.data.access_token, g_id.data.messages[idx].id) //delete msg to trash
        var g_data = await parse_data(g_raw, idx, g_access.data.access_token) //parse data

        //inside here we will save users/documents
        // if (g_data.cmd == "save") {
        //     for (var j = 0; j < Object.keys(g_data.attachments).length; j++) {
        //         fs.writeFile(`./files/${g_data.g_id}-${j}.pdf`, g_data.attachments[j].raw, { encoding: 'base64' }, function(err) { if (err) { return console.log("err with writing pdf file") } })

        //         //save or grab user and save document location
        //         user = get_user.get(`${g_data.sender_email}`)
        //         if (!user) { insert_user.run(`${g_data.sender_name}`, `${g_data.sender_email}`, "Unknown") } 

        //         //create a new user
        //         user = get_user.get(`${g_data.sender_email}`)
        //         insert_doc.run(`${g_data.title}`, `${g_data.message}`, `./files/${g_data.g_id}-${j}.pdf`, `${user.UserID}`, null, currentDate.toString())
        //         doc = find_doc.get(`./files/${g_data.g_id}-${j}.pdf`)

        //         //save new users and give permissions
        //         for (let a = 0; a < Object.keys(g_data.rec_email).length; a++) {
        //             user = get_user.get(`${g_data.rec_email[a]}`)
            
        //             //if user does not exist make a new user
        //             if (!user) { insert_user.run(`${g_data.rec_name[a]}`, `${g_data.rec_email[a]}`, "Unknown") }

        //             //get the newly created or existing user and insert their permissions
        //             user = get_user.get(`${g_data.rec_email[a]}`)
        //             insert_perm.run(doc.DocID, user.UserID, `${g_data.rec_perm[a]}`)
        //         }
        //     }

        //     //case in where if the parse data has empty arrays then the parse() function found a formatting issue
        //     if (!isEmpty(g_data.sender_email) && !isEmpty(g_data.attachments)) {
        //         raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] SAVED ATTACHMENTS`, `Success: Saved data successfully to gobeavdms! \n\n Origin of Message: ${g_data.title}`)
        //         await post_send_msg(g_access.data.access_token, raw)
        //     } else {
        //         raw = helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR SAVING ATTACHMENTS`, `Error: No attachments were added or invalid email format \n\n Origin of Message: ${g_data.title}`)
        //         await post_send_msg(g_access.data.access_token, raw)
        //     }
        // } 
        // else if (g_data.cmd == "access") {
        //     console.log("test")
        // }
        // else {
        //     if (!isEmpty(g_data.sender_email)) { //case is added here to prevent sent messages from being posted again
        //         raw = helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR SAVING ATTACHMENTS`, `Error: Did not specify a command on the subject line \n\n Origin of Message: ${g_data.title}`)
        //         await post_send_msg(g_access.data.access_token, raw)
        //     }
        // }
    }
    // return callback()
}

async function recall() {
    await g_request()
}
recall()

router.get("/home", (req, res) => {
    const get_docs = db.prepare("SELECT * FROM Documents")
    docs = get_docs.all()
    res.status(200).json(docs)
});


//testing this below

example = '@oregonstate.edu@gmail.com'

console.log("validator", validator.isEmail(example)) //need validator when user input is given

if(example.match("@oregonstate.edu")) {
    console.log("match found")
}
else {
    console.log("match not found")
    //send email saying they do not have authorized permission
    //as they are not part of the '@oregonstate.edu' organization
}



router.use(cors());

module.exports = router;