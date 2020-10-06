<template>
  <div id="dashboard">
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
        <div>
          <p class="no-results">There are currently no posts</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { CREATE_POST } from "../store/operations";

export default {
  data() {
    return {
      post: {
        content: "",
      },
    };
  },
  computed: {
    ...mapState(["userProfile"]),
  },
  methods: {
    createPost() {
      this.$store.dispatch(CREATE_POST, this.post);
      this.post.content = "";
    },
  },
};
</script>

<style lang="scss" scoped></style>
