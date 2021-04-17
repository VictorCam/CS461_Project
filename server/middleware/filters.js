const Joi = require('joi')

exports.save_filter = function(db, json) {
    // ee = db.prepare("SELECT * FROM Users")
    // testres = ee.all()
    // console.log(json.access.document.project)

    //check if the permission we are saving is a duplicate

    var doc_count = 0;

    //don't worry about pluralized tags //THIS IS FOR SAVE
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
                project: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME) //removed project link
                    name: Joi.array().items(Joi.string()).min(1).required(),
                    read: Joi.array().items(Joi.string()),
                    change: Joi.array().items(Joi.string()),
                    manage: Joi.array().items(Joi.string()),
                    description: Joi.array().items(Joi.string()),
                    group: Joi.array().items(Joi.string()).min(1),
                }).unknown(),
                group: Joi.object().keys({ //ALL OPTIONAL (EXCEPT NAME)
                    name: Joi.array().items(Joi.string()).min(1).required(),
                    member: Joi.array().items(Joi.string()),
                    read: Joi.array().items(Joi.string()),
                    change: Joi.array().items(Joi.string()),
                    manage: Joi.array().items(Joi.string()),
                    description: Joi.array().items(Joi.string()),

                }).unknown()
            },
        )
    })


    valid = schema.validate(json)

    if(valid.error) {
        console.log(valid.error.details)
        //send email message with error prompt
    }
    else {
        console.log("WE SUCCEDDED :)")
        console.log(valid)
    }



    //if project name does not exist create a temporary one
    // test = db.prepare("SELECT * FROM Projects WHERE Projects.Name = ?")

    //if project exists and but does not have permission to add a doc?

    //error message when project already has the name


    //error message of project name does not exist
}

exports.update_filter = function(db, json) {
    // test = db.prepare("SELECT * FROM ")
    //error message when user does not have enough permissions
}