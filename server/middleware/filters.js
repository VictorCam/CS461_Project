const Joi = require('joi')

exports.save_filter = function(db, json) {

    const fschema = Joi.alternatives().conditional(Joi.object({ attachments: Joi.array().min(1) }).unknown(), {
        then: Joi.object({
            id: Joi.number().required(),
            g_id: Joi.string().alphanum().required(),
            sender_name: Joi.string().required(),
            sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
            date: Joi.string().required(),
            cmd: Joi.string().required(),
            attachments: Joi.array().min(1),
            access: Joi.object().keys(
                {
                    document: Joi.object().keys({ //ALL OPTIONAL
                        project: Joi.array().items(Joi.string()).max(1),
                        read: Joi.array().items(Joi.string()),
                        change: Joi.array().items(Joi.string()),
                        manage: Joi.array().items(Joi.string()),
                        name: Joi.array().items(Joi.string().allow('')),
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
        }),
        otherwise: Joi.object({
            id: Joi.number().required(),
            g_id: Joi.string().alphanum().required(),
            sender_name: Joi.string().required(),
            sender_email: Joi.string().email({ tlds: { allow: false } }).required(),
            date: Joi.string().required(),
            cmd: Joi.string().required(),
            attachments: Joi.array().optional(),
            access: Joi.object().keys(
                {
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
    });

    validate = fschema.validate(json)

    if(!validate.error) {
        console.log("JSON SUCCESS -> now check tables")
        find_proj = db.prepare("SELECT * FROM Projects WHERE Name = ?")
        proj_query = find_proj.all(json.access.project.name[0])
        if(proj_query.length == 1) { return { "error": `the project name already exist please pick another project name that isn't the name "${json.access.project.name[0]}".`} }
        return //if we return nothing then it was all succesful
    }
    // console.log(validate.error.details[0].message)
    return { "error": validate.error.details[0].message }
}

exports.update_filter = function(db, json) {
}