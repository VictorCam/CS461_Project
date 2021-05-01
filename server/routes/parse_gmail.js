const express = require("express")
const { isEmpty } = require("lodash")
const axios = require("axios")
const fs = require('fs')
const Database = require('better-sqlite3')
const db = new Database('./server/database/beavdms.db')
const dbfun = require('../middleware/create_db')
const helpers = require('../middleware/helpers')
const filters = require('../middleware/filters')
const router = express.Router()
require('dotenv').config()

const json = require('../middleware/test.json')
const { object } = require("joi")

//global constants
var currentDate = new Date(); //current date for database saving
var currentDBYear;
var nextSerial;
const userId = process.env.USER_ID; //user id for api requests
const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document

dbfun.createDatabase(db);
// var test = filters.save_filter(db, json)

get_user = db.prepare("SELECT * FROM Users WHERE Email=?;")
get_group = db.prepare("SELECT * FROM Groups WHERE Name=?")
find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?;")
var find_group = db.prepare("SELECT * FROM Groups WHERE Name=?")
find_project = db.prepare("SELECT * FROM Projects WHERE Name = ? AND ProjectCode=?;")
find_max_proj_code = db.prepare("SELECT MAX(ProjectCode) AS ProjectCode FROM Projects WHERE Name=?;")
get_file_path = db.prepare("SELECT Location FROM Documents WHERE DocID = ?;")
get_db_year = db.prepare("SELECT MAX(Year) AS Year FROM Documents;")
get_last_Serial = db.prepare("SELECT MAX(Serial) AS Serial FROM Documents WHERE Year=?;")
get_DocID = db.prepare("SELECT DocID From Documents Where Year=? and Serial=?;")
get_tag = db.prepare("SELECT * FROM Tags WHERE Name=?")
// get_dpermID = db.prepare("SELECT DP.PermID FROM Documents D INNER JOIN DocPerms DP ON D.DocID=DP.DID INNER JOIN Users U ON U.UserID=DP.UID WHERE D.DocID=? AND U.UserID=?;")
// get_ppermID = db.prepare("SELECT PP.PermID FROM Projects P INNER JOIN ProjPerms PP ON P.ProjID=PP.PID INNER JOIN Users U ON U.UserID=PP.UID WHERE P.ProjID=? AND U.UserID=?;")
// get_gpermID = db.prepare("SELECT GP.PermID FROM Groups G INNER JOIN GroupPerms GP ON G.GroupID=GP.GID INNER JOIN Users U ON U.UserID=GP.UID WHERE G.GroupID=? AND U.UserID=?;")
get_groups = db.prepare("SELECT GroupID FROM Groups INNER JOIN usersXgroups ON GroupID=GID INNER JOIN Users ON UserID=UID WHERE UserID=?")

update_proj = db.prepare("UPDATE Documents SET Project=? WHERE DocID=?;")
update_docName = db.prepare("UPDATE Documents SET Name=? WHERE DocID=?;")

insert_user = db.prepare("INSERT OR IGNORE INTO Users (Name, Email) VALUES (?, ?);")
insert_doc = db.prepare("INSERT INTO Documents (Year, Serial, Name, Description, Location, OwnerID, Project, DateAdded, Replaces, ReplacedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);")
insert_project = db.prepare("INSERT INTO Projects (Name, OwnerID, ProjectCode, Description) VALUES (?, ?, ?, ?);")
insert_group = db.prepare("INSERT OR IGNORE INTO Groups (Name, OwnerID, Description) VALUES (?, ?, ?);")
add_to_group = db.prepare("INSERT OR IGNORE INTO usersXgroups (UID, GID) VALUES ((SELECT UserID FROM Users WHERE Email=?), ?);")
insert_tag = db.prepare("INSERT OR IGNORE INTO Tags (Name) VALUES (?);")
insert_docTag = db.prepare("INSERT OR IGNORE INTO tagsXdocs (DID, TID) VALUES (?, (SELECT TagID FROM Tags WHERE Name=?))")
insert_note = db.prepare("INSERT INTO Notes (DID, UID, DateAdded, Note) VALUES (?, ?, ?, ?)")
insert_docLink = db.prepare("INSERT INTO DocLinks (DID, Link) VALUES (?, ?)")
insert_projLink = db.prepare("INSERT INTO ProjLinks (PID, Link) VALUES (?, ?)")

