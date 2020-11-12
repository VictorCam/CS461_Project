const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { Base64 } = require('js-base64');
const { isBuffer, isNull } = require("lodash");
const sqlite3 = require('sqlite3').verbose();
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


//global variables
google_data = []

const SCOPES = ['https://mail.google.com/']; //AUTHORIZATION TO EVERYTHING
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Get data from user account
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * 
 */
async function get_data(auth) {
    //used to know what id the attachment corresponds to
    const gmail = google.gmail({
        version: 'v1',
        auth
    });

    //api call for getting all id's of emails
    gmail.users.messages.list({
        userId: 'me',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        var msg_id = res.data.messages

        //check if there are messages
        if (msg_id == undefined) {
            return
        }
        else if (msg_id.length == 0) {
            return
        }

        for (let i = 0; i < msg_id.length; i++) {
            gmail.users.messages.get({
                userId: 'me',
                id: res.data.messages[i].id,
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);

                raw_attachments = []
                attach_mime_name = []

                id1 = i;
                id2 = res.data.id
                sender_name_and_email = res.data.payload.headers[16].value
                sender_name = sender_name_and_email.replace(/(?:\\[rn]|[\r\n<>"]+)+/g, "")

                var words = sender_name.split(' ')
                sender_email = words[words.length - 1]
                words.splice(-1, 1)
                sender_name = words.join(' ')

                date = res.data.payload.headers[17].value
                title = res.data.payload.headers[19].value
                message = ""

                if (res.data.payload.parts[0].body.data) {
                    //this exists when there is no attachment provided
                    message = Base64.decode(res.data.payload.parts[0].body.data)
                    message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r 
                } else {
                    //this exists when there is an attachment provided
                    message = Base64.decode(res.data.payload.parts[0].parts[0].body.data)
                    message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
                }

                p_access = res.data.payload.headers[20].value
                p_access_regex = p_access.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                let account_access = [...new Set(p_access_regex)]

                content = {
                    "id": id1,
                    "g_id": id2,
                    "sender_name": sender_name,
                    "sender_email": sender_email,
                    "access": account_access,
                    "title": title,
                    "message": message,
                    "attach_mime_name": [],
                    "raw_attachments": [],
                    "date": date
                }

                google_data.push(content)

                google_data.sort(function (a, b) {
                    return a.id - b.id;
                });

                //get mime and filename
                // for (let n = 0; n < res.data.payload.parts.length; n++) {
                //     if(res.data.payload.parts[n+1].mimeType != undefined || res.data.payload.parts[n+1].filename != undefined) {
                //         google_data[i].attach_mime_name.push([res.data.payload.parts[n+1].mimeType, res.data.payload.parts[n+1].filename])
                //     }
                // }

                //get raw data
                for (let a = 0; a < res.data.payload.parts.length - 1; a++) {
                    if (res.data.payload.parts[a + 1].body.attachmentId != undefined) {
                        gmail.users.messages.attachments.get({
                            userId: 'me',
                            messageId: id2,
                            id: res.data.payload.parts[a + 1].body.attachmentId
                        }, (err, res) => {
                            if (err) return console.log('The API returned an error: ' + err);
                            google_data[i].raw_attachments.push(res.data.data)
                            var j = Math.floor(Math.random() * 1000000);
                            // console.log("P2: a_length:", google_data[i].raw_attachments.length, " id:", google_data[i].id, " index:", i)
                                fs.writeFile(`./files/${google_data[i].g_id}-${google_data[i].title}-${j}.pdf`, google_data[i].raw_attachments[0], { encoding: 'base64' }, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });
                                db.serialize(function () {
                                    db.get(`SELECT * FROM Users WHERE Email='${google_data[i].sender_email}'`, function (err, user) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        if(!user){
                                            db.run("INSERT INTO Users (Name, Email, Major) VALUES (?, ?, ?)", ["Anonymous", `${google_data[i].sender_email}`, "Unkown"]);
                                        }
                                    });
                                    db.run("INSERT INTO Documents (Name, Description, Location, OwnerID, Project, DateAdded) VALUES (?, ?, ?, (SELECT UserID FROM Users WHERE Email=?), (SELECT ProjID FROM Projects WHERE Name=?), (SELECT date('now')))", [`${google_data[i].title}`, "We should probably have a description field", `./files/${google_data[i].g_id}-${google_data[i].title}-${j}.pdf`, `${google_data[i].sender_email}`, "BeverDMS"]);
                                });
                        });
                    }
                }


                //UNCOMMENT THIS WHEN DATA IS BEING PROPERLY STORED IN DATABASE
                // gmail.users.messages.trash({
                //     userId: 'me',
                //     id: id2
                // }, (err, res) => {
                //     if (err) return console.log('The API returned an error: ' + err);  
                //     console.log("DELETED", res.data)
                // })

                //MIGHT NOT USE THIS COMMENTED LOOP BELOW (DO NOT DELETE NOR UNCOMMENT)
                // for (let u = 0; u < account_access.length; u++) {
                //     if (account_access[u] == "email@gmail.com" || sender_name == "") { //check access (need a check for the sender too)
                //         console.log("found email")
                //         break
                //     }
                // }
            });
        }
    });
}



router.get("/", (req, res) => {

    fs.readFile('credentials.json', (err, content) => { //get recent data from gobeavDMS@gmail.com
        google_data = []
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), get_data); //Authorize a client with credentials, then call the Gmail API.
    })

    // fs.writeFile("./database/file1.pdf",google_data[4].raw_attachments[0],{encoding: 'base64'},function(err) {
    //     if(err) {
    //         console.log(err)
    //     }
    //     else {
    //         console.log("file created")
    //     }
    // })

    res.status(200).send(google_data) //we should change this to point to our database rather than google's api
});

router.use(cors());

module.exports = router;