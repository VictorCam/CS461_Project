const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require('fs');
const { Base64 } = require('js-base64');
const { isEmpty } = require("lodash");
const axios = require("axios")
const Database = require('better-sqlite3');
const db = new Database('./database/beavdms.db');

//global constants
var currentDate = new Date(); //current date for database saving
const userId = "gobeavdms@gmail.com" //user id for api requests
const MANAGE = 4; //Permission to grant access to other users
const CHANGE = 2; //Permission to add document to project, etc...
const READ = 1; //Permission to read document

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

function parse_from(i, g_raw){
    sender_name_and_email = g_raw.data.payload.headers[i].value
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
    sender_name_and_email = [], sender_email = [], sender_name = [], date = [], title = [], account_access = [], attachments = [], message = [], found_cmd = "no_cmd"

    //subject (outside of loop so I can check first cmd on the title if not then I don't do any parsing)
    find_index = [19,21,3,4]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') {
            if (g_raw.data.payload.headers[element].name == "Subject") {
                title = g_raw.data.payload.headers[element].value
            }
        }
    }

    //commands: help, save, get
    if (!isEmpty(title)) {
        find_name = ["save", "help", "access"]
        f_cmd = title.split(' ')

        //save attachments to db
        for (let i = 0; i < find_name.length; i++) {
            const element = find_name[i];
            if (f_cmd[0].toLowerCase() == element) {
                found_cmd = element
            }
        }
    }

    //get attachments that are pdfs (this must be outside of loop)
    if (g_raw.data.payload.parts != undefined) {
        for (let n = 0; n < g_raw.data.payload.parts.length - 1; n++) {
            if (g_raw.data.payload.parts[n + 1].mimeType == "application/pdf") { //MUST BE PDF!
                var attach_json = {
                    "mime": g_raw.data.payload.parts[n + 1].mimeType,
                    "filename": g_raw.data.payload.parts[n + 1].filename,
                    "attach_id": g_raw.data.payload.parts[n + 1].body.attachmentId,
                    "raw": null
                }
                attachments.push(attach_json)
            }
        }
    }

    //sender name and sender email (outside loop so we can determine error)
    find_index = [16,4,18,5]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') {
            if (g_raw.data.payload.headers[element].name == "From") {
                var raw_from = parse_from(element, g_raw)
                var words = raw_from.split('=')
                sender_name = words[0]
                sender_email = words[1]
            }
        }
    }

    //if attachments is empty or if cmd not found then there is no point in parsing the rest of the data :/
    if (!isEmpty(attachments) && found_cmd != "no_cmd") {
        //seperate title and command
        f_cmd.shift()
        title = f_cmd.join(" ")

        //query to get raw base64 attachments added in order to save them
        for (let a = 0; a < attachments.length; a++) {
            var raw = await get_attachments(g_access, g_id, attachments[a].attach_id)
            attachments[a].raw = raw.data.data
        }

        //date
        find_index = [17,1,19]
        for (let i = 0; i < find_index.length; i++) {
            const element = find_index[i]
            if (typeof g_raw.data.payload.headers[element] != 'undefined') {
                if (g_raw.data.payload.headers[element].name == "Date")
                    date = g_raw.data.payload.headers[element].value
            }
        }

        //find message
        if (g_raw.data.payload.parts[0].body.data) {
            //this exists when there is no attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r 
        } else if (g_raw.data.payload.parts[0].parts[0].body.data) {
            //this exists when there is an attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        } else if (g_raw.data.payload.parts[0].parts[0].parts[0].body.data) {
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].parts[0].body.data)
            message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        } else {
            message = g_raw.data.snippet.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        }

        //who has access to this document
        find_index = [20,22,5,6]
        for (let i = 0; i < find_index.length; i++) {
            const element = find_index[i]
            if (typeof g_raw.data.payload.headers[element] != 'undefined') {
                if (g_raw.data.payload.headers[element].name == "To") {
                    p_access = g_raw.data.payload.headers[element].value
                    p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                    account_access = [...new Set(p_access_regex)]
                }
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

const get_user = db.prepare("SELECT * FROM Users WHERE Email= ?")
const insert_user = db.prepare("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)")
const insert_doc = db.prepare("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, ?, ?, ?)")
const find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?")
const insert_perm = db.prepare("INSERT INTO Permissions (DID, UID, Permissions) VALUES (?, ?, ?)")

async function g_request(callback) {
    const g_access = await get_token() //getting access token 
    const g_id = await get_msg_id(g_access.data.access_token) //getting messages
    if (g_id.data.resultSizeEstimate == 0) { return callback() } //called when there is no maills to look through

    //loop through all messages and save them
    for (let idx = 0; idx < Object.keys(g_id.data.messages).length; idx++) {
        var g_raw = await get_msg_data(g_access.data.access_token, g_id.data.messages[idx].id) //getting data
        await post_msg_delete(g_access.data.access_token, g_id.data.messages[idx].id) //delete msg to trash
        var g_data = await parse_data(g_raw, idx, g_access.data.access_token) //parse data

        //inside here we will save users/documents
        if (g_data.cmd == "save") {
            for (var j = 0; j < Object.keys(g_data.attachments).length; j++) {
                fs.writeFile(`./files/${g_data.g_id}-${j}.pdf`, g_data.attachments[j].raw, { encoding: 'base64' }, function(err) { if (err) { return console.log("err with writing pdf file") } })

                //save or grab user and save document location
                user = get_user.get(`${g_data.sender_email}`)
                if (!user) { insert_user.run(`${g_data.sender_name}`, `${g_data.sender_email}`, "Unknown") } 
                //create a new user
                user = get_user.get(`${g_data.sender_email}`)
                insert_doc.run(`${g_data.title}`, `${g_data.message}`, `./files/${g_data.g_id}-${j}.pdf`, `${user.UserID}`, null, currentDate.toString())
                doc = find_doc.get(`./files/${g_data.g_id}-${j}.pdf`)

                //save new users and give permissions
                for (let a = 0; a < Object.keys(g_data.access).length; a++) {
                    user = get_user.get(`${g_data.access[a]}`)
                    if (!user) { insert_user.run(`Unknown`, `${g_data.access[a]}`, "Unknown") } 
                    //create a new user
                    user = get_user.get(`${g_data.access[a]}`)
                    insert_perm.run(doc.DocID, user.UserID, READ)
                }
            }

            //case in where if the parse data has empty arrays then the parse() function found a formatting issue
            if (!isEmpty(g_data.sender_email) && !isEmpty(g_data.attachments)) {
                raw = makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[AUTO MESSAGE] SAVED ATTACHMENTS`, `Success: Saved data successfully to gobeavdms! \n\n Origin of Message: ${g_data.title}`)
                await post_send_msg(g_access.data.access_token, raw)
            } else {
                raw = makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[AUTO MESSAGE] ERROR SAVING ATTACHMENTS`, `Error: No attachments were added or invalid email format \n\n Origin of Message: ${g_data.title}`)
                await post_send_msg(g_access.data.access_token, raw)
            }
        } 
        else if (g_data.cmd == "access") {
            console.log("test")
        }
        else {
            raw = makeBody(`${g_data.sender_email}`, "gobeavdms@gmail.com", `[AUTO MESSAGE] ERROR SAVING ATTACHMENTS`, `Error: Did not specify a command on the subject line \n\n Origin of Message: ${g_data.title}`)
            await post_send_msg(g_access.data.access_token, raw)
        }
    }
    return callback()
}

async function recall() {
    await g_request(recall)
}
recall()

router.get("/home", (req, res) => {
    const get_docs = db.prepare("SELECT * FROM Documents")
    docs = get_docs.all()
    res.status(200).json(docs)
});

router.use(cors());

module.exports = router;