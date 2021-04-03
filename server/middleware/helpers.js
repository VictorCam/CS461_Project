const { Base64 } = require('js-base64')
const validator = require('validator')

//send a message to the user if message was successful or not
exports.makeBody = async function (to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "To: ", to, "\n",
        "From: ", from, "\n",
        "Subject: ", subject, "\n\n",
        message
    ].join('');

    encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail
}

//find where the body of the message is
exports.findBody = function (g_raw) {
    if (g_raw.data.payload.parts[0].body.data) {
        message = Base64.decode(g_raw.data.payload.parts[0].body.data)
    }
    else if (g_raw.data.payload.parts[0].parts[0].body.data) {
        message = Base64.decode(g_raw.data.payload.parts[0].parts[0].body.data)
    }
    else if (g_raw.data.payload.parts[0].parts[0].parts[0].body.data) {
        message = Base64.decode(g_raw.data.payload.parts[0].parts[0].parts[0].body.data)
    }
    else {
        message = g_raw.data.snippet
    }
    return message
}

//get attachments that are pdfs
exports.findAttachments = function (g_raw) {
    attachments = []
    if (g_raw.data.payload.parts != undefined) { //check if it exists
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
    return attachments
}

//find the subject title of the email
exports.findSubject = function (g_raw) {
    title = "error"
    find_index = [19, 21, 3, 4]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') { //check if it exists
            if (g_raw.data.payload.headers[element].name.toLowerCase() == "subject") {
                title = g_raw.data.payload.headers[element].value
                return title
            }
        }
    }
    return title
}

//want to find the sender email and name 
exports.findSenderInfo = function (g_raw) {
    find_index = [16, 4, 18, 5]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') {
            if (g_raw.data.payload.headers[element].name == "From") {
                var raw_from = parse_from(element, g_raw)
                var words = raw_from.split('=')
                return words
            }
        }
    }
    return ["NA", "NA"] //no user was unfortunetly found
}

function parse_from(i, g_raw) {
    sender_name_and_email = g_raw.data.payload.headers[i].value
    sender_name = sender_name_and_email.replace(/(?:\\[rn]|[\r\n<>"]+)+/g, "")

    var words = sender_name.split(' ')
    sender_email = words[words.length - 1]
    words.splice(-1, 1)
    sender_name = words.join(' ')
    return sender_name + "=" + sender_email
}

//find the date
exports.findDate = function (g_raw) {
    find_index = [17, 1, 19]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') { //check if it exists
            if (g_raw.data.payload.headers[element].name.toLowerCase() == "date")
                date = g_raw.data.payload.headers[element].value
            return date
        }
    }
}

//parses the message and grabs the emails (is accompanied with function below)
exports.parseBody = function (message) {
    obj = []
    m_parse = message.split("\r\n") //split according to "newlines in message"
    m_parse = m_parse.filter(function (el) { //remove '' from array
        return el != '';
    })

    for (let i = 0; i < m_parse.length; i++) { //there should be 4 or less things
        p_arr = m_parse[i].split(":") //parse between the colons
        key = p_arr[0].replace(/\s/g, '') //remove spaces
        value = p_arr[1]

        if (value != undefined && value != null) {
            if (key.toLowerCase() == 'project') {
                project = value.trim() //remove spaces to front and end of str
                obj.push({ "project": project })
            }
            else if (key.toLowerCase() == 'newproject') {  //soft maybe

            }
            else if (key.toLowerCase() == 'projectdescription') { //need

            }
            else if (key.toLowerCase() == 'read') {
                read = loopEmails(value)
                obj.push({ "read": read })
            }
            else if (key.toLowerCase() == 'change') {
                change = loopEmails(value)
                obj.push({ "change": change })
            }
            else if (key.toLowerCase() == 'manage') {
                manage = loopEmails(value)
                obj.push({ "manage": manage })
            }
            else if (key.toLowerCase() == 'name' ||
                key.toLowerCase() == 'names') {
                names = loopArgs(value)
                obj.push({ "names": names })
            }
            else if (key.toLowerCase() == 'doc' ||
                key.toLowerCase() == 'docs') {
                docs = loopArgs(value)
                obj.push({ "docs": docs })
            }
            else if (key.toLowerCase() == 'description') {  //need

            }
            else if (key.toLowerCase() == 'replaces') { //probably need

            }
            else if (key.toLowerCase() == 'note' ||  //need
                key.toLowerCase() == 'notes') {
                
            }
            else if (key.toLowerCase() == 'projectread') { //don't need

            }
            else if (key.toLowerCase() == 'projectchange') { //don't need

            }
            else if (key.toLowerCase() == 'projectmanage') { //don't need

            }
            else if (key.toLowerCase() == 'link' || //probably not
                key.toLowerCase() == 'links') {

            }
            else if (key.toLowerCase() == 'projectlink' || //probably not
                key.toLowerCase() == 'projectlinks') {

            }
            else if (key.toLowerCase() == 'tag' || //need
                key.toLowerCase() == 'tags') {

            }
            else if (key.toLowerCase() == 'revoke') { //don't need

            }
            else if (key.toLowerCase() == 'projectrevoke') { //don't need

            }
            else {
                console.log("bad input included (ignored)")
                console.log("key: ", key.toLowerCase())
            }
        }
    }
    return obj
}

//loop thorugh all the emails
function loopEmails(value) {
    email = value.replace(/\s/g, '') //remove spaces
    email = email.split("\\") //parse by commas
    data = []

    email = email.filter(function (el) { //remove arrays that contain ''
        return el != ''
    })

    for (let e = 0; e < email.length; e++) { //loop though all valid emails according to parsing
        const element = email[e]
        if (element.match("@oregonstate.edu") && validator.isEmail(element)) {
            data.push(element)
        }
        else {
            console.log("match not found") //we will not process this email if its not found
        }
    }

    return data
}

//loop thorugh all the args
function loopArgs(value) {
    arg = value.split(",") //parse by commas
    data = []

    arg = arg.filter(function (el) { //remove arrays that contain ''
        return el != ''
    })

    for (let e = 0; e < arg.length; e++) { //loop though all valid args according to parsing
        arg[e].trim()
        data.push(arg[e])
    }

    return data
}

exports.makeBodyAttachments = function (receiverId, subject, message, attach, filenames) {
    boundary = "dms" // set demarcation value
    // set email headers
    var str = [
        "MIME-Version: 1.0",
        "Content-Transfer-Encoding: 7bit",
        "To: " + receiverId,
        "Subject: " + subject,
        "Content-Type: multipart/alternate; boundary=" + boundary + "\n",
        "--" + boundary,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 7bit" + "\n",
        message + "\n",
    ].join("\n") // set format
    
    // append each attachment to the email
    for(var i = 0; i < attach.length; i++) {
        str += ["--" + boundary,
        "--" + boundary,
        `Content-Type: Application/pdf; name=${filenames[i]}`,
        `Content-Disposition: attachment; filename=${filenames[i]}`,
        "Content-Transfer-Encoding: base64" + "\n",
        `${attach[i]}`,
        ].join("\n")
    }
    
    // append email tail
    str += ["--" + boundary + "--"].join("\n")

    var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}