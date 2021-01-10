import Vue from "vue"
import vuex from "vuex"
import axios from "axios"

Vue.use(vuex, axios)

export default new vuex.Store({
    state: { //used for holding info
        gmail: [],
        loadedDocuments: []
    },
    getters: { //used for calling a small function  (I don't think we'll need this)
    },
    actions: { //used to preform operations (calls mutations)
        load_gmail({ commit }) {
            axios.get("/api/").then(res => {
            console.log(res.data)
              commit("SET_GMAIL", res.data);
            })
        },
        load_documents({commit}) {
            axios.get("/api/").then(res => {
            console.log(res.data)
              commit("SET_DOCUMENTS", res.data);
            })
        }
    },
    mutations: { //used to update info (updates state given)
        SET_GMAIL(state, payload) {
            state.gmail = payload
        },
        SET_DOCUMENTS(state, payload) {
            state.loadedDocuments = payload
        }
    }
});
