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

    var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail
}

//find where the body of the message is
exports.findBody = function (g_raw) {
	var message
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
    var attachments = []
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
    var title = "error"
    var find_index = [19, 21, 3, 4]
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
    var find_index = [16, 4, 18, 5]
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
    var sender_name_and_email = g_raw.data.payload.headers[i].value
    var sender_name = sender_name_and_email.replace(/(?:\\[rn]|[\r\n<>"]+)+/g, "")

    var words = sender_name.split(' ')
    var sender_email = words[words.length - 1]
    words.splice(-1, 1)
    sender_name = words.join(' ')
    return sender_name + "=" + sender_email
}

//find the date
exports.findDate = function (g_raw) {
    var find_index = [17, 1, 19]
    for (let i = 0; i < find_index.length; i++) {
        const element = find_index[i]
        if (typeof g_raw.data.payload.headers[element] != 'undefined') { //check if it exists
            if (g_raw.data.payload.headers[element].name.toLowerCase() == "date")
                var date = g_raw.data.payload.headers[element].value
            return date
        }
    }
}

//parses the message and grabs the emails (is accompanied with function below)
exports.parseBody = function (message) {
    try {
        var m_parse = message.split("\n") //split according to "newlines in message"
        m_parse = m_parse.filter(function (el) { return el != ''; }) //remove '' from array 
        var data = {}
        var mode = "none"
        for (var i = 0; i < m_parse.length; i++) {
            var kv = m_parse[i].split(":")
            var key = kv[0].trim().toLowerCase()
            var value = kv[1]
            if (key[0] == "#") { 
                mode = key.replace('#', '') 
                data[mode] = {}
            }
            else if (data[mode] && value) {
                while (m_parse[i + 1] && !m_parse[i + 1].match('[#:]')) {
                    value = value + m_parse[i + 1]
                    i++;
                }
                value = value.replace('\r', '').split('\\\\')
                for (var j = 0; j < value.length; j++) {
                    if (!data[mode][key]) { data[mode][key] = [] }
                    data[mode][key].push(value[j].trim())
                }
            }
        }
    } catch (err) {
        console.log("err: \n", err)
    }
    // console.log("data: ", data)
    return data 
}

exports.makeBodyAttachments = function (receiverId, subject, message, attach, filenames) {
    var boundary = "dms" // set demarcation value
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
