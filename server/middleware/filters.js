// Validate JSON objects & check permissions

const Joi = require('joi')

exports.save_filter = function(db, json) {

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
                        project: Joi.array().items(Joi.string()).max(1),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        name: Joi.array().min(json.attachments.length).items(Joi.string().allow('')),
                        link: Joi.array().items(Joi.string().allow('')),
                        description: Joi.array().items(Joi.string().allow('')),
                        note: Joi.array().items(Joi.string().allow('')),
                        tag: Joi.array().items(Joi.string().allow('')),
                        replace: Joi.array().items(Joi.string().allow(''))
                    }).unknown().required(),
                    project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).max(1).required(),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        description: Joi.array().items(Joi.string()),
                        group: Joi.array().items(Joi.string()).max(1)
                    }).unknown().optional(),
                    group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).max(1).required(),
                        member: Joi.array().items(Joi.string()),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        description: Joi.array().items(Joi.string())
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
                    document: Joi.object().keys().forbidden(),
                    project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).max(1).required(),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        description: Joi.array().items(Joi.string()),
                        group: Joi.array().items(Joi.string()).max(1)
                    }).unknown().optional(),
                    group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                        name: Joi.array().items(Joi.string()).max(1).required(),
                        member: Joi.array().items(Joi.string()),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        description: Joi.array().items(Joi.string())
                    }).unknown().optional()
                }
            )
        })
    }

    validate = fschema.validate(json)

    //check perms when there are duplicates
    if(!validate.error) {

        if(json?.access?.document?.name) {
            find_doc = db.prepare("SELECT * FROM Documents WHERE Name = ?").all(json.access.document.name[0])
            if(find_doc.length >= 1) {
                console.log("error document name already exist")
                return { "error": "document name already exist" }
            }
        }

        if(json?.access?.project?.name) {
            find_proj = db.prepare("SELECT * FROM Projects WHERE Name = ?").all(json.access.project.name[0])
            if(find_proj.length >= 1) {
                console.log("error project name already exist")
                return { "error": `the project name already exist please pick another project name that isn't the name "${json.access.project.name[0]}".`} 
            }
        }

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
    return { "error": validate.error.details[0].message }
}

exports.get_filter = function(db, json) {
    
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
                    doc: Joi.array().required(),
                }).unknown().optional(),
                project: Joi.object().keys({
                    project: Joi.array().items(Joi.string()).max(1).required(),
                }).unknown().optional(),
                group: Joi.object().keys({
                    name: Joi.array().required(),
                }).unknown().optional()
            }
        )
    })

    validate = fschema.validate(json)

    if(!validate.error) {
        
        if(json.access?.document?.doc) {
            console.log("check doc perms")
            
        }

        if(json.access?.project?.project) {
            console.log("check project perms")
        }

        if(json.access?.group?.name) {
            console.log("check group perms")
        }

        console.log("data filtered properly")
        return
    }
    console.log("joi validation error in get_filter()")
    return { "error": validate.error.details[0].message }
    // console.log("joi validation error in get_filter()")
    // return { "error": validate.error.details[0].message }
}

