// Validate JSON objects & check permissions
const Joi = require('joi')

exports.save_filter = function(db, json) {

    if(typeof json.access.project === 'undefined' && typeof json.access.document === 'undefined' && typeof json.access.group === 'undefined') {
        console.log("none of these exist so we give an error here")
        return {"error": "please specify a #project #document or #group"}
    }

    // console.log("test", json)

    if(json.attachments.length > 0) {
        fschema = Joi.object({
            id: Joi.number().required(),
            g_id: Joi.string().alphanum().required(),
            sender_name: Joi.string().required(),
            sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
            date: Joi.string().required(),
            cmd: Joi.string().required(),
            attachments: Joi.array(),
            access: Joi.object().keys(
                {
                    document: Joi.object().keys({ //ALL OPTIONAL
                        project: Joi.array().items(Joi.string()).min(1).max(1).label("please provide at only one project name in a #document [OPTIONAL FIELD]"),
                        read: Joi.array().items(Joi.string()).min(1).label("pleast provide at least one person to read this #document [OPTIONAL FIELD]"),
                        change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #document [OPTIONAL FIELD]"),
                        manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #document [OPTIONAL FIELD]"),
                        name: Joi.array().min(json.attachments.length).max(json.attachments.length).items(Joi.string().allow('')).label("please provide a name for each individual document you attach for this #document (ex. 3 attachments = 3 names) [OPTIONAL FIELD]"),
                        link: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one link in this #document [OPTIONAL FIELD]"),
                        description: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at lesat one description to this #document [OPTIONAL FIELD]"),
                        note: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one note to this #document [OPTIONAL FIELD]"),
                        tag: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one tag to this #document [OPTIONAL FIELD]"),
                        replace: Joi.array().items(Joi.string().allow('')).min(1).max(1).label("please provide only one superceding document [OPTIONAL FIELD]")
                    }).unknown().required(),
                    project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).min(1).max(1).required().label("please provide the name field in a #project [REQUIRED FIELD]"),
                        read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #project [OPTIONAL FIELD]"),
                        change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #project [OPTIONAL FIELD]"),
                        manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #project [OPTIONAL FIELD]"),
                        description: Joi.array().items(Joi.string()).min(1).label("please provide at least one description to this #project [OPTIONAL FIELD]"),
                        group: Joi.array().items(Joi.string()).max(1).min(1).label("please provide only one group name to this #project [OPTIONAL FIELD]") //????
                    }).unknown().optional(),
                    group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).min(1).max(1).required().label("please provide the name field in a #group [REQUIRED FIELD]"),
                        member: Joi.array().items(Joi.string()).min(1).label("please provide at least one member in this #group [OPTIONAL FIELD]"),
                        read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #group [OPTIONAL FIELD]"),
                        change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #group [OPTIONAL FIELD"),
                        manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to this #group [OPTIONAL FIELD]"),
                        description: Joi.array().items(Joi.string()).min(1).label("please provide at least one description to this #group [OPTIONAL FIELD]")
                    }).unknown().optional()
                }
            )
        })
    }
    
    if(json.attachments.length == 0) {
        fschema = Joi.object({
            id: Joi.number().required(),
            g_id: Joi.string().alphanum().required(),
            sender_name: Joi.string().required(),
            sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
            date: Joi.string().required(),
            cmd: Joi.string().required(),
            attachments: Joi.array(),
            access: Joi.object().keys(
                {
                    document: Joi.object().keys().forbidden().label("you cannot create a #document if there is nothing attached in this email message [FORBIDDEN FIELD]"),
                    project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).min(1).max(1).required().label("please provide the name field in a #project [REQUIRED FIELD]"),
                        read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #project [OPTIONAL FIELD]"),
                        change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #project [OPTIONAL FIELD]"),
                        manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #project [OPTIONAL FIELD]"),
                        description: Joi.array().items(Joi.string()).min(1).label("please provide at least one description to this #project [OPTIONAL FIELD]"),
                        group: Joi.array().items(Joi.string()).max(1).min(1).label("please provide only one group name to this #project [OPTIONAL FIELD]") //????
                    }).unknown().optional(),
                    group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).min(1).max(1).required().label("please provide the name field in a #group [REQUIRED FIELD]"),
                        member: Joi.array().items(Joi.string()).min(1).label("please provide at least one member in this #group [OPTIONAL FIELD]"),
                        read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #group [OPTIONAL FIELD]"),
                        change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #group [OPTIONAL FIELD"),
                        manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to this #group [OPTIONAL FIELD]"),
                        description: Joi.array().items(Joi.string()).min(1).label("please provide at least one description to this #group [OPTIONAL FIELD]")
                    }).unknown().optional()
                }
            )
        })
    }

    validate = fschema.validate(json)

    if(!validate.error) {

        if(json?.access?.group?.name) {
            find_group = db.prepare("SELECT * FROM Groups WHERE Name = ?").all(json.access.group.name[0])
            if(find_group.length >= 1) {
                console.log("error group name already exist")
                return { "error": `the group name already exist please pick another project name that isn't the name "${json.access.group.name[0]}".`} 
            }
        }
        
        console.log("data filtered properly")
        return //if we return nothing then it was all successful
    }
    console.log("joi validation error in save_filter()")
    return { "error": validate.error.details[0].context.label }
}

