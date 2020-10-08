import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase'
import router from '../router/index'
import {
  SET_USER_PROFILE,
  FETCH_USER_PROFILE,
  SET_POSTS
} from './operations'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    userProfile: {},
    posts: []
  },
  mutations: {
    setUserProfile(state, value) {
      state.userProfile = value
    },

    setPosts(state, value) {
      state.posts = value
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

    async updateUserProfile({ commit }, { name, title }) {
      const user = fb.auth.currentUser
      const ref = fb.usersCollection.doc(user.uid)
      await ref.set({
        name,
        title
      })

      commit(SET_USER_PROFILE, (await ref.get()).data())

      // update all posts by user
      const postDocs = await fb.postsCollection.where('userId', '==', user.uid).get()
      postDocs.forEach(doc => {
        fb.postsCollection.doc(doc.id).update({
          userName: name
        })
      })

      // update all comments by user
      const commentDocs = await fb.commentsCollection.where('userId', '==', user.uid).get()
      commentDocs.forEach(doc => {
        fb.commentsCollection.doc(doc.id).update({
          userName: name
        })
      })
    },

    async createPost({ state }, { content }) {
      await fb.postsCollection.add({
        createdOn: new Date(),
        content: content,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name,
        comments: 0,
        likes: 0
      });
    },

    async likePost(_, { postId }) {
      const userId = fb.auth.currentUser.uid

      const exisingLike = await fb.likesCollection
        .where("postId", "==", postId)
        .where("userId", "==", userId)
        .get()

      if (!exisingLike.empty)
        return; // User can like post only once

      await fb.likesCollection.add({
        postId,
        userId
      })

      await fb.postsCollection.doc(postId).update({
        likes: fb.firebase.firestore.FieldValue.increment(1)
      })
    }
  },
  modules: {
  }
})

fb.postsCollection.orderBy('createdOn', 'desc').onSnapshot(snapshot => {
  const posts = [];

  snapshot.forEach(doc => {
    const post = doc.data();
    post.id = doc.id;

    posts.push(post);
  });

  store.commit(SET_POSTS, posts);
});

export default store;