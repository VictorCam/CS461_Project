const express = require("express")
const router = express.Router()
const cors = require("cors")
const Database = require('better-sqlite3')
const db = new Database('./server/database/beavdms.db')
require('dotenv').config()
const Joi = require('joi')

router.get("/api", (req, res) => {
    const schema = Joi.number().integer().required()
    const page = schema.validate(req.query.page)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }

    var find_doc = db.prepare("SELECT Documents.DocID, Documents.Year, Documents.Serial, Documents.Name as Dname, Documents.DateAdded, Documents.Description, Projects.ProjID, Projects.Name as Pname FROM Documents, Projects WHERE Documents.Project = Projects.ProjID LIMIT ? OFFSET ?")
    var get_count = db.prepare("SELECT count(*) FROM Documents, Projects WHERE Documents.Project = Projects.ProjID")

    var cnt = 10 //shows 10 json items from db
    var page_cnt = parseInt(req.query.page) //displays the page count
    var offset = (page_cnt-1)*cnt //finds the index we should be looking at for each page

    var model = find_doc.all(cnt, offset)
    var count = get_count.all()

    var pag = paginatedResults(model, count, page_cnt, cnt)

    res.status(200).json(pag);
});

// Get the document the user is currently viewing
router.get("/api/doc/:docID", (req, res) => {
    const docID = req.params.docID;
    const query = `SELECT Users.Name as Owner, Documents.Name as Dname, Documents.DocID, Documents.DateAdded, Documents.Year, Documents.Serial FROM Users INNER JOIN Documents ON Documents.DocID = ${docID}`;
    const results = db.prepare(query);
    const docResults = results.all();
    res.status(200).json(docResults);
});

// Get the document the user is currently viewing
router.get("/api/project/:projID", (req, res) => {
    const projID = req.params.projID;
    const query = `SELECT Projects.Name as Pname from Projects WHERE Projects.ProjID = ${projID}`;
    const results = db.prepare(query);
    const projResults = results.all();
    res.status(200).json(projResults);
});


router.get("/api/search/", (req, res) => {
    //data validation
    const schema1 = Joi.number().integer().min(1).required()
    const schema2 = Joi.string().alphanum().min(1).max(50).required()
    const page = schema1.validate(req.query.page)
    const search = schema2.validate(req.query.search)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }
    if(search.error) { return res.status(422).json(search.error.details[0].message) }

    var find_doc = db.prepare("SELECT Documents.DocID, Documents.Year, Documents.Serial, Documents.Name as Dname, Documents.DateAdded, Documents.Name, Projects.ProjID, Projects.Name as Pname FROM Documents, Projects WHERE Documents.Project = Projects.ProjID AND (Documents.Name LIKE ? OR Projects.Name LIKE ?) LIMIT ? OFFSET ?")
    var get_count = db.prepare("SELECT count(*) FROM Documents, Projects WHERE Documents.Project = Projects.ProjID AND (Documents.Name LIKE ? OR Projects.Name LIKE ?)")

    var s_req = req.query.search; //keyword we are looking for
    var cnt = 10 //shows 10 json items from db
    var page_cnt = parseInt(req.query.page) //displays the page count
    var offset = (page_cnt-1)*cnt //finds the index we should be looking at for each page

    var model = find_doc.all(`%${s_req}%`, `%${s_req}%`, cnt, offset)
    var count = get_count.all(`%${s_req}%`, `%${s_req}%`)

    var pag = paginatedResults(model, count, page_cnt, cnt)

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
