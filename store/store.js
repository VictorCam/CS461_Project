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
        ownerOfViewedDocument: null,
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
            axios.get(`${prefix}api/search/${payload}?page=1`)
            .then(res => {
                commit("SET_DOCUMENTS", res.data.results)
                commit("SET_PAGINATION", res.data.max)
                console.log(res.data.max)
            })
        },
        find_owner_of_document({commit}, payload) {
            console.log(payload);
            axios.get(`${prefix}api/doc/${payload}`)
            .then(res => {
                console.log(res.data);
                commit("SET_OWNER_OF_VIEWED_DOCUMENT", res.data);
            });
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
        SET_OWNER_OF_VIEWED_DOCUMENT(state, payload) {
            state.ownerOfViewedDocument = payload;
        }
    }
});
