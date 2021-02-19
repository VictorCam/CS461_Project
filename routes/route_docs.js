const express = require("express")
const router = express.Router()
const cors = require("cors")
const Database = require('better-sqlite3')
const db = new Database('./database/beavdms.db')
require('dotenv').config()
const Joi = require('joi')

router.get("/api", (req, res) => {
    // const q_query = "SELECT * FROM DOCUMENTS LIMIT ? OFFSET ?";
    const q_query = "SELECT Documents.DocID, Documents.DateAdded, Documents.Name AS DocName, Projects.Name AS ProjName FROM Documents LEFT JOIN Projects ON Project = ProjID LIMIT ? OFFSET ?"
    const q_count = "SELECT count(*) FROM Documents"

    // Update count when making queries, to avoid offset issues
    // LEFT JOIN does not affect the count

    const schema = Joi.number().integer().required()
    const page = schema.validate(req.query.page)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }

    var query_data = []

    const paginated = paginatedResults(q_query, q_count, query_data, page.value, 10, req);
    res.status(200).json(paginated);
});

// Get the author of the document
router.get("/api/doc/:doc", (req, res) => {
    const docID = req.params.doc;
    const authorQuery = "SELECT Users.Name AS Owner FROM Users WHERE Users.UserID = docID";
    const results = db.prepare(authorQuery);
    res.status(200).json(results);
});

router.get("/api/search/:search", (req, res) => {
    // Trying to search by Documents.Name or Projects.Name, later include User.Name
    const q_query = "SELECT Documents.DocID, Documents.DateAdded, Documents.Name AS DocName, Projects.Name AS ProjName" +
     "FROM Documents LEFT JOIN Projects ON Project = ProjID WHERE (DocName LIKE ? OR ProjName LIKE ?) LIMIT ? OFFSET ?"; 
    const q_count = "SELECT count(*) FROM Documents LEFT JOIN Projects ON Project = ProjID WHERE (Documents.Name LIKE ? OR Projects.Name LIKE ?)";

 

    //data validation
    const schema1 = Joi.number().integer().required()
    const schema2 = Joi.string().alphanum().max(50).required()
    const page = schema1.validate(toInteger(req.query.page))
    const search = schema2.validate(req.params.search)
    if(page.error) { return res.status(422).json(page.error.details[0].message) }
    if(search.error) { return res.status(422).json(search.error.details[0].message) }

    //execute first '?' in q_query and q_count (ORDER THEM ACCORDING TO SQL)
    var query_data = [`%${req.params.search}%`]

    const paginated = paginatedResults(q_query, q_count, query_data, page.value, 10, req)

    res.status(200).json(paginated)
});

function paginatedResults(q_query, q_count, query_data, page, limit, req) {
        //get start and end index
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        //query
        var query = db.prepare(q_query)
        var count = db.prepare(q_count)

        //get data
        var data = query.all([...query_data, limit, startIndex])

        //get count
        var count = count.all([...query_data])
        count = Object.values(count[0])[0]

        const results = {}

        //show next/previous/max
        if(endIndex < count) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        results.max = {
            max: Math.ceil(count/limit),
            show: 5,
            page: page,
            limit: limit,
            offset: Math.ceil(count/limit) - 5
        }

        results.results = data
        return results
}

router.use(cors());

module.exports = router;
