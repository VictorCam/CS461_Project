import Vue from "vue"
import vuex from "vuex"
import axios from "axios"

Vue.use(vuex, axios)

export default new vuex.Store({
    state: { //used for holding info
        temp: ["dummy data", "more data"],
        temp2: ["tempdata2"],
        data: []
    },
    getters: { //used for calling a small function 

    },
    actions: { //used to preform operations (calls mutations)
        
    },
    mutations: { //used to update info (updates state given)
        SET_GMAIL(state, payload) {
            //console.log(typeof payload)
            state.gmail = payload
        }
    }
})