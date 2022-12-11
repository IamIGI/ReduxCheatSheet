import { createSlice, nanoid, createAsyncThunk, createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { sub } from 'date-fns';
import axios from 'axios';

const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';

const postsAdapter = createEntityAdapter({
    sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postsAdapter.getInitialState({
    status: 'idle', //'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    count: 0,
});
//first arg it's seem that od not have to bother about
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await axios.get(POSTS_URL);
    return response.data;
});

export const addNewPost = createAsyncThunk('posts/addNewPost', async (initialPost) => {
    const response = await axios.post(POSTS_URL, initialPost);
    return response.data;
});

export const updatePost = createAsyncThunk('posts/updatePost', async (initialPost) => {
    const { id } = initialPost;
    try {
        const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
        return response.data;
    } catch (err) {
        // on your Computer-Shop project, do not implement this line
        return initialPost; // only for testing redux
    }
});

export const deletePost = createAsyncThunk('posts/deletePost', async (initialPost) => {
    const { id } = initialPost;
    try {
        const response = await axios.delete(`${POSTS_URL}/${id}`);
        if (response?.status === 200) return initialPost; //if deleted successfully
        return `${response?.status}: ${response?.statusText}`;
    } catch (err) {
        return err.message;
    }
});

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        // postAdded: {
        //     reducer(state, action) {
        //         state.posts.push(action.payload);
        //     },
        //     prepare(title, content, userId) {
        //         return {
        //             payload: {
        //                 id: nanoid(),
        //                 title,
        //                 content,
        //                 date: new Date().toISOString(),
        //                 userId,
        //                 reactions: {
        //                     thumbsUp: 0,
        //                     wow: 0,
        //                     heart: 0,
        //                     rocket: 0,
        //                     coffee: 0,
        //                 },
        //             },
        //         };
        //     },
        // },
        reactionAdded(state, action) {
            const { postId, reaction } = action.payload;
            const existingPost = state.entities[postId];
            if (existingPost) {
                existingPost.reactions[reaction]++;
            }
        },
        increaseCount(state, action) {
            state.count = state.count + 1;
        },
    },
    extraReducers(builder) {
        //allows to handle async function / AsyncThunk
        builder
            .addCase(fetchPosts.pending, (state, action) => {
                state.status = 'loading';
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Adding date and reactions
                let min = 1;
                const loadedPosts = action.payload.map((post) => {
                    post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0,
                    };
                    return post;
                });

                // concat - merge two arrays
                // state.posts = state.posts.concat(loadedPosts);
                postsAdapter.upsertMany(state, loadedPosts);
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                // Fix for API post IDs:
                // Creating sortedPosts & assigning the id
                // would be not be needed if the fake API
                // returned accurate new post IDs
                action.payload.id = state.ids[state.ids.length - 1] + 1;
                // End fix for fake API post IDs

                action.payload.userId = Number(action.payload.userId);
                action.payload.date = new Date().toISOString();
                action.payload.reactions = {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0,
                };
                console.log(action.payload);
                // state.posts.push(action.payload);
                postsAdapter.addOne(state, action.payload);
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('update fail');
                    console.log(action.payload);
                    return;
                }
                // const { id } = action.payload;
                action.payload.date = new Date().toISOString();
                // const posts = state.posts.filter((post) => post.id !== id);
                // state.posts = [...posts, action.payload];
                postsAdapter.upsertOne(state, action.payload);
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                if (!action.payload?.id) {
                    console.log('Delete could not complete');
                    console.log(action.payload);
                    return;
                }
                const { id } = action.payload;
                // const posts = state.posts.filter((post) => post.id !== id);
                // state.posts = posts;
                postsAdapter.removeOne(state, id);
            });
    },
});

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds,
    // Pass in a selector that return the posts slice of state
} = postsAdapter.getSelectors((state) => state.posts);

export const getPostsStatus = (state) => state.posts.status;
export const getPostsError = (state) => state.posts.error;
export const getCounter = (state) => state.posts.count;

// selectAllPosts = posts, (state, userId) => userId = userId, array of args is input for anonymouse function, which is in second argument in createSelector
export const selectPostByUser = createSelector([selectAllPosts, (state, userId) => userId], (posts, userId) =>
    posts.filter((post) => post.userId === userId)
);

export const { increaseCount, reactionAdded } = postsSlice.actions;

export default postsSlice.reducer;
