import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';

// const localStorageMiddleware = ({ getState }) => {
//     return (next) => (action) => {
//         const result = next(action);
//         localStorage.removeItem('postsLocalStorage');
//         if(JSON.parse(localStorage.getItem('postsLocalStorage')) !== null){
//             const posts = JSON.parse(localStorage.getItem('postsLocalStorage')).filter((post) => post.id !== id)
//         }

//         localStorage.setItem('postsLocalStorage', JSON.stringify(getState().posts.posts));
//         return result;
//     };
// };

export const store = configureStore({
    reducer: {
        posts: postsReducer,
        users: usersReducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
});
