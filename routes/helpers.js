const { Base64 } = require('js-base64')
const validator = require('validator')

//send a message to the user if message was successful or not
exports.makeBody = async function(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail
}

//find where the body of the message is
exports.findBody = function(g_raw) {
    try {
        if (g_raw.data.payload.parts[0].body.data) {
            //this exists when there is no attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].body.data)
            // message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r 
        } else if (g_raw.data.payload.parts[0].parts[0].body.data) {
            //this exists when there is an attachment provided
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].body.data)
            // message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        } else if (g_raw.data.payload.parts[0].parts[0].parts[0].body.data) {
            message = Base64.decode(g_raw.data.payload.parts[0].parts[0].parts[0].body.data)
            // message = message.replace(/(?:\\[rn]|[\r\n]+)+/g, "") //removes \n and \r
        } else {
            message = g_raw.data.snippet
        }
        return message
    }
    catch(err) { console.log("error in helpers.findBody()") }
}

//get attachments that are pdfs
exports.findAttachments = function(g_raw) {
    try {
        attachments = []
        if (g_raw.data.payload.parts != undefined) {
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
    catch(err) { console.log("error in helpers.findAttachments()") }
}

//find the subject title of the email
exports.findSubject = function(g_raw) {
    try {
        find_index = [19,21,3,4]
        for (let i = 0; i < find_index.length; i++) {
            const element = find_index[i]
            if (typeof g_raw.data.payload.headers[element] != 'undefined') {
                if (g_raw.data.payload.headers[element].name == "Subject") {
                    title = g_raw.data.payload.headers[element].value
                }
            }
        }
        return title
    }
    catch(err) { console.log("error in helpers.findSubject()") }
}

//find the command that the user entered in the title
exports.findCmd = function(title) {
    try {
        if (title == []) {
            find_name = ["save", "help", "access"]
            f_cmd = title.split(' ')

            //save attachments to db
            for (let i = 0; i < find_name.length; i++) {
                const element = find_name[i];
                if (f_cmd[0].toLowerCase() == element) {
                    found_cmd = element
                    return found_cmd
                }
            }
        }
    }
    catch(err) { console.log("error in helpers.found_cmd()") }
}

//want to find the sender email and name

exports.findSenderInfo = function(g_raw) {
    try {
        find_index = [16,4,18,5]
        sender_arr = []
        for (let i = 0; i < find_index.length; i++) {
            const element = find_index[i]
            if (typeof g_raw.data.payload.headers[element] != 'undefined') {
                if (g_raw.data.payload.headers[element].name == "From") {
                    sender_data = g_raw.data.payload.headers[element].value
                    data = sender_data.split(/[\s,<>]+/)
                    sender_arr.push(data[0] + " " + data[1])
                    sender_arr.push(data[2])
                    return sender_arr
                }
            }
        }
    }
    catch(err) { console.log("error in helpers.findSenderInfo()") }
}

//find the date
exports.findDate = function(g_raw) {
    try {
        find_index = [17,1,19]
        for (let i = 0; i < find_index.length; i++) {
            const element = find_index[i]
            if (typeof g_raw.data.payload.headers[element] != 'undefined') {
                if (g_raw.data.payload.headers[element].name == "Date")
                    date = g_raw.data.payload.headers[element].value
                    return date
            }
        }
    }
    catch(err) { console.log("error in helpers.findDate()") }
}

//parses the message and grabs the emails (is accompanied with function below)
exports.parseBody = function(message) {
    obj = []
    m_parse = message.split("\r\n") //split according to "newlines in message"
    m_parse = m_parse.filter(function (el) { //remove '' from array
        return el != '';
    })

    for (let i = 0; i < m_parse.size; i++) { //there should be 4 or less things
        p_arr = m_parse[i].split(":") //parse between the colons
        key = p_arr[0].replace(/\s/g, '') //remove spaces
        value = p_arr[1]

        console.log(key)
        if(value != undefined && value != null) {
            if(key == 'project') {
                project = value
            }
            else if(key == 'read') {
                read = loopEmails(value)
                obj.push({"read": read})
            }
            else if(key == 'change') {
                change = loopEmails(value)
                obj.push({"change": change})
            }
            else if(key == 'manage') {
                manage = loopEmails(value)
                obj.push({"manage": manage})
            }
            else {
                console.log("bad input included (ignored)")
            }
        }
    }
    return obj
}

//loop thorugh all the meails
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
            console.log("match not found") //we will not process this email if its not found
        }
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