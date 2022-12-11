import PostAuthor from './PostAuthor';
import TimeAgo from './TimeAgo';
import ReactionButtons from './ReactionButtons';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import { selectPostById } from './postsSlice';

// have to be 'let' for  React.memo
const PostsExcerpt = ({ postId }) => {
    const post = useSelector((state) => selectPostById(state, postId));

    return (
        <article>
            <h2>{post.title}</h2>
            <p className="excerpt">{post.body.substring(0, 75)}...</p>
            <p className="postCredit">
                <Link to={`post/${post.id}`}>View Post</Link>
                <PostAuthor userId={post.userId} />
                <TimeAgo timestamp={post.date} />
            </p>
            <ReactionButtons post={post} />
        </article>
    );
};

// // allows to do not render if props that it receive do not change
// PostsExcerpt = React.memo(PostsExcerpt);

export default PostsExcerpt;
