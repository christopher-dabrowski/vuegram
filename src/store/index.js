import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase'
import router from '../router/index'
import {
  SET_USER_PROFILE,
  FETCH_USER_PROFILE
} from './operations'

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
    async logout({ commit }) {
      await fb.auth.signOut()

      commit(SET_USER_PROFILE, {})
      router.push('/login')
    },
    async signup({ dispatch }, { email, password, name, title }) {
      const { user } = await fb.auth.createUserWithEmailAndPassword(email, password)

      await fb.usersCollection.doc(user.uid).set({
        name,
        title
      })

      dispatch(FETCH_USER_PROFILE, user)
    },
    async fetchUserProfile({ commit }, user) {
      // fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      commit(SET_USER_PROFILE, userProfile.data())
      if (router.currentRoute.path === '/login') {
        router.push('/')
      }
    },

    async createPost({ state, commit }, { content }) {
      await fb.postsCollection.add({
        createdOn: new Date(),
        content: content,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name,
        coments: 0,
        likes: 0
      });
    }
  },
  modules: {
  }
})