exports.get_filter = function(db, json) {

    if(typeof json.access.project === 'undefined' && typeof json.access.document === 'undefined' && typeof json.access.group === 'undefined') {
        console.log("none of these exist so we give an error here")
        return {"error": "please specify a #project #document or #group"}
    }
    
const fschema = Joi.object({
    id: Joi.number().required(),
    g_id: Joi.string().alphanum().required(),
    sender_name: Joi.string().required(),
    sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
    date: Joi.string().required(),
    cmd: Joi.string().required(),
    attachments: Joi.array().optional(),
    access: Joi.object().keys(
            {
                document: Joi.object().keys({
                    doc: Joi.array().required().min(1).label("please provide at least one document (ex. DocYear-DocCode) in #document [REQUIRED FIELD]"),
                }).unknown().optional(),
                project: Joi.object().keys({
                    name: Joi.array().items(Joi.string()).min(1).max(1).required().label("please provide only one project (ex. ProjName#Code) in #project [REQUIRED FIELD]"),
                }).unknown().optional(),
                group: Joi.object().keys({
                    name: Joi.array().required().min(1).label("please provide at least one group name in #groups [REQUIRED FIELD]"),
                }).unknown().optional()
            }
        )
    })

    validate = fschema.validate(json)

    if(!validate.error) {
        var get_user = db.prepare("SELECT UserID FROM Users WHERE Name = ?").all(sender_email)
        if(typeof get_user[0] === 'undefined') return { "error": 'we could not find your account on the system' }

        if(json.access?.document?.doc) {
            console.log("check doc perms")

            var f_perm = []
            for (let i = 0; i < json.access.document.doc.length; i++) {
                var parse_doc = json.access.document.doc[i].split("-")

                f_doc = db.prepare("SELECT DocID FROM Documents WHERE DocID = ? AND Year = ?").all(parseInt(parse_doc[1], 10), parse_doc[0])
                if(typeof f_doc[0] === 'undefined') return { "error": `one of the documents you specified does not exist` }  
                f_perm.push(f_doc[0])
            }

            for (let j = 0; j < f_perm.length; j++) {
                var f_perm = db.prepare("SELECT * FROM Perms WHERE DID = ? AND UserEnt = ?").all(f_perm[j].DocID, get_user[0].UserID)
                if(typeof f_perm[0] === 'undefined') return { "error": `you do not have permissions for one of the documents you specified` }  
            }
        }

        if(json.access?.project?.project) {
            console.log("check project perms")

            var f_proj = db.prepare("SELECT ProjID FROM Projects WHERE Name = ?").all(json.access.project.project[0])
            if(typeof f_proj[0] === 'undefined') return { "error": `the project you entered does not exist` }
            var get_perm = db.prepare("SELECT * FROM Perms WHERE PID = ? AND UserEnt = ?").all(f_proj[0].ProjID, get_user[0].UserID)
            if(typeof get_perm[0] === 'undefined') return { "error": `you do not have permission to the project you are trying to access` }
        }

        if(json.access?.group?.name) {
            console.log("check group perms")

            var f_group = db.prepare("SELECT GroupID FROM Groups WHERE Name = ?").all(json.access.group.name[0])
            if(typeof f_group[0] === 'undefined') return { "error": `the group you entered does not exist` }
            var get_perm = db.prepare("SELECT * FROM Perms WHERE GID = ? AND UserEnt = ?").all(f_group[0].GroupID, get_user[0].UserID)
            if(typeof get_perm[0] === 'undefined') return { "error": `you do not have permission to the group you are trying to access` }
        }

        console.log("data filtered properly")
        return //if we return then it was successful
    }
    console.log("joi validation error in get_filter()")
    return { "error": validate.error.details[0].context.label }
}

