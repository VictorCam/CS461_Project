const { Base64 } = require('js-base64');

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
    return encodedMail;
}

//find where the body of the message is
exports.findBody = function(g_raw) {
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

//get attachments that are pdfs
exports.findAttachments = function(g_raw) {
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

//find the subject title of the email
exports.findSubject = function(g_raw) {
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

//find the command that the user entered in the title
exports.findCmd = function(title) {
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

exports.findSenderInfo = function(g_raw) {
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

exports.findDate = function(g_raw) {
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