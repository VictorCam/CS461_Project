const express = require("express")
const { isEmpty, isNull } = require("lodash")
const axios = require("axios")
const fs = require('fs')
const Database = require('better-sqlite3')
const db = new Database('./server/database/beavdms.db')
const dbfun = require('../middleware/database_functions')
const helpers = require('../middleware/helpers')
var path = require('path')
const { type } = require("os")
const router = express.Router()
require('dotenv').config()

//global constants
var currentDate = new Date(); //current date for database saving
var currentDBYear;
var nextSerial;
const userId = process.env.USER_ID; //user id for api requests
const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document

dbfun.createDatabase();

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
    //console.log("GOOGLE ID: ", g_id)

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
        console.log("deleting auto message that was sent to user")
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
    return {
        "id": idx, //index of for loop
        "g_id": g_id, //google id
        "sender_name": sender_name, //person name who sent the email
        "sender_email": sender_email, //person email who sent the email
        "access": email_obj, //list of emails and what access they have
        "date": date, //gets the date when it was sent
        "cmd": found_cmd, //check if the command was found or not
        "attachments": attachments
    }
}

//takes a DocID/Year key pair, list of emails, and READ|CHANGE|MANAGE
//grants the indicated level of permission for each email to the indicated document
function grantPermission(table, perm, idtype, id, access_list) {
    for (var i = 0; i < access_list.length; i++) { //iterate over each email address
        dbfun.insert_user.run(access_list[i], access_list[i])
        user = dbfun.get_user.get(access_list[i])?.UserID 

        dbfun.insert_perms(table, idtype, id, user, perm)
        dbfun.update_perms(table, idtype, id, user, perm)
    }
}

//check if user has sufficient permission for the document specified
async function checkPermission(docID, user, level) {
    if (!isNull(docID) && !isNull(user) && !isNull(level) &&
        docID != undefined && user != undefined && level != undefined) {
        if (typeof (docID) == 'object') {
            docID = docID.DocID
        }
        perms = dbfun.get_perm.get(docID, user)
        owner = Object.values(dbfun.get_ownerID.get(docID))
        if (perms) {
            if (perms.Permissions >= level) {
                return true //return true if user has sufficient permissions
            }
        }
        else if (owner == user) { return true } //return true if user owns the document
        console.log("not permitted")
    }
    return false
}

//manages the DocID/Year key pair for Documents, determines the next valid key, and saves all related data to database
async function saveDocData(name, desc, pathname, userid, projid, replaces) {
    //use g_data later to get document related data like Notes, Supersedes, etc...

    if (!currentDBYear) { //If currentDBYear isn't set, retrieve it from database
        currentDBYear = dbfun.get_db_year.get().Year;
    }
    if (currentDBYear != currentDate.getFullYear()) { //if no records exist or most recent is dated with other than current year
        currentDBYear = currentDate.getFullYear()   //set currentDBYear to current year
        nextSerial = 0 //reset nextSerial to 0
    }

    if (!nextSerial) { //db year matches current but nextSerial not set
        nextSerial = dbfun.get_last_Serial.get(currentDBYear).Serial; //get most recent Serial for current year
    }
    nextSerial++ //increment to next available ID

    //null values to be replaced by Description, Supersedes, and SupersededBy respectively 
    //console.log(`doc save values: ${currentDBYear}, ${nextSerial}, ${name}, ${desc}, ${pathname}, ${userid}, ${projid}, ${currentDate.toString()}, ${replaces}`)
    docid = dbfun.insert_doc.run(currentDBYear, nextSerial, name, desc, pathname, userid, projid, currentDate.toString(), replaces, null)
    docid = Object.values(docid)[1]
    return docid
}

function saveLinks(id, links, type) {

}

