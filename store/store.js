import Vue from "vue"
import vuex from "vuex"
import axios from "axios"

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('./database/beavdms.db');
// var routeDataDocs = [];



Vue.use(vuex, axios)
var currentDate = new Date();

export default new vuex.Store({
    state: { //used for holding info
        gmail: [],
        loadedDocuments: [
            {
                DocID: 1,
                Name: "BeavProject1",
                Description: "The first beav project",
                Location: "Corvallis",
                OwnerID: 1,
                Project: "OSUStudentFileSystem",
                DateAdded: currentDate
            },
            {
                DocID: 2,
                Name: "BeavProject2",
                Description: "The second beav project",
                Location: "Bend",
                OwnerID: 1,
                Project: "OSUStudentFileSystem",
                DateAdded: currentDate
            },
            {
                DocID: 3,
                Name: "BeavProject3",
                Description: "The third beav project",
                Location: "Portland",
                OwnerID: 1,
                Project: "OSUStudentFileSystem",
                DateAdded: currentDate
            }
        ]
    },
    getters: { //used for calling a small function  (I don't think we'll need this)
    },
    actions: { //used to preform operations (calls mutations)
        load_gmail({ commit }) {
            axios.get("http://localhost:13377/").then(res => {
            console.log(res.data)
              commit("SET_GMAIL", res.data);
            })
        }
    },
    mutations: { //used to update info (updates state given)
        SET_GMAIL(state, payload) {
            state.gmail = payload
        },
        SET_PIZZA(state, payload) {
            state.data = payload
        }
    }
});

// db.get("SELECT * FROM Documents", function(err, dox) {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     routeDataDocs.push(dox);
//     console.log("RDD: " + routeDataDocs);
// });