exports.update_filter = function(db, json) {

    if(typeof json.access.project === 'undefined' && typeof json.access.document === 'undefined' && typeof json.access.group === 'undefined') {
        console.log("none of these exist so we give an error here")
        return {"error": "please specify a #project #document or #group"}
    }

    fschema = Joi.object({
        id: Joi.number().required(),
        g_id: Joi.string().alphanum().required(),
        sender_name: Joi.string().required(),
        sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
        date: Joi.string().required(),
        cmd: Joi.string().required(),
        attachments: Joi.array().optional(),
        access: Joi.object().keys(
            {
                document: Joi.object().keys({ //ALL OPTIONAL (EXCEPT DOC)
                    doc: Joi.array().items(Joi.string()).required().min(1).label("please provide at least one document year and code (ex. DocYear-DocCode) for #document [REQUIRED FIELD]"),
                    project: Joi.array().items(Joi.string()).min(1).max(1).label("please provide only one project (ex. projName#code) for #document [OPTIONAL FIELD]"),
                    read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #document [OPTIONAL FIELD]"),
                    change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #document [OPTIONAL FIELD]"),
                    manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #document [OPTIONAL FIELD]"),
                    name: Joi.array().items(Joi.string().allow('')).min(1).label("please provide SAME number of new docname's in comparision to doc in this #document [OPTIONAL FIELD]"),
                    link: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one link in this #document [OPTIONAL FIELD]"),
                    description: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one description in this #document [OPTIONAL FIELD]"),
                    note: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one note in this #document [OPTIONAL FIELD]"),
                    tag: Joi.array().items(Joi.string().allow('')).min(1).label("please provide at least one tag in this #document [OPTIONAL FIELD]")
                }).unknown().optional(),
                project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                    name: Joi.array().items(Joi.string()).max(2).min(2).required().label("please provide the name of the old project name with it's code then the new project name (ex. OldProjectName#OldProjectCode \\ NewProjectName) in #project [REQUIRED FIELD]"),
                    read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #project [OPTIONAL FIELD]"),
                    change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #project [OPTIONAL FIELD]"),
                    manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #project [OPTIONA FIELD]"),
                    link: Joi.array().items(Joi.string()).min(1).label("please provide at least one link in this #project [OPTIONAL FIELD]"),
                    description: Joi.array().min(1).items(Joi.string()).label("please provide at least one description in this #project [OPTIONAL FIELD]")
                }).unknown().optional(),
                group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                    name: Joi.array().items(Joi.string()).max(2).min(2).required().label("please provide the name of the old group name then the new document name (ex. OldGroupName \\ NewGroupName) in #group [REQUIRED FIELD]"),
                    member: Joi.array().items(Joi.string()).min(1).label("please provide at least one member in this #group [OPTIONAL FIELD]"),
                    read: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to read this #group [OPTIONAL FIELD]"),
                    change: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to change this #group [OPTIONAL FIELD]"),
                    manage: Joi.array().items(Joi.string()).min(1).label("please provide at least one person to manage this #group [OPTIONAL FIELD]"),
                    description: Joi.array().items(Joi.string()).min(1).label("please provide at least one description in this #group [OPTIONAL FIELD]")
                }).unknown().optional()
            }
        )
    })

    validate = fschema.validate(json)

    if(!validate.error) {

        var get_user = db.prepare("SELECT UserID FROM Users WHERE Name = ?").all(sender_email)
        if(typeof get_user[0] === 'undefined') return { "error": 'we could not find your account on the system' }

        if(json.access?.document?.doc) {
            console.log("check doc perms")

            var f_perm = []
            for (let i = 0; i < json.access.document.doc.length; i++) {
                var parse_doc = json.access.document.doc[i].split("-")

                f_doc = db.prepare("SELECT DocID FROM Documents WHERE DocID = ? AND Year = ?").all(parseInt(parse_doc[1], 10), parse_doc[0])
                if(typeof f_doc[0] === 'undefined') return { "error": `one of the documents you specified does not exist` }  
                f_perm.push(f_doc[0])
            }

            for (let j = 0; j < f_perm.length; j++) {
                var f_perm = db.prepare("SELECT Permissions FROM Perms WHERE DID = ? AND UserEnt = ?").all(f_perm[j].DocID, get_user[0].UserID)
                if(typeof f_perm[0] === 'undefined') return { "error": `you do not have permissions for one of the documents you specified` }
                if(f_perm[0].Permissions == 1) return { "error": `you do not have enough permissions to update a document or more please contact the owner to request access` }
            }
            //still need to check if permission level is 4 OR 2
        }

        if(json.access?.project?.name) {
            console.log("check project perms")

            var parse_proj = json.access.project.name[0].split("#")
            console.log("test", parse_proj)
            var f_proj = db.prepare("SELECT ProjID FROM Projects WHERE Name = ? AND ProjectCode = ?").all(parse_proj[0], parseInt(parse_proj[1], 10))
            if(typeof f_proj[0] === 'undefined') return { "error": `invalid project name or invalid project code was entered please check and try again` }
            var get_perm = db.prepare("SELECT Permissions FROM Perms WHERE PID = ? AND UserEnt = ?").all(f_proj[0].ProjID, get_user[0].UserID)
            if(typeof get_perm[0] === 'undefined') return { "error": `you do not have permission to the project you are trying to access` }

            //still need to check if permission level is 4 OR 2 OR ELSE WE WONT ALLOW THEM TO CHANGE IT!
            if(get_perm[0].Permissions == 1) {
                return { "error": `you do not have enough permissions to update this project please contact the owner to request access` }  
            }
        }

        if(json.access?.group?.name) {
            console.log("check group perms")

            var f_group = db.prepare("SELECT GroupID FROM Groups WHERE Name = ?").all(json.access.group.name[0])
            if(typeof f_group[0] === 'undefined') return { "error": `invalid group name was entered please check and try again` }
            var get_perm = db.prepare("SELECT Permissions FROM Perms WHERE GID = ? AND UserEnt = ?").all(f_group[0].GroupID, get_user[0].UserID)
            if(typeof get_perm[0] === 'undefined') return { "error": `you do not have permission to the group you are trying to access` }

            //still need to check if permission level is 4 OR 2
            if(get_perm[0].Permissions == 1) {
                return { "error": `you do not have enough permissions to update this group please contact the owner to request access` }  
            }
        }
        
        console.log("data filtered properly")
        return //if we return nothing then it was all successful
    }
    console.log("joi validation error in save_filter()")
    return { "error": validate.error.details[0].context.label }
}

