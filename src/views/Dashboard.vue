<template>
  <div id="dashboard">
    <transition name="fade">
      <CommentModal
        v-if="showCommentModal"
        :post="selectedPost"
        @close="toggleCommentModal(null)"
      />
    </transition>

    <section>
      <div class="col1">
        <div class="profile">
          <h5>{{ userProfile.name }}</h5>
          <p>{{ userProfile.title }}</p>
          <div class="create-post">
            <p>create a post</p>
            <form @submit.prevent>
              <textarea v-model.trim="post.content"></textarea>
              <button
                @click="createPost"
                :disabled="!post.content"
                class="button"
              >
                post
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="col2">
        <div v-if="posts.length">
          <div v-for="post in posts" :key="post.id" class="post">
            <h5>{{ post.userName }}</h5>
            <span>{{ post.createdOn | formatDate }}</span>
            <p>{{ post.content | trimLength }}</p>
            <ul>
              <li>
                <a @click="toggleCommentModal(post)"
                  >comments {{ post.comments }}</a
                >
              </li>
              <li>
                <a @click="likePost(post.id)">likes {{ post.likes }}</a>
              </li>
              <li><a>view full post</a></li>
            </ul>
          </div>
        </div>
        <div v-else>
          <p class="no-results">There are currently no posts</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { CREATE_POST, LIKE_POST } from "../store/operations";
import moment from "moment";

import CommentModal from "@/components/CommentModal";

export default {
  components: {
    CommentModal,
  },
  data() {
    return {
      post: {
        content: "",
      },
      showCommentModal: false,
      selectedPost: null,
    };
  },
  computed: {
    ...mapState(["userProfile", "posts"]),
  },
  methods: {
    createPost() {
      this.$store.dispatch(CREATE_POST, this.post);
      this.post.content = "";
    },

    likePost(postId) {
      this.$store.dispatch(LIKE_POST, { postId });
    },

    toggleCommentModal(post) {
      this.showCommentModal = !this.showCommentModal;
      this.selectedPost = post;
    },
  },
  filters: {
    formatDate(val) {
      if (!val) {
        return "-";
      }

      let date = val.toDate();
      return moment(date).fromNow();
    },

    trimLength(val) {
      if (val.length < 203) {
        return val;
      }
      return `${val.substring(0, 200)}...`;
    },
  },
};
</script>

<style lang="scss" scoped></style>
