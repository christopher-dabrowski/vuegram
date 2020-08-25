import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase'
import router from '../router/index'
import { SET_USER_PROFILE, FETCH_USER_PROFILE } from './operations'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userProfile: {}
  },
  mutations: {
    setUserProfile(state, value) {
      state.userProfile = value
    }
  },
  actions: {
    async login({ dispatch }, { email, password }) {
      // sing user in
      const { user } = await fb.auth.signInWithEmailAndPassword(email, password)

      // fetch user profile and set it in state
      dispatch(FETCH_USER_PROFILE, user)
    },
    async FETCH_USER_PROFILE({ commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      commit(SET_USER_PROFILE, userProfile.data())
      router.push('/')
    }
  },
  modules: {
  }
})