function get_ownerID (table, idtype, id) {
    return db.prepare("SELECT OwnerID FROM " + table + " WHERE " + idtype + "=?;").get(id)
}

//compose query for checking permissions of Documents, Projects, Groups (ResID) on behalf of Users or Groups (entID)
function get_perms(entType, entID, resType, resID) {
    return db.prepare(`SELECT Permissions FROM Perms WHERE ${entType}=? AND ${resType}=?;`).get(entID, resID)
}
//compose query for inserting permissions to Documents, Projects, Groups (ResID) on behalf of Users or Groups (entID)
function insert_perms(entType, entID, resType, resID, perm) {
    return db.prepare(`INSERT OR IGNORE INTO Perms(${entType}, ${resType}, Permissions) VALUES (?, ?, ?);`).run(entID, resID, perm)
}
//compose query for updating permissions to Documents, Projects, Groups (ResID) on behalf of Users or Groups (entID)
function update_perms(entType, entID, resType, resID, perm) {
    return db.prepare(`UPDATE Perms SET Permissions=? WHERE ${entType}=? AND ${resType}=?;`).run(perm, entID, resID)
}

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

    //use this if you want to see the data of a giant json object
    // var fs = require('fs');
    // fs.writeFile(`j_${g_id}.json`, JSON.stringify(g_raw.data), function(err) {
    //     if (err) throw err;
    //     console.log('complete');
    // })

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

    // ignore messages that are sent from gobeavdms@gmail.com (isn't an error but we still want to ignore it)
    if(sender_email == 'beavdms3@gmail.com') {
        console.log("deleting programmatically sent BOT message that was sent to user")
        return { "cmd": "error" }
    }

    //relay error if the title does not specify a command or the match isn't found
    var matches = title.match(/save|get|update|help/g)
    if (matches == undefined || matches == null || title == undefined || title == null || sender_name == 'NA' || sender_email == 'NA') {
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
        if (attachments[0]?.attach_id && found_cmd != "error") {
            for (let a = 0; a < attachments.length; a++) {
                var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
                attachments[a].raw = raw.data.data
            }
        }
    }
    catch (err) {
        console.log("error with checking attachments OR no attachments found", err)
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

//grants permissions to users and groups in access_list permissions indicated by perm to a resource indicate by resType and resID
//if user or group does not exist, it is automatically created. granter is made owner of the new group
//usage: granPermissions("DID"||"PID"||"GID", DID||PID||GID, READ||CHANGE||MANAGE, [emails|groups], email sender id)
function grantPermission(resType, resID, perm, access_list, granter) {
    list = typeof(access_list) == 'string' ? [] + access_list : access_list
    for (var i = 0; i < access_list.length; i++) { //iterate over each email address
        // console.log("access_list[i]: ", access_list[i])
        if(access_list[i].includes("@")){ //if entity name contains '@', assume entity type is User
            insert_user.run(access_list[i], access_list[i])
            entID = get_user.get(access_list[i])?.UserID
            entType = "UserEnt"
        } else { //if entity name does not contain '@', assume entity type is Group
            insert_group.run(access_list[i], granter, "None") 
            entID = find_group.get(access_list[i])?.GroupID
            entType = "GroupEnt"
        }

        insert_perms(entType, entID, resType, resID, perm)
        update_perms(entType, entID, resType, resID, perm)
    }
}

//entType is "GroupEnt" or "UserEnt" and idicates whether permissions are being checked on behalf of a User or Group
//resType is "DID", "PID", or "GID" and idicates the type of resource that a User or Group is attempting to access
//DID == document, PID == project, GID == group
//entID and resID are Integers and are the IDs corresponding to the afforementioned entType and resType
async function checkPermission(entType, resType, entID, resID) {
    var level = 0 //no permissions is assumed until proven otherwise
    var anyone = get_group.get("all")
    var groupID = anyone ? anyone.GroupID : null
    var result = get_perms("GroupEnt", groupID, resType, resID) //check if the all group has been granted access and what level
    if(result?.Permissions >= level) { level = result.Permissions  }

    result = get_perms(entType, entID, resType, resID) //check if the user has been explicitly granted permissions and what level
    if (result?.Permissions >= level) { level = result.Permissions }

    if (entType == "UserEnt") {
        groups = Object.values(get_groups.get(entID)) //get IDs of all groups that the user belongs to 
        groups?.forEach((group) => {
            result = get_perms("GroupEnt", group, resType, resID)
            if (result?.Permissions >= level) { level = result.Permissions } //check permissions of each group that the user belongs to and what level
        })
    }
    return level //return highest level of permission that user has been granted whether explicitly or through some group
}

//manages the DocID/Year key pair for Documents, determines the next valid key, and saves all related data to database
async function saveDocData(name, desc, pathname, userid, projid, replaces) {
    //use g_data later to get document related data like Notes, Supersedes, etc...

    if (!currentDBYear) { //If currentDBYear isn't set, retrieve it from database
        currentDBYear = get_db_year.get().Year;
    }
    if (currentDBYear != currentDate.getFullYear()) { //if no records exist or most recent is dated with other than current year
        currentDBYear = currentDate.getFullYear()   //set currentDBYear to current year
        nextSerial = 0 //reset nextSerial to 0
    }

    if (!nextSerial) { //db year matches current but nextSerial not set
        nextSerial = get_last_Serial.get(currentDBYear).Serial; //get most recent Serial for current year
    }
    nextSerial++ //increment to next available ID

    //null values to be replaced by Description, Supersedes, and SupersededBy respectively 
    docid = insert_doc.run(currentDBYear, nextSerial, name, desc, pathname, userid, projid, currentDate.toString(), replaces, null).lastInsertRowid
    return [docid, currentDBYear, nextSerial]
}

//id == DocID or ProjID to which the tag is to be applied
//links contains a comma separated list of links or a single link
//type == "doc" or "proj" to indicate which resource the link is to be applied to
function saveLinks(id, links, type) {
    links = links.trim().split(",") //turn comma separated list into array
    links.forEach(link => {
        if (type == "doc") {
            insert_docLink.run(id, link.trim())
        }
        else if (type == "proj") {
            insert_projLink.run(id, link)
        }
    })
}
//id == DocID, tags contains comma separated list of tags or a single tag
function saveTags(id, tags) {
    tags = tags.trim().split(",") //turn comma separated list into array
    tags.forEach(tag => {
        insert_tag.run(tag.trim()) //create tag if it doesn't exist
        insert_docTag.run(id, tag) //add tag to document
    });
}

function saveProj(proj, userid) {
    var projName = proj.name ? proj.name[1] : proj.names[1] //determine whether user used name: or names:
    projName = projName ? projName.trim() : null
    if (projName) { //don't do anything if no name was specified 
        var desc = proj.description ? proj.description : proj.descriptions
        desc = desc ? desc[0].trim() : null //perpare des with description or descriptions
        var projdata = projName ? find_project.get(projName, 1) : null
        var projid = projdata ? insert_project.run(projName, userid, find_max_proj_code.get(projName).ProjectCode + 1, desc).lastInsertRowid
            : insert_project.run(projName, userid, 1, desc).lastInsertRowid //if project with same name exists, create new one with highest existing project code +1
        var links = proj.link ? proj.link : proj.links
        links = links ? links : null
        if (links) { saveLinks(projid, links[0].trim(), "proj") } //save link(s) to ProjLinks
        //save new users and give permissions
        proj.manage.push(g_data.sender_email) //ensure sender has manage permissions to their new project
        if (proj.read) { grantPermission("PID", projid, READ, proj.read, userid) }
        if (proj.change) { grantPermission("PID", projid, CHANGE, proj.change, userid) }
        if (proj.manage) { grantPermission("PID", projid, MANAGE, proj.manage, userid) } 
    }
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

                //validate the json data, and if we fail then we send error to user who sent it 
                var save_filter = filters.save_filter(db, g_data)
                if(save_filter?.error) {
                    console.log("sending error message:", save_filter.error)
                   raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR`, `Error: ${save_filter.error}`)
                   await post_send_msg(g_access.data.access_token, raw)
                   return await callback()
                }


                var doc = g_data.access.document
                var proj = g_data.access.project
                var grp = g_data.access.group

                //get userid
                var userdata = get_user.get(`${g_data.sender_email}`)

                //check if sender is already in database. If yes, sets users id as userid otherwise adds user and sets the new id as userid
                var userid = userdata ? userdata.UserID : insert_user.run(g_data.sender_email, g_data.sender_email).lastInsertRowid

                var replyMessage = {}

                if (grp) {
                    replyMessage.grp = {}
                    var grpName = grp.name ? grp.name[0].trim() : null //trim spaces off either side of the group name and set it to grpName
                    if (grpName) { //Don't do anything if a name wasn't given
                        if (find_group.all(grpName).length == 0) { //check if group by that name already exists. Do nothing if true

                            var desc = grp.description ? grp.description[0].trim() : null //set description(s) as desc
                            var grpid = insert_group.run(grpName, userid, desc).lastInsertRowid //creat the group
                            var member = grp.member ? grp.member : null 
                            if (member) { //add member(s) to group
                                member.forEach((mem) => {
                                    mem = mem.trim()
                                    insert_user.run(mem, mem) //create user if they don't already exist
                                    add_to_group.run(mem, grpid)
                                })
                            }

                            if(!grp.manage) { grp.manage = [] } //create array if grp.manage does not exist
                            grp.manage.push(g_data.sender_email) //ensure that the sender has manage permissions to their new group
                            if (grp.read) { grantPermission("GID", grpid, READ, grp.read, userid) }
                            if (grp.change) { grantPermission("GID", grpid, CHANGE, grp.change, userid) }
                            if (grp.manage) { grantPermission("GID", grpid, MANAGE, grp.manage, userid) }
                        }
                    }
                    replyMessage.grp.name = grpName
                    replyMessage.grp.member = member

                    // Construct email
                    var emailBodyMessage = `Name: ${replyMessage.grp.name}\nMembers:\n`
                    // if (member) {
                    //     for (var i = 0; i < replyMessage.grp.member.length; i++) {
                    //         emailBodyMessage = emailBodyMessage.concat(replyMessage.grp.member[i] + "\n")
                    //     }
                    // }
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] SAVE GROUP SUCCESS`, `${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)
                }
                if (proj) {
                    replyMessage.proj = {}
                    var projString = proj.name[0].split("#") //determine whether user used name: or names:
                    var projName = projString[0].trim()
                    if (projName) { //don't do anything if no name was specified 
                        var desc = proj.description ? proj.description : proj.descriptions
                        desc = desc ? desc[0].trim() : null //perpare des with description or descriptions
                        var projdata = projName ? find_project.get(projName, 1) : null
                        var projCode = projdata ? find_max_proj_code.get(projName).ProjectCode + 1 : 1
                        var projid = insert_project.run(projName, userid, projCode, desc).lastInsertRowid
                        if (proj.link) { saveLinks(projid, proj.link[0].trim(), "proj") } //save link(s) to ProjLinks
                        //save new users and give permissions

                        if(!proj.manage) { proj.manage = [] } //create array if proj.manage does not exist

                        proj.manage.push(g_data.sender_email) //ensure sender has manage permissions to their new project
                        if (proj.read) { grantPermission("PID", projid, READ, proj.read, userid) }
                        if (proj.change) { grantPermission("PID", projid, CHANGE, proj.change, userid) }
                        if (proj.manage) { grantPermission("PID", projid, MANAGE, proj.manage, userid) } 
                        replyMessage.proj.name = projName + "#" + projCode.toString().padStart(4, '0')
                    }

                    // Construct email
                    var emailBodyMessage = replyMessage.proj.name
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] SAVE PROJECT SUCCESS`, `Name: ${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)
                }
                for (var j = 0; j < g_data.attachments.length; j++) {
                    if (doc) {

                        //get path and filename
                        var pathname = `./server/files/${g_data.g_id}-${j}.pdf`

                        //get document name
                        var docName = doc?.name ? doc.name[j].trim() : g_data.attachments[j].filename //set name(s) as docName

                        replyMessage.doc = [] 

                        //get id of project if one is specified
                        if (doc?.project) {
                            var fullName = doc.project[0].split("#") //get full name of project and split on #
                            var projName = fullName[0]
                            var projNum = fullName[1] ? fullName[1] : 1 //if project code wasn't specificed, assume 1
                            var projdata = doc.project ? find_project.get(projName, projNum) : null //lookup project using name and project code
                            if (projdata) {
                                level = await checkPermission("UserEnt", "PID", userid, projdata.ProjID)
                                projid = projdata.ProjID
                            } //check if user has permission to add to project
                            else {
                                level = MANAGE | CHANGE | READ
                                projid = insert_project.run(doc.project, userid, 1, "None").lastInsertRowid //create new project with project code 0001 if this is the first one by its name
                                grantPermission("PID", projid, MANAGE, [g_data.sender_email], userid)
                            }
                        } else { projid = null; level = MANAGE | CHANGE | READ } //not 100% sure what this is for. Might be vestigial 

                        //get id of document to be superseded if one is specified
                        var repys = doc?.replace ? doc.replace[j].split('-') : null
                        replaceid = repys ? get_DocID?.get(repys[0], repys[1])?.DocID : null //get DocID that correlates to the YYYY-#### specified by the user

                        //get description of document if one is specified
                        var desc = doc?.description ? doc.description[j].trim() : null
                        if (level >= CHANGE) { //don't allow the user to make any changes if they don't have sufficient permission
                            //save document to filesystem 
                            fs.writeFile(pathname, g_data.attachments[j].raw, { encoding: 'base64' },
                                function (err) { if (err) { return console.log("err with writing pdf file") } })

                            //save document data to database
                            var [docid, year, serial] = await saveDocData(docName, desc, pathname, userid, projid, replaceid);
                            replyMessage.doc.push(year + "-" + serial.toString().padStart(4, '0'))
                            //figure out whether the user used link: or links:, tag: or tags:, and note: or notes:
                            var link = doc?.link ? doc.link[j] : null
                            var tag = doc?.tag ? doc.tag[j] : null
                            var note = doc?.note ? doc.note[j] : null
                            //process the fields accordingly
                            if (link) { saveLinks(docid, link.trim(), "doc") }
                            if (tag) { saveTags(docid, tag.trim()) }
                            if (note) { insert_note.run(docid, userid, date.toString(), note) }

                            //save new users and give permissions
                            if (doc?.manage) { doc?.manage.push(g_data.sender_email) }
                            else { doc.manage = [g_data.sender_email] }
                            if (doc?.read) { grantPermission("DID", docid, READ, doc.read, userid) } //get index of read permission list if it exists
                            if (doc?.change) { grantPermission("DID", docid, CHANGE, doc.change, userid) }//get index of change permission list if it exists
                            if (doc?.manage) { grantPermission("DID", docid, MANAGE, doc.manage, userid) } //get index of manage permission list if it exists
                        }
                        // Construct email
                        var emailBodyMessage = "Name: " + docName + "\nSerial: "
                        emailBodyMessage = emailBodyMessage.concat(replyMessage.doc + "\n")
                        console.log(emailBodyMessage)
                        raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] SAVE DOCUMENT SUCCESS`, `${emailBodyMessage}`)
                        await post_send_msg(g_access.data.access_token, raw)
                    }
                }

               
            }

            else if (g_data.cmd == "get") {

                var get_filter = filters.get_filter(db, g_data)
                if(get_filter?.error) {
                    console.log("sending error message:", get_filter.error)
                //    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] ERROR`, `Error: ${get_filter.error}`)
                //    await post_send_msg(g_access.data.access_token, raw)
                   return await callback()
                }

                var doc = g_data.access.document
                var proj = g_data.access.project
                var grp = g_data.access.group

                //get userid
                var userdata = get_user.get(`${g_data.sender_email}`)
                var userid = userdata ? userdata.UserID : insert_user.run(g_data.sender_email, g_data.sender_email).lastInsertRowid

                var replyMessage = {}

                if (grp) {
                    var groupIDQuery = db.prepare(`SELECT GroupID FROM Groups WHERE Name = ?`).get(grp.name[0])
                    const groupID = groupIDQuery.GroupID
                    
                    replyMessage.name = grp.name

                    const memberUserIDs = db.prepare(`SELECT UID FROM usersXgroups WHERE GID = ?`).all(groupID)
                    var groupMembers = []
                    for (var i = 0; i < memberUserIDs.length; i++) {
                        let id = memberUserIDs[i].UID
                        const queryForMember = db.prepare(`SELECT Name, Email FROM Users WHERE UserID = ?`).get(id)
                        groupMembers.push(queryForMember)
                    }
                    replyMessage.members = groupMembers

                    replyMessage.description = db.prepare(`SELECT Groups.Description FROM Groups WHERE Groups.Name = ?`).get(grp.name[0]).Description

                    var ownerID = db.prepare(`SELECT OwnerID From GROUPS WHERE GroupID = ?`).get(groupID).OwnerID
                    var ownerEmail = db.prepare(`SELECT Email from USERS WHERE UserID = ?`).get(ownerID).Email

                    replyMessage.ownerEmail = ownerEmail // assuming those with manage lever permissions are the owners of the group
                    // Construct email
                    var emailBodyMessage = "Name: " + replyMessage.name
                    if (groupMembers.length > 0) {
                        emailBodyMessage = emailBodyMessage.concat("\nMembers: ")
                        for (var i = 0; i < replyMessage.members.length; i++) {
                            emailBodyMessage = emailBodyMessage.concat(replyMessage.members[i].Name + ", ")
                        }
                    }
                    if (replyMessage.description) {
                        emailBodyMessage = emailBodyMessage.concat("\nDescription: " + replyMessage.description)
                    }
                    if (replyMessage.ownerEmail) {
                        emailBodyMessage = emailBodyMessage.concat("\nOwner: " + replyMessage.ownerEmail)
                    }
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] GET GROUP SUCCESS`, `${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)
                }
                if (proj) {
                    const projNameCode = proj.project[0].split("#")
                    const projName = projNameCode[0]
                    const projCode = projNameCode[1] ? projNameCode[1] : "0001"
                    const projID = db.prepare(`SELECT ProjID FROM Projects WHERE Name = ? AND ProjectCode = ?`).get(projName, projCode)?.ProjID
                    replyMessage.projectName = projName + "#" + projCode.toString().padStart(4, '0')
                    const projDescription = db.prepare(`SELECT Description FROM Projects WHERE ProjID = ?`).get(projID)?.Description
                    replyMessage.description = projDescription

                    var ownerID = db.prepare(`SELECT OwnerID From Projects WHERE ProjID = ?`).get(projID)?.OwnerID
                    var ownerEmail = db.prepare(`SELECT Email from USERS WHERE UserID = ?`).get(ownerID)?.Email
                    replyMessage.ownerEmail = ownerEmail

                    replyMessage.docs = []
                    var docs = db.prepare(`SELECT Name FROM Documents WHERE Project = ?`).all(projID)
                    var blobs = db.prepare('SELECT Location FROM Documents WHERE Project = ?').all(projID)
                    for (var j = 0; j < docs.length; j++) {
                        replyMessage.docs[docs[j].Name] = fs.readFileSync(blobs[j].Location, { encoding: 'base64' })
                    }

                    // Construct email
                    var emailBodyMessage = "Name # Code: " + replyMessage.projectName
                    if (replyMessage.description) {
                        emailBodyMessage = emailBodyMessage.concat("\nDescription: " + replyMessage.description)
                    }
                    if (replyMessage.ownerEmail) {
                        emailBodyMessage = emailBodyMessage.concat("\nOwner: " + replyMessage.ownerEmail)
                    }
                    var docNames = Object.keys(replyMessage.docs)
                    emailBodyMessage = emailBodyMessage.concat("\nDocs: ")
                    for (var i = 0; i < docNames.length; i++) {
                        emailBodyMessage = emailBodyMessage.concat(docNames[i] + ", ")
                    }

                    console.log(emailBodyMessage)
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] GET PROJECT SUCCESS`, `${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)

                }
                if (doc) {
                    replyMessage.docs = replyMessage.docs ? replyMessage.docs : []
                    for (var j = 0; j < doc.doc.length; j++) {
                        var docString = doc.doc[j].split("-")
                        var docYear = docString[0]
                        var docSerial = docString[1]

                        var docID = db.prepare(`SELECT DocID FROM Documents WHERE Year = ? AND Serial = ?`).get(docYear, docSerial).DocID
                        var docName = db.prepare(`SELECT Name FROM Documents WHERE DocID = ?`).get(docID).Name
                        var fpath = await get_file_path.get(docID).Location
                        replyMessage.docs[docName] = fs.readFileSync(fpath, { encoding: 'base64' })
                        //document names can be accessed as an array by Object.keys(replyMessage.docs)
                        //base64 document blobs can be accessed as an array with Object.values(replyMessage.docs)
                    }
                    // exports.makeBodyAttachments = function (receiverId, subject, message, attach, filenames)
                    // Construct email
                    emailBodyMessage = "Docs: "
                    for (var i = 0; i < Object.keys(replyMessage.docs).length; i++) {
                        emailBodyMessage = emailBodyMessage.concat(Object.keys(replyMessage.docs)[i] + ", ")
                    }
                    raw = await helpers.makeBodyAttachments(`${g_data.sender_email}`, "GET DOCS SUCCESS", `${emailBodyMessage}`, Object.values(replyMessage.docs), Object.keys(replyMessage.docs))
                        await post_send_msg(g_access.data.access_token, raw)
                }
            }
            else if (g_data.cmd == "update") {
                var doc = g_data.access.document
                var proj = g_data.access.project
                var grp = g_data.access.group

                //get userid
                var userdata = get_user.get(`${g_data.sender_email}`)
                var userid = userdata ? userdata.UserID : insert_user.run(g_data.sender_email, g_data.sender_email).lastInsertRowid

                replyMessage = {}

                if (grp) {
                    replyMessage.grp = {}

                    var curName = grp.name[0]
                    replyMessage.grp.name = curName
                    var groupID = db.prepare(`SELECT GroupID FROM Groups WHERE Name = ?`).get(grp.name[0])?.GroupID
                    if (grp.name[1]) {
                        db.prepare(`UPDATE Groups SET Name=? WHERE GroupID=?`).run(grp.name[1], groupID)
                        replyMessage.grp.newName = grp.name[1]
                    }
                    if (groupID) {
                        if (grp.read) { grantPermission("GID", grpid, READ, grp.read, userid) }
                        if (grp.change) { grantPermission("GID", grpid, CHANGE, grp.change, userid) }
                        if (grp.manage) { grantPermission("GID", grpid, MANAGE, grp.manage, userid) }
                        if (grp.description) { db.prepare(`UPDATE Groups SET Description = ? WHERE GroupID = ?`).run(grp.description[0], groupID) }
                        if (grp.member) { //add member(s) to group
                            grp.member.forEach((member) => {
                                member = member.trim()
                                insert_user.run(member, member) //create user if they don't already exist
                                add_to_group.run(member, grpid)
                            })
                        }
                    }
                    // Construct email
                    var emailBodyMessage = "New Name: " + replyMessage.grp.newName
                    
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] UPDATE GROUP SUCCESS`, `${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)
                }
                if (proj) {
                    replyMessage.proj = {}
                    replyMessage.proj.name = proj.name[0]
                    var curString = proj.name[0].split("#")
                    var curName = curString[0]
                    var curCode = curString[1] ? parseInt(curString[1]) : 1
                    var curID = db.prepare(`SELECT ProjID FROM Projects WHERE Name = ? AND ProjectCode = ?`).get(curName, curCode)?.ProjID
                    if (proj.name[1] && curID) {
                        var newString = proj.name[1].split("#")
                        var newName = newString[0]
                        var newCode = db.prepare('SELECT MAX(ProjectCode) FROM Projects WHERE Name = ?').get(newName)?.ProjectCode
                        newCode = newCode ? newCode + 1 : 1
                        db.prepare('UPDATE Projects SET Name=?, ProjectCode=? WHERE ProjID=?').run(newName, newCode, curID)
                        replyMessage.proj.newName = newName + "#" + newCode.toString().padStart(4, '0')
                        if (curName + "#" + curCode == doc?.project) { doc.project = newName + "#" + newCode }
                    }

                    if (curID) {
                        if (proj.read) { grantPermission("PID", curID, READ, proj.read, userid) }
                        if (proj.change) { grantPermission("PID", curID, CHANGE, proj.change, userid) }
                        if (proj.manage) { grantPermission("PID", curID, MANAGE, proj.manage, userid) }
                        if (proj.link) { saveLinks(curID, proj.link[0].trim(), "proj") } //save link(s) to ProjLinks
                        if (proj.description) { db.prepare('UPDATE Projects SET Description=? WHERE ProjID=?').run(proj.description, curID) }
                    }

                    // Construct email
                    var emailBodyMessage = replyMessage.proj.newName
                    
                    console.log(emailBodyMessage)
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] UPDATE PROJECT SUCCESS`, `New Name # Code: ${emailBodyMessage}`)
                    await post_send_msg(g_access.data.access_token, raw)
                }
                if (doc) {
                    replyMessage.doc = doc.doc
                    for (var j = 0; j < doc.doc.length; j++) {
                        let currDoc = doc.doc[j]

                        var docString = currDoc.split("-")
                        var docYear = docString[0]
                        var docSerial = docString[1]
                        var docQuery = db.prepare(`SELECT DocID, Project FROM Documents WHERE Year = ? AND Serial = ?`).get(docYear, docSerial)
                        var docID = docQuery.DocID

                        if (doc.project) {
                            var projString = doc.project[0].split("#")
                            var projName = projString[0]
                            var projCode = projString[1] ? projString[1] : 1
                            var projID = find_project.get(projName, projCode)?.ProjID
                            if (!projID) {
                                var maxCode = db.prepare('SELECT MAX(ProjectCode) FROM Projects WHERE Name=?').get(projName).ProjectCode
                                projCode = maxCode ? maxCode + 1 : 1
                                projID = insert_project.run(projName, userid, projCode, "None").lastInsertRowid
                                grantPermission("PID", projID, MANAGE, [g_data.sender_email], userid)
                            }
                            db.prepare(`UPDATE Documents SET Project = ? WHERE DocID = ?`).run(projID, docID)
                        }
                        if (doc.replace) {
                            if (doc?.replace[j]) {
                                var replaceString = doc.replace[j].split("-")
                                var replaceYear = replaceString[0]
                                var replaceSerial = replaceString[1]
                                var replaceID = get_DocID.get(replaceYear, replaceSerial)?.DocID
                                db.prepare('UPDATE Documents SET Replaces=? WHERE DocID=?').run(replaceID, docID)
                                db.prepare('UPDATE Documents SET ReplacedBy=? WHERE DocID=?').run(docID, replaceID)
                            }
                        }
                        if (doc.name) {
                            if (doc?.name[j]) {
                                var newDocName = doc.name[j]
                                db.prepare(`UPDATE Documents SET Name = ? WHERE DocID = ?`).run(newDocName, docID)
                            }
                        }
                        
                        if (doc.description) {
                            if (doc?.description[j]) {
                                var newDocDesc = doc.description[j]
                                db.prepare(`UPDATE Documents SET Description = ? WHERE DocID = ?`).run(newDocDesc, docID)
                            }
                        }
                        
                        if (doc.note) {
                            if (doc?.note[j]) {
                                var newDocNote = doc.note[j]
                                // var currDate = currentDate.getDay() + "/" + currentDate.getDate() + "/" + currentDate.getFullYear()
                                var currDate = date.toString()
                                db.prepare(`INSERT INTO Notes (DID, UID, DateAdded, Note) VALUES (?, ?, ?, ?)`).run(docID, userid, currDate, newDocNote)
                            }
                        }
                        
                        if (doc.tag) {
                            if (doc?.tag[j]) {
                                saveTags(docID, doc.tag[j].trim())
                            }
                        }
                        
                        if (doc.link) {
                            if (doc?.link[j]) {
                                saveLinks(docID, doc.link[j].trim(), "doc")
                            }
                        }
                        
                    }
                    // Construct email
                    // var emailBodyMessage = replyMessage.doc
                    // console.log(replyMessage.doc)
                    raw = await helpers.makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[BOT MESSAGE] UPDATE DOCUMENT SUCCESS`, `Documents Successfully Updated`)
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