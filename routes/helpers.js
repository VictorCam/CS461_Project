const { Base64 } = require('js-base64')
const validator = require('validator')

//send a message to the user if message was successful or not
exports.makeBody = async function(to, from, subject, message) {
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
exports.findBody = function(g_raw) {
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
exports.findAttachments = function(g_raw) {
    attachments = []
    if (g_raw.data.payload.parts != undefined) { //check if it exists
        for (let n = 0; n < g_raw.data.payload.parts.length - 1; n++) {
            if (g_raw.data.payload.parts[n+1].mimeType == "application/pdf") { //MUST BE PDF!
                var attach_json = {
                    "mime": g_raw.data.payload.parts[n+1].mimeType,
                    "filename": g_raw.data.payload.parts[n+1].filename,
                    "attach_id": g_raw.data.payload.parts[n+1].body.attachmentId,
                    "raw": null
                }
                attachments.push(attach_json)
            }
        }
    }
    return attachments
}

//find the subject title of the email
exports.findSubject = function(g_raw) {
    title = "error"
    find_index = [19,21,3,4]
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
exports.findSenderInfo = function(g_raw) {
    find_index = [16,4,18,5]
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

function parse_from(i, g_raw){
    sender_name_and_email = g_raw.data.payload.headers[i].value
    sender_name = sender_name_and_email.replace(/(?:\\[rn]|[\r\n<>"]+)+/g, "")

    var words = sender_name.split(' ')
    sender_email = words[words.length - 1]
    words.splice(-1, 1)
    sender_name = words.join(' ')
    return sender_name + "=" + sender_email
}

//find the date
exports.findDate = function(g_raw) {
    find_index = [17,1,19]
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
exports.parseBody = function(message) {
    obj = []
    m_parse = message.split("\r\n") //split according to "newlines in message"
    m_parse = m_parse.filter(function (el) { //remove '' from array
        return el != '';
    })

    for (let i = 0; i < m_parse.length; i++) { //there should be 4 or less things
        p_arr = m_parse[i].split(":") //parse between the colons
        key = p_arr[0].replace(/\s/g, '') //remove spaces
        value = p_arr[1]

        if(value != undefined && value != null) {
            if(key.toLowerCase() == 'project') {
                project = value.trim() //remove spaces to front and end of str
                obj.push({"project": project})
            }
            else if(key.toLowerCase() == 'read') {
                read = loopEmails(value)
                obj.push({"read": read})
            }
            else if(key.toLowerCase() == 'change') {
                change = loopEmails(value)
                obj.push({"change": change})
            }
            else if(key.toLowerCase() == 'manage') {
                manage = loopEmails(value)
                obj.push({"manage": manage})
            }
            else if(key.toLowerCase() == 'names') {
                names = loopArgs(value)
                obj.push({"names": names})
            }
            else {
                console.log("bad input included (ignored)")
            }
        }
    }
    return obj
}

//loop thorugh all the emails
function loopEmails(value) {
    email = value.replace(/\s/g, '') //remove spaces
    email = email.split(",") //parse by commas
    data = []

    email = email.filter(function (el) { //remove arrays that contain ''
        return el != ''
    })

    for (let e = 0; e < email.length; e++) { //loop though all valid emails according to parsing
        const element = email[e]
        if(element.match("@oregonstate.edu") && validator.isEmail(element)) {
            data.push(element)
        }
        else {
            console.log("email is not valid or not part of OSU") //we will not process this email if its not found
        }
    }

    return data
}

//loop thorugh all the args
function loopArgs(value) {
    arg = value.replace(/\s/g, '') //remove spaces
    arg = arg.split(",") //parse by commas
    data = []

    arg = arg.filter(function (el) { //remove arrays that contain ''
        return el != ''
    })

    for (let e = 0; e < arg.length; e++) { //loop though all valid args according to parsing
        data.push(arg[e])
    }

    return data
}

exports.makeBodyAttachments = function(receiverId, subject, message, attach) {
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
    "To: " + receiverId,
    "Subject: " + subject,
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