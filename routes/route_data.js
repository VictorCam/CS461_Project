const express = require("express")
const router = express.Router()
const cors = require("cors")
const fs = require('fs')
const { Base64 } = require('js-base64')
const { isEmpty, toInteger, isNull } = require("lodash")
const axios = require("axios")
const Database = require('better-sqlite3')
const db = new Database('./database/beavdms.db')
const helpers = require('./helpers')
require('dotenv').config()
var path = require('path');
const Joi = require('joi')

//global constants
var currentDate = new Date(); //current date for database saving
const userId = process.env.USER_ID; //user id for api requests
const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document

db.exec("CREATE TABLE IF NOT EXISTS Projects (ProjID INTEGER PRIMARY KEY, Name TEXT NOT NULL, GitHub TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS Users (UserID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Email TEXT NOT NULL, Major TEXT NOT NULL)");
db.exec("CREATE TABLE IF NOT EXISTS Documents (DocID INTEGER PRIMARY KEY, Name TEXT NOT NULL, Description TEXT, Location TEXT NOT NULL, OwnerID INTEGER NOT NULL, Project INTEGER, DateAdded TEXT NOT NULL, FOREIGN KEY(OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE, FOREIGN KEY(Project) REFERENCES Projects(ProjID) ON UPDATE CASCADE ON DELETE CASCADE)");
db.exec("CREATE TABLE IF NOT EXISTS Permissions (PermID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions INTEGER NOT NULL, FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON UPDATE CASCADE ON DELETE CASCADE)");

async function get_token() {
    try {
        c_id = process.env.C_ID //client id
        c_secret = process.env.C_SECRET //client secret
        c_retoken = process.env.C_RETOKEN //refresh token
        const url = `https://accounts.google.com/o/oauth2/token?client_id=${c_id}&client_secret=${c_secret}&refresh_token=${c_retoken}&grant_type=refresh_token`
        return await axios.post(url)
    }
    catch (err) { console.log("err with get_token()") }
}

async function get_msg_id(access_tok) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages`
        const config = { headers: { Authorization: `Bearer ${access_tok}` } }
        return await axios.get(url, config)
    }
    catch (err) { console.log("err with get_msg_id()") }
}

async function get_msg_data(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}`
        const config = { headers: { Authorization: `Bearer ${access_tok}`, "Content-type": `application/json` } }
        return await axios.get(url, config)
    }
    catch (err) { console.log("err with get_msg_data()") }
}

async function post_msg_delete(access_tok, g_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/trash`
        const data = {}
        const config = { headers: { Authorization: `Bearer ${access_tok}` } }
        return await axios.post(url, data, config)
    }
    catch (err) { console.log("err with post_msg_delete()") }
}


async function get_attachments(access_tok, g_id, a_id) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${g_id}/attachments/${a_id}`
        const config = { headers: { Authorization: `Bearer ${access_tok}` } }
        return await axios.get(url, config)
    }
    catch (err) { console.log("err with get_attachments()") }
}

