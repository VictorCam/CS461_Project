import Vue from "vue"
import vuex from "vuex"
import axios from "axios"
require('dotenv').config()

Vue.use(vuex, axios)

const prefix = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:13377/';

export default new vuex.Store({
    state: { //used for holding info (state)
        gmail: [],
        loadedDocuments: [],
        max: [],
        currentDoc: null, // Reprents the doc we are viewing if on the DocumentDetail page
        currentProject: null, // Represents the project we are viewing in on the ProjectDetail page
    },
    getters: { //used for calling a small function
    },
    actions: { //call our backend and update state with commit
        load_gmail({ commit }) {
            axios.get(`${prefix}api/`)
            .then(res => {
                commit("SET_GMAIL", res.data);
            })
        },
        load_documents({commit}, page) {
            axios.get(`${prefix}api/?page=${page}`)
            .then(res => {
                console.log(res.data)
                commit("SET_DOCUMENTS", res.data.results)
                commit("SET_PAGINATION", res.data.max)
            })
        },
        search_documents({commit}, payload) {
            axios.get(`${prefix}api/search/?page=${payload[1]}&search=${payload[0]}`)
            .then(res => {
                commit("SET_DOCUMENTS", res.data.results)
                commit("SET_PAGINATION", res.data.max)
            })
        },
        set_current_doc({commit}, payload) {
            axios.get(`${prefix}api/doc/${payload.docID}`)
            .then(res => {
                console.log(res.data);
                commit("SET_CURRENT_DOC", res.data);
            })
        },
        set_current_project({commit}, payload) {
            axios.get(`${prefix}api/project/${payload.projID}`)
            .then(res => {
                console.log(res.data);
                commit("SET_CURRENT_PROJECT", res.data);
            })
        }
    },
    mutations: { //used to update info (updates state)
        SET_GMAIL(state, payload) {
            state.gmail = payload;
        },
        SET_DOCUMENTS(state, payload) {
            state.loadedDocuments = payload;
        },
        SET_PAGINATION(state, payload) {
            state.max = payload;
        },
        SET_CURRENT_DOC(state, payload) {
            state.currentDoc = payload;
        },
        SET_CURRENT_PROJECT(state, payload) {
            state.currentProject = payload;
        }
    }
});
