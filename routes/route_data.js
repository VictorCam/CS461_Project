const express = require("express");
const router = express.Router();
const cors = require("cors");
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const {Base64} = require('js-base64');

var app = express();
//const connectsql = require("../server_connection"); // no server connection yet

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), get_data);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
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
function get_data(auth) {
  //used to know what id the attachment corresponds to
  const gmail = google.gmail({version: 'v1', auth});

  //api call for getting all id's of emails
  gmail.users.messages.list({ 
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    var msg_id = res.data.messages
    //console.log(msg_id)
    //return msg_id
    //res.status(200).send("hello")
    save_attach_id = []

    //api call for obtaining body content
    for(let i = 0; i < msg_id.length; i++) {
      gmail.users.messages.get({
        userId: 'me',
        id: res.data.messages[i].id,
        //metadataHeaders: ['id']
      }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);

        //get id's
        //console.log(res.data.id)

        //get title (need to check when no input is made)
        //console.log(res.data.payload.headers[19].value)

        //get users allowed (names weridly get double appended sometimes)
        //console.log("allowed: ", res.data.payload.headers[20].value)

        // //get content (exists even when body is empty)
        // if(res.data.payload.parts[0].body.data) {
        //   //this exists when there is no attachment provided
        //   console.log("content: ", Base64.decode(res.data.payload.parts[0].body.data))
        // }
        // else {
        //   //this exists when there is an attachment provided
        //   console.log("content:", Base64.decode(res.data.payload.parts[0].parts[0].body.data))
        // }

      ///////////////////////////COME BACK TO THIS since Im trying to save them
      //check attachments ids
        if(res.data.payload.parts[1].headers[4] != undefined) {
          //find_msg_id.push(res.data.id)
          for (let a = 0; a < res.data.payload.parts.length-1; a++) {
            console.log(res.data.payload.parts[a+1].headers[4].value)
            save_attach_id.push([res.data.payload.parts[a+1].headers[4].value])
          }
        }
      });


      //api call to get attachments using ids (INCOMPLETE)
      // if(res.data.payload.parts[1].headers[4] != undefined) {
      //   gmail.users.messages.list({ 
      //     userId: 'me',
      //   }, (err, res) => {
      //     if (err) return console.log('The API returned an error: ' + err);
      //     var msg_id = res.data.messages
      //     console.log(msg_id)
      //   });
      // }
    }
    // (async () => { 
    //   await new Promise(r => setTimeout(r, 5000));
    // })
    console.log("saved: ", save_attach_id)
    return
  });
}



router.get("/", (req, res) => {
  res.status(200).send("hello") //saying hello world
});

router.use(cors());

module.exports = router;