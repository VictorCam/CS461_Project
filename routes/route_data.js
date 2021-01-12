const express = require("express")
const router = express.Router()
const cors = require("cors")
const fs = require('fs')
const { Base64 } = require('js-base64')
const { isEmpty, first } = require("lodash")
const axios = require("axios")
const Database = require('better-sqlite3')
const db = new Database('./database/beavdms.db')
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
    } 
    catch (err) { console.log("err with get_token()") }
}

async function get_msg_id(access_tok) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } 
    catch (err) { console.log("err with get_msg_id()") }
}

async function get_msg_data(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`, "Content-type": `application/json`}}
        return await axios.get(url, config)
    }
    catch (err) { console.log("err with get_msg_data()") }
}

async function post_msg_delete(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/trash`
        const data = {}
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } 
    catch (err) { console.log("err with post_msg_delete()") }
}


async function get_attachments(access_tok, g_id, a_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/attachments/${a_id}`
        const config = {headers: { Authorization: `Bearer ${access_tok}`}}
        return await axios.get(url, config)
    } 
    catch (err) { console.log("err with get_attachments()") }
}

async function post_send_msg(access_tok, raw) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/send`
        const data = { "raw": `${raw}` };
        const config = {headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_tok}`}}
        return await axios.post(url, data, config)
    } 
    catch (err) { console.log("err with post_send_msg()") }
}

async function parse_data(g_raw, idx, g_access) {
    g_id = g_raw.data.id, sender_name = [], sender_email = [], project = [], attachments = [], date = [], email_obj = [], cmd = "no_cmd"
    console.log("GOOGLE ID: ", g_id)

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

    //date
    date = helpers.findDate(g_raw)

    //find the message in the body
    message = helpers.findBody(g_raw)

    //parse the message in the body
    console.log(message)
    email_obj = helpers.parseBody(message)

    //query to get raw base64 attachments added in order to save them
    try {
        if (!isEmpty(attachments) && found_cmd != "no_cmd") {
            for (let a = 0; a < attachments.length; a++) {
                var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
                attachments[a].raw = raw.data.data
            }
        }
    }
    catch(err) { console.log("error in helpers.get_attachments() or method above") }

    //json format
    content = {
        "id": idx,
        "g_id": g_id, //google id
        "sender_name": sender_name, //person name who sent the email
        "sender_email": sender_email, //person email who sent the email
        "access": email_obj, //list of emails and what access they have
        "project": project, //project contains the name of the project
        // "attachments": attachments,
        "date": date, //gets the date when it was sent
        "cmd": found_cmd //check if the command was found or not
    }

    return content
}

const get_user = db.prepare("SELECT * FROM Users WHERE Email= ?")
const insert_user = db.prepare("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)")
const insert_doc = db.prepare("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)")
const find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?")
const insert_perm = db.prepare("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)")

async function g_request() {
    const g_access = await get_token() //getting access token 
    const g_id = await get_msg_id(g_access.data.access_token) //getting messages
    if (g_id.data.resultSizeEstimate == 0) { return null } //called when there is no mail to look through

    //loop through all messages and save them
    for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
        var g_raw = await get_msg_data(g_access.data.access_token, g_id.data.messages[idx].id) //getting data
        await post_msg_delete(g_access.data.access_token, g_id.data.messages[idx].id) //delete msg to trash
        var g_data = await parse_data(g_raw, idx, g_access.data.access_token) //parse data

        console.log("access", g_data.access)
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



router.use(cors());

module.exports = router;