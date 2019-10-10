import React, { useState } from 'react';
import { axiosWithAuth } from '../../utilities/axiosWithAuth.js';
import axios from 'axios';
// import moment from 'moment';
import { useWindowDimensions } from './useWindowDimensions.js';
import SendIcon from '../Icons/SendIcon';
import '../../SASS/ProjectComments.scss';

const ProjectComments = ({
  activeUser,
  addComments,
  comments,
  modal,
  thisProject
}) => {
  // console.log('ProjectComments.js RENDER comments', comments);
  // console.log('ProjectComments.js RENDER activeUser', activeUser);

  //custom hook to get window height/width
  const { width } = useWindowDimensions();
  // ref for bottom of comments feed
  const [commentAnchor, setCommentAnchor] = useState(null);
  //function to autoscroll to commentAnchor
  const scrollToBottom = () => {
    //scroll comments window ONLY at desktop widths
    if (width <= 1024) return;
    else commentAnchor.scrollIntoView({ behavior: 'smooth' });
  };

  //local state for form input
  const [newComment, setNewComment] = useState('');

  //function for sending comment notifications

  const postCommentNotification = async (
    username,
    commentText,
    projectId,
    invitedUserId,
    activeUserId,
    mainImgUrl,
    commentsId,
    activeUserAvatar,
    type
  ) => {
    axiosWithAuth().post('api/v1/invite/comments', {
      activeUsername: username,
      commentText: commentText,
      projectId: projectId,
      invitedUserId: invitedUserId,
      activeUserId: activeUserId,
      mainImgUrl: mainImgUrl,
      commentsId: commentsId,
      activeUserAvatar: activeUserAvatar,
      type: type
    });
  };

  //click submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!newComment) return; //dont submit blank comments

    const thisComment = {
      userId: activeUser.id,
      username: activeUser.username,
      projectId: thisProject.id,
      text: newComment
    };
    // console.log('ProjectComments.js handleSubmit() thisCOmment', thisComment);

    try {
      const res = await axiosWithAuth().post(
        `api/v1/comments/project`,
        thisComment
      );
      const newComment = res.data.data[0];

      await postCommentNotification(
        activeUser.username,
        newComment.text,
        thisProject.id,
        thisProject.userId,
        activeUser.id,
        thisProject.mainImg,
        newComment.id,
        activeUser.avatar,
        'comment'
      );

      //glue the avatar back on and insert into local state so we don't have to reload the component
      newComment.userAvatar = activeUser.avatar;
      const updateComments = [...comments, newComment];
      addComments(updateComments);
      setNewComment('');
    } catch (err) {
      console.log('ProjectComments.js handleSubmit() ERROR', err);
    }
  };

  return (
    <div className="project-comments">
      <header className="comments-header">Comments</header>
      <section className="comments-body">
        {comments.map(c => (
          <div
            key={c.id}
            className={
              activeUser.id === c.userId
                ? 'ProjectComment__body --you'
                : 'ProjectComment__body --them'
            }
          >
            {activeUser.id === c.userId ? null : (
              <img
                src={c.userAvatar}
                alt="avatar"
                className="ProjectComment__body__avatar"
              />
            )}
            <div className="ProjectComment__body__text">
              <p className="username">
                {activeUser.id === c.userId ? 'You' : c.username}
              </p>
              <p>{c.text}</p>
            </div>
          </div>
        ))}
        <div ref={el => setCommentAnchor(el)}></div>
        {commentAnchor && !modal && scrollToBottom()}
      </section>

      <section className="comments-form">
        <form onSubmit={handleSubmit}>
          <div className="form-wrapper">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
            />
            <button>
              <SendIcon />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ProjectComments;