async function g_request(callback) {
    try {
        const g_access = await get_token() //getting access token 
        const g_id = await get_msg_id(g_access.data.access_token);
        if (g_id.data.resultSizeEstimate == 0) { return callback() } //called when there is no mail to look through

        //loop through all messages and save them
        for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
            var valid = true
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
                for (var j = 0; j < Object.keys(g_data.attachments).length; j++) {
                    var doc = g_data.access.document
                    var proj = g_data.access.project
                    var grp = g_data.access.group

                    //get userid
                    var userid = dbfun.get_user.get(`${g_data.sender_email}`)
                    userid = userid ? userid.UserID : Object.values(dbfun.insert_user.run(g_data.sender_email, g_data.sender_email))[1]

                    if(grp) {

                    }
                    if(proj) {
                        projName = proj?.name ? proj.name[0] : "None"

                        //get id of project if one is specified
                        var projid = dbfun.find_project.get(doc.project)
                        projid = projid ? projid.ProjID : Object.values(dbfun.insert_project.run(doc.project, userid, 1, "None"))[1]

                        //function grantPermission(table, perm, idtype, id, access_list) {
                        //save new users and give permissions
                        // if (proj.read) { grantPermission(projid, proj.read, READ, "proj") } //get index of read permission list if it exists
                        // if (proj.change) { grantPermission(projid, proj.change, CHANGE, "proj") }//get index of change permission list if it exists
                        // if (proj.manage) { grantPermission(projid, proj.manage, MANAGE, "proj") } //get index of manage permission list if it exists
                    }
                    if(doc) {
                        //get path and filename
                        var pathname = `./server/files/${g_data.g_id}-${j}.pdf`

                        //get document name
                        docName = doc?.names ? doc.names[j] : g_data.attachments[j].filename

                        //get id of project if one is specified
                        var projid = doc?.project ? dbfun.find_project.get(doc.project) : null
                        projid = projid ? projid.ProjID : Object.values(dbfun.insert_project.run(doc.project, userid, 1, "None"))[1]

                        //get id of document to be superseded if one is specified
                        var repys = doc?.replaces ? doc.replaces[j].split('-') : null
                        replaceid = repys ? dbfun.get_DocID?.get(repys[0], repys[1])?.DocID : null
                        
                        //get description of document if one is specified
                        var desc = doc?.description ? doc.description[j] : "None" 

                        //save document to filesystem 
                        fs.writeFile(pathname, g_data.attachments[j].raw, { encoding: 'base64' }, 
                            function (err) { if (err) { return console.log("err with writing pdf file") } })

                        //save document data to database
                        docid = await saveDocData(docName, desc, pathname, userid, projid, replaceid);

                        // if (doc.links) { saveLinks(docid, doc.links[j], "doc") }
                        // if (doc.notes) { }
                        // if (doc.tags[j]) {
                        //     tags = doc.tags[j].split(",")
                        //     tags.forEach(tag => {
                        //         dbfun.insert_tag(tag)
                        //         dbfun.insert_docTag(docid, tag)
                        //     });
                        // }

                        //save new users and give permissions
                        if (doc.read) { grantPermission("DocPerms", READ, "DID", docid, doc.read) } //get index of read permission list if it exists
                        if (doc.change) { grantPermission("DocPerms", CHANGE, "DID", docid, doc.change) }//get index of change permission list if it exists
                        if (doc.manage) { grantPermission("DocPerms", MANAGE, "DID", docid, doc.manage) } //get index of manage permission list if it exists
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
                user = dbfun.get_user.get(`${g_data.sender_email}`) //find out who sent the request
                keyNum = getKey(g_data.access, "docs") //get index of docs list

                // for each document, ensure the sender has permission to read it
                for (var i = 0; i < g_data.access[keyNum].docs.length; i++) {
                    // only return those documents for which the sender is allowed access

                    docSupKey = g_data.access[keyNum].docs[i].split("-"); //splits the Year-DocID value specified by the user so that it can be used
                    if (checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user.UserID, READ)) {
                        fpath = await dbfun.get_file_path.get(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]).DocID)
                        contents.push(fs.readFileSync(`${fpath.Location}`, { encoding: 'base64' }));
                        filenames.push(path.parse(fpath.Location).base)
                    }
                }

                //send email with all authorized attachments to requestor
                encMail = await helpers.makeBodyAttachments(g_data.sender_email, "Your Requested Attachments", "Hello, please find your requested document(s) in the attachments", contents, filenames)
                await post_send_msg(g_access.data.access_token, encMail)

            }
            else if (g_data.cmd == "update") {

                user = Object.values(dbfun.get_user.get(`${g_data.sender_email}`))[0]
                docKey = getKey(g_data.access, "docs")
                projKey = getKey(g_data.access, "project")
                nameKey = getKey(g_data.access, "names")
                readKey = getKey(g_data.access, "read")
                changeKey = getKey(g_data.access, "change")
                manageKey = getKey(g_data.access, "manage")

                //validate all operations before attempting any
                if (!isNull(docKey)) {
                    for (var i = 0; i < g_data.access[docKey].docs.length; i++) {
                        docSupKey = g_data.access[docKey].docs[i].split("-"); //splits the Year-DocID value specified by the user so that it can be used       
                        if (!isNull(projKey)) {
                            valid = valid && await checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user, CHANGE)
                        }
                        if (!isNull(nameKey)) {
                            valid = valid && await checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user, CHANGE)
                        }
                        if (!isNull(readKey)) {
                            valid = valid && await checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user, MANAGE)
                        }
                        if (!isNull(changeKey)) {
                            valid = valid && await checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user, MANAGE)
                        }
                        if (!isNull(manageKey)) {
                            valid = valid && await checkPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), user, MANAGE)
                        }
                    }
                } else { valid = false }
                //if request is valid, perform requested operations

                if (valid) {
                    for (var i = 0; i < g_data.access[docKey].docs.length; i++) {
                        docSupKey = g_data.access[docKey].docs[i].split("-");
                        if (!isNull(projKey)) {
                            projid = dbfun.find_project.get(`${g_data.access[projKey].project}`)
                            if (!projid) {
                                projid = dbfun.insert_project.run(`${g_data.access[projKey].project}`, user.UserID, null, "Oregon State University Project")
                                projid = Object.values(projid)[1]
                            } else { projid = projid.ProjID }
                            dbfun.update_proj.run(projid, dbfun.get_DocID.get(docSupKey[0], docSupKey[1]).DocID)
                        }
                        if (!isNull(nameKey)) {
                            if (g_data.access[nameKey].names[i]) {
                                dbfun.update_docName.run(g_data.access[nameKey].names[i], dbfun.get_DocID.get(docSupKey[0], docSupKey[1]).DocID)
                            }
                        }
                        if (!isNull(readKey)) {
                            grantPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), g_data.access[readKey].read, READ)
                        }
                        if (!isNull(changeKey)) {
                            grantPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), g_data.access[changeKey].change, CHANGE)
                        }
                        if (!isNull(manageKey)) {
                            grantPermission(dbfun.get_DocID.get(docSupKey[0], docSupKey[1]), g_data.access[manageKey].manage, MANAGE)
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
                return callback()
            }
        }
        return await callback()
    } catch (err) {
        console.log(err)
        return callback()
    }
}

async function recall() {
    await g_request(recall)
}
recall()

module.exports = router;