const express = require("express")
const router = express.Router()
const cors = require("cors")
const Database = require('better-sqlite3')
const db = new Database('./database/beavdms.db')
require('dotenv').config()
const Joi = require('joi')

router.get("/api", (req, res) => {
    const schema = Joi.number().integer().required()
    const page = schema.validate(req.query.page)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }

    var find_doc = db.prepare("SELECT Documents.DocID, Documents.Name as Dname, Documents.DateAdded, Documents.Name, Projects.Name FROM Documents, Projects WHERE Documents.Project = Projects.ProjID AND DocID > ? LIMIT ?")
    var get_count = db.prepare("SELECT count(*) FROM Documents, Projects WHERE Documents.Project = Projects.ProjID")

    var cnt = 5 //shows 5 json items from db
    var page_cnt = parseInt(req.query.page) //displays the page count
    var offset = (page_cnt-1)*cnt //finds the index we should be looking at for each page

    var model = find_doc.all(offset, cnt)
    var count = get_count.all()

    var pag = paginatedResults(model, count, page_cnt, cnt)

    res.status(200).json(pag);
});

// Get the author of the document
router.get("/api/doc/:doc", (req, res) => {
    const docID = req.params.doc;
    const authorQuery = "SELECT Users.Name AS Owner FROM Users WHERE Users.UserID = docID";
    const results = db.prepare(authorQuery);
    res.status(200).json(results);
});


router.get("/api/search/:search", (req, res) => {
    //data validation
    const schema1 = Joi.number().integer().required()
    const schema2 = Joi.string().alphanum().min(1).max(50).required()
    const page = schema1.validate(req.query.page)
    const search = schema2.validate(req.params.search)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }
    if(search.error) { return res.status(422).json(search.error.details[0].message) }

    res.status(200).json(pag)
});

function paginatedResults(model, count, page, limit) {
    //get start and end index
    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    var count = Object.values(count[0])[0]
    var results = {}
    

    results.max = {
        page: Math.ceil(count/limit)
    }
    if(endIndex < count) {
        results.next = {
            page: page + 1
        }
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1
        }
    }

    results.results = model
    
    return results
}

router.use(cors());

module.exports = router;
