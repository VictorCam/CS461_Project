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

    var find_doc = db.prepare("SELECT Documents.DocID, Documents.Year, Documents.Serial, Documents.Name as Dname, Documents.DateAdded, Documents.Description, Projects.ProjID, Projects.Name as Pname FROM Documents LEFT JOIN Projects ON Documents.Project = Projects.ProjID LIMIT ? OFFSET ?")
    var get_count = db.prepare("SELECT count(*) FROM Documents LEFT JOIN Projects ON Documents.Project = Projects.ProjID")

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
    const userDoc = `SELECT Documents.Name AS Dname, Documents.Serial, Documents.DocID, Documents.DateAdded, Documents.Year, 
    Documents.Serial, Documents.Description, Users.Name AS Owner FROM Documents INNER JOIN Users ON UserID=OwnerID WHERE DocID=${docID}`;

    const docLinks = `SELECT DocLinks.Link FROM DocLinks WHERE ${docID} = DocLinks.DID`;
    const notes = `SELECT Notes.Note FROM Notes WHERE ${docID} = Notes.DID`;

    const userDocRes = db.prepare(userDoc);
    const docLinksRes = db.prepare(docLinks);
    const notesRes = db.prepare(notes);

    const docResults = {
        'userDoc': userDocRes.all(),
        'docLinks': docLinksRes.all(),
        'notes': notesRes.all()
    };
    // console.log(docResults);
    res.status(200).json(docResults);
});

// Get the document the user is currently viewing
router.get("/api/project/:projID", (req, res) => {
    const projID = req.params.projID;
    const proj = `SELECT Projects.Name AS Pname, Projects.ProjectCode AS Pcode, Projects.Description FROM Projects WHERE Projects.ProjID = ${projID}`;
    const projDocs = `SELECT Documents.Name AS Dname FROM Documents WHERE Documents.Project = ${projID}`
    const projLinks = `SELECT ProjLinks.Link FROM ProjLinks WHERE ${projID} = ProjLinks.PID`

    const projRes = db.prepare(proj);
    const projDocsRes = db.prepare(projDocs);
    const projLinksRes = db.prepare(projLinks);
    
    const projResults = {
        'proj': projRes.all(),
        'projDocs': projDocsRes.all(),
        'projLinks': projLinksRes.all()
    }

    // console.log(projResults);
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

    var find_doc = db.prepare("SELECT DISTINCT D.DocID, D.Year, D.Serial, D.Name as Dname, D.DateAdded, D.Description, P.ProjID, P.Name as Pname FROM Documents D LEFT JOIN Projects P ON D.Project = P.ProjID LEFT JOIN tagsXdocs txd ON txd.DID=D.DocID LEFT JOIN Tags T ON T.TagID=txd.TID WHERE Dname LIKE ? OR Pname LIKE ? OR T.Name LIKE ? LIMIT ? OFFSET ?")
    var get_count = db.prepare("SELECT DISTINCT count(*) FROM Documents D LEFT JOIN Projects P ON D.Project=P.ProjID LEFT JOIN tagsXdocs txd ON txd.DID=D.DocID LEFT JOIN Tags T ON T.TagID=txd.TID WHERE D.Name LIKE ? OR P.Name LIKE ? OR T.Name LIKE ?")

    var s_req = req.query.search; //keyword we are looking for
    var cnt = 10 //shows 10 json items from db
    var page_cnt = parseInt(req.query.page) //displays the page count
    var offset = (page_cnt-1)*cnt //finds the index we should be looking at for each page

    var model = find_doc.all(`%${s_req}%`, `%${s_req}%`, `%${s_req}%`, cnt, offset)
    var count = get_count.all(`%${s_req}%`, `%${s_req}%`, `%${s_req}%`)

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