async function post_send_msg(access_tok, raw) {
    try {
        const url = `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/send`
        const data = { "raw": `${raw}` };
        const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_tok}` } }
        return await axios.post(url, data, config)
    }
    catch (err) { console.log("err with post_send_msg()") }
}

async function parse_data(g_raw, idx, g_access) {
    g_id = g_raw.data.id
    console.log("GOOGLE ID: ", g_id)

    //get the subject of the message
    try {
        var title = helpers.findSubject(g_raw)
    }
    catch (err) {
        console.log("something went wrong with helpers.findSubject()")
        return { "cmd": "error" }
    }

    //ignore messages that are sent from gobeavdms@gmail.com (isn't an error but we still want to ignore it)
    if (title == "error") {
        console.log("ignored message from api call")
        return { "cmd": "error" }
    }

    //sender_name and sender_email (if we cannot find it then we cannot send a error msg)
    try {
        sender_info = helpers.findSenderInfo(g_raw)
        sender_name = sender_info[0]
        sender_email = sender_info[1]
    }
    catch (err) {
        console.log("error with sender_info arr")
        return { "cmd": "error" }
    }

    //relay error if the title does not specify a command or the match isn't found
    var matches = title.match(/save|get|update|help/g)
    if (matches == undefined || matches == null || title == undefined || title == null || sender_name == 'NA' || sender_name == 'NA') {
        console.log("matches or title is undefined or null")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }
    if (sender_email && matches.length != 1) {
        console.log("no command is specified OR there is more than one command found")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //assign the match to the found command
    found_cmd = matches[0]

    //get attachments that are pdfs
    try {
        attachments = helpers.findAttachments(g_raw)
    }
    catch (err) {
        console.log("error with helpers.findAttachments()")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }


    //if there is no attachments then we want to send an error since there is nothing to save
    if (attachments.length == 0 && found_cmd == "save") {
        console.log("there is no attachments in this email")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //date
    try {
        date = helpers.findDate(g_raw)
    }
    catch (err) {
        console.log("there was an error finding the date", err)
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //find the message sent
    try {
        message = helpers.findBody(g_raw)
    }
    catch (err) {
        console.log("something went wrong with getting the message")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //parse the message in the body
    try {
        email_obj = helpers.parseBody(message)
    }
    catch (err) {
        console.log("error with helpers.parseBody() or method above")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //query to get raw base64 attachments added in order to save them
    try {
        if (!isEmpty(attachments) && found_cmd != "error") {
            for (let a = 0; a < attachments.length; a++) {
                var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
                attachments[a].raw = raw.data.data
            }
        }
    }
    catch (err) {
        console.log("error with checking attachments")
        return { "cmd": "relay_error", "sender_email": sender_email }
    }

    //json format
    content = {
        "id": idx, //index of for loop
        "g_id": g_id, //google id
        "sender_name": sender_name, //person name who sent the email
        "sender_email": sender_email, //person email who sent the email
        "access": email_obj, //list of emails and what access they have
        "date": date, //gets the date when it was sent
        "cmd": found_cmd, //check if the command was found or not
        "attachments": attachments
    }

    return content
}

const get_user = db.prepare("SELECT * FROM Users WHERE Email= ?")
const insert_user = db.prepare("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)")
const insert_doc = db.prepare("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)")
const insert_project = db.prepare("INSERT INTO Projects (Name, GitHub) VALUES (?, ?)")
const find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?")
const find_project = db.prepare("SELECT * FROM Projects WHERE Name = ?")
const insert_perm = db.prepare("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)")
const get_ownerID = db.prepare("SELECT OwnerID FROM Documents WHERE DocID=?")
const get_perm = db.prepare("SELECT D.OwnerID, U.UserID, P.DID, P.Permissions FROM Documents D INNER JOIN  Permissions P ON D.DocID=P.DID INNER JOIN Users U ON U.userID=P.UID WHERE D.DocID=? AND U.userID=?;")
const get_permID = db.prepare("SELECT P.PermID FROM Documents D INNER JOIN Permissions P ON D.DocID=P.DID INNER JOIN Users U ON U.userID=P.UID WHERE D.DocID=? AND U.userID=?;")
const get_file_path = db.prepare("SELECT Location FROM Documents WHERE DocID = ?;")
const update_proj = db.prepare("UPDATE Documents SET Project=? WHERE DocID=?;")
const update_docName = db.prepare("UPDATE Documents SET Name=? WHERE DocID=?;")
const update_perm = db.prepare("UPDATE Permissions SET Permissions=? WHERE PermID=?")

function grantPermission(doc, access_list, permission) {
    for (let a = 0; a < Object.keys(access_list).length; a++) {
        user = get_user.get(`${access_list[a]}`)

        //if user does not exist make a new user
        if (!user) {
            user = insert_user.run(`${access_list[a]}`, `${access_list[a]}`, "Unknown")
            user = Object.values(user)[1]
        } else { user = user.UserID }

        permID = get_permID.get(doc, user)

        if (permID) {
            update_perm.run(`${permission}`, `${permID}`)
        } else { insert_perm.run(doc, user, permission) }
    }
}

async function checkPermission(doc, user, level) {
    perms = get_perm.get(doc, user)
    owner = Object.values(get_ownerID.get(doc))
    console.log(`doc: ${doc} user: ${user} owner: ${owner} level: ${level} perms: ${perms}`)
    if (perms) {
        if (perms.Permissions >= level) {
            return true
        }
    }
    else if(owner == user) { console.log(`${owner} == ${user}`); return true }
    console.log("not permitted")
    return false
}

function getKey(obj, keyName) {
    var vals = Object.values(obj);
    for (var i = 0; i < Object.keys(obj).length; i++) {
        if (Object.keys(vals[i]) == keyName) {
            return i
        }
    }
    return null
}

async function g_request(callback) {
    const g_access = await get_token() //getting access token 
    const g_id = await get_msg_id(g_access.data.access_token) //getting messages
    if (g_id.data.resultSizeEstimate == 0) { return callback() } //called when there is no mail to look through

    valid = true
    //loop through all messages and save them
    for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
        var g_raw = await get_msg_data(g_access.data.access_token, g_id.data.messages[idx].id) //getting data
        await post_msg_delete(g_access.data.access_token, g_id.data.messages[idx].id) //delete msg to trash
        var g_data = await parse_data(g_raw, idx, g_access.data.access_token) //parse data

        if (g_data.cmd == "error") { return await callback() } //will ignore msg sent by gobeavdms@gmail.com 

        //relay a message back mentioning that an error has occurred
        if (g_data.cmd == "relay_error") {
            raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR`, `An unknown error has occured.\nPlease verify that your e-mail was correctly formated and sent from your oregonstate e-mail account`)
            await post_send_msg(g_access.data.access_token, raw)
            return await callback()
        }

        //inside here we will save users/documents
        if (g_data.cmd == "save") {
            console.log("SUCCESS!");
            for (var j = 0; j < Object.keys(g_data.attachments).length; j++) {
                fs.writeFile(`./files/${g_data.g_id}-${j}.pdf`, g_data.attachments[j].raw, { encoding: 'base64' }, function (err) { if (err) { return console.log("err with writing pdf file") } })

                //save or grab user and save document location
                user = get_user.get(`${g_data.sender_email}`)
                if (!user) { insert_user.run(`${g_data.sender_name}`, `${g_data.sender_email}`, "Unknown") }

                //create a new user
                user = get_user.get(`${g_data.sender_email}`)
                if ((keyNum = getKey(g_data.access, "names"))) {
                    docName = g_data.access[keyNum].names[j]
                }
                else { docName = g_data.attachments[j].filename }

                //add document to project if one is specified
                var proj = null
                keyNum = getKey(g_data.access, "project") //get index of project name if one was specified
                if (keyNum !== null) {
                    if (!(proj = await find_project.get(`${g_data.access[keyNum].project}`))) { //check if project already exists
                        proj = insert_project.run(`${g_data.access[keyNum].project}`, "github.com") //create project if the one specified doesn't exist
                        proj = Object.values(proj)[1] 
                    } else { proj = proj.ProjID }
                }

                //save document meta data to database
                doc = insert_doc.run(`${docName}`, `${g_data.message}`, `./files/${g_data.g_id}-${j}.pdf`, `${user.UserID}`, proj, currentDate.toString())
                doc = Object.values(doc)[1]

                //save new users and give permissions
                if ((keyNum = getKey(g_data.access, "read"))) { //get index of read permission list if it exists
                    grantPermission(doc, g_data.access[keyNum].read, READ)
                }
                if ((keyNum = getKey(g_data.access, "change"))) { //get index of change permission list if it exists
                    grantPermission(doc, g_data.access[keyNum].change, CHANGE)
                }
                if ((keyNum = getKey(g_data.access, "manage"))) { //get index of manage permission list if it exists
                    grantPermission(doc, g_data.access[keyNum].manage, MANAGE)
                }
            }

            //case in where if the parse data has empty arrays then the parse() function found a formatting issue
            if (!isEmpty(g_data.sender_email) && !isEmpty(g_data.attachments)) {
                raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] SAVED ATTACHMENTS`, `Success: Saved document(s) successfully to gobeavdms!`)
                await post_send_msg(g_access.data.access_token, raw)
            }
            else {
                raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR SAVING ATTACHMENTS`, `Error: No attachments were added or invalid email format.`)
                await post_send_msg(g_access.data.access_token, raw)
            }
        }

        else if (g_data.cmd == "get") {
            var contents = []
            var filenames = []
            user = get_user.get(`${g_data.sender_email}`) //find out who sent the request
            keyNum = getKey(g_data.access, "docs") //get index of docs list

            // for each document, ensure the sender has permission to read it
            for (var i = 0; i < g_data.access[keyNum].docs.length; i++) {
                // only return those documents for which the sender is allowed access
                if (checkPermission(g_data.access[keyNum].docs[i], user, READ)) {
                    fpath = await get_file_path.get(g_data.access[keyNum].docs[i])
                    contents.push(fs.readFileSync(`${fpath.Location}`, { encoding: 'base64' }));
                    filenames.push(path.parse(fpath.Location).base)
                    console.log("fpath", fpath.Location)
                }
            }

            //send email with all authorized attachments to requestor
            encMail = await helpers.makeBodyAttachments(g_data.sender_email, "Your Requested Attachments","Hello, please find your requested document(s) in the attachments", contents, filenames)
            await post_send_msg(g_access.data.access_token, encMail)

        }
        else if (g_data.cmd == "update") {
            console.log("update request received")

            user = Object.values(get_user.get(`${g_data.sender_email}`))[0]
            docKey = getKey(g_data.access, "docs")
            projKey = getKey(g_data.access, "project")
            nameKey = getKey(g_data.access, "names")
            readKey = getKey(g_data.access, "read")
            changeKey = getKey(g_data.access, "change")
            manageKey = getKey(g_data.access, "manage")

            //validate all operations before attempting any
            if (!isNull(docKey)) {
                for (var i = 0; i < g_data.access[docKey].docs.length; i++) {
                    console.log(`user: ${user}'s update request is valid: ${valid}`)
                    if (!isNull(projKey)) {
                        valid = valid && await checkPermission(g_data.access[docKey].docs[i], user, CHANGE)
                    }
                    if (!isNull(nameKey)) {
                        valid = valid && await checkPermission(g_data.access[docKey].docs[i], user, CHANGE)
                    }
                    if (!isNull(readKey)) {
                        valid = valid && await checkPermission(g_data.access[docKey].docs[i], user, MANAGE)
                    }
                    if (!isNull(changeKey)) {
                        valid = valid && await checkPermission(g_data.access[docKey].docs[i], user, MANAGE)
                    }
                    if (!isNull(manageKey)) {
                        valid = valid && await checkPermission(g_data.access[docKey].docs[i], user, MANAGE)
                    }
                    console.log("valid: ", valid)
                }
            } else { valid = false }
            //if request is valid, perform requested operations

            if (valid) {
                console.log("the update request is still valid ", valid)
                for (var i = 0; i < g_data.access[docKey].docs.length; i++) {
                    if (!isNull(projKey)) {
                        projid = find_project.get(`${g_data.access[projKey].project}`)
                        if (!projid) {
                            projid = insert_project.run(`${g_data.access[projKey].project}`, "github.com")
                            projid = Object.values(projid)[1] 
                        } else { projid = projid.ProjID }
                        update_proj.run(projid, g_data.access[docKey].docs[i])
                    }
                    if (!isNull(nameKey)) {
                        if (g_data.access[nameKey].names[i]) {
                            update_docName.run(`${g_data.access[nameKey].names[i]}`, `${g_data.access[docKey].docs[i]}`)
                        }
                    }
                    if (!isNull(readKey)) {
                        grantPermission(g_data.access[docKey].docs[i], g_data.access[readKey].read, READ)
                    }
                    if (!isNull(changeKey)) {
                        grantPermission(g_data.access[docKey].docs[i], g_data.access[changeKey].change, CHANGE)
                    }
                    if (!isNull(manageKey)) {
                        grantPermission(g_data.access[docKey].docs[i], g_data.access[manageKey].manage, MANAGE)
                    }
                }
            }
            //if request is invalid, send reply without changing anything
            else {
                console.log("update request is either invalid or unauthorized")
                raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR PERFORMING THE REQUESTED OPERATION(S)`, `Failure: could not perform the operations requested. Please confirm that your e-mail is correctly formatted and you have permission to perform the actions you requested`)
                await post_send_msg(g_access.data.access_token, raw)
            }
        }
        else if (g_data.cmd == "help") {
            console.log("help request received")
        }
        else {
            console.log('went to else')
            //return callback()
        }
    }
    return await callback()
}

async function recall() {
    await g_request(recall)
}
recall()

router.get("/api", (req, res) => {
    const get_docs = db.prepare("SELECT * FROM Documents")
    docs = get_docs.all()
    res.status(200).json(docs)
});

// route.get("/api/permissions", (req,res) => {
//     const get_permissions = db.prepare(
//         "SELECT *" +
//         "FROM Permissions as perm, Users as user" +
//         "WHERE perm.uid = userid"
//         )

// });

router.get("/api/search/:search", (req, res) => {
    const search_docs = db.prepare("SELECT * FROM Documents WHERE Documents.Name LIKE ?")
    filtered = search_docs.all(`%${req.params.search}%`)
    res.status(200).json(filtered)
});

router.use(cors());

module.exports = router;
