const Joi = require('joi')

exports.save_filter = function(db, json) {
    const schema = Joi.object({
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
                    project: Joi.array().items(Joi.string()).min(1),
                    read: Joi.array().items(Joi.string()),
                    change: Joi.array().items(Joi.string()),
                    manage: Joi.array().items(Joi.string()),
                    name: Joi.array().items(Joi.string().allow('')),
                    link: Joi.array().items(Joi.string().allow('')),
                    description: Joi.array().items(Joi.string().allow('')),
                    note: Joi.array().items(Joi.string().allow('')),
                    tag: Joi.array().items(Joi.string().allow('')),
                    replace: Joi.array().items(Joi.string().allow(''))
                }).unknown(),
                project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                    name: Joi.array().items(Joi.string()).min(1).required(),
                    read: Joi.array().items(Joi.string()),
                    change: Joi.array().items(Joi.string()),
                    manage: Joi.array().items(Joi.string()),
                    description: Joi.array().items(Joi.string()),
                    group: Joi.array().items(Joi.string()).min(1)
                }).unknown(),
                group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                    name: Joi.array().items(Joi.string()).min(1).required(),
                    member: Joi.array().items(Joi.string()),
                    read: Joi.array().items(Joi.string()),
                    change: Joi.array().items(Joi.string()),
                    manage: Joi.array().items(Joi.string()),
                    description: Joi.array().items(Joi.string())
                }).unknown()
            },
        )
    })

    validate = schema.validate(json)

    if(!validate.error) {
        console.log("JSON SUCCESS -> now check tables")
        find_proj = db.prepare("SELECT * FROM Projects WHERE Name = ?")
        proj_query = find_proj.all(json.access.project.name[0])
        if(proj_query.length == 1) { return { "error": `the project name already exist please pick another project name that isn't the name "${json.access.project.name[0]}".`} }
        return //if we return nothing then it was all succesful
    }
    console.log(validate.error.details[0].message)
    return { "error": validate.error.details[0].message }
}

exports.update_filter = function(db, json) {
    // test = db.prepare("SELECT * FROM ")
    //error message when user does not have enough permissions
    //if project exists and but does not have permission to add a doc?
}