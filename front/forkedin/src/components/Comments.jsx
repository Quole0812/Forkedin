import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { commentsAPI } from '../services/api';
import './Comments.css';

const Comments = ({ recipeUri }) => {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments when component mounts or recipeUri changes
  useEffect(() => {
    if (recipeUri) {
      fetchComments();
    }
  }, [recipeUri]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await commentsAPI.getComments(recipeUri);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.addComment(recipeUri, newComment.trim());
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!user) {
      alert('Please log in to reply');
      return;
    }
    const replyText = replyTexts[commentId];
    if (!replyText?.trim()) return;

    try {
      await commentsAPI.addReply(recipeUri, commentId, replyText.trim());
      setReplyTexts(prev => ({ ...prev, [commentId]: '' }));
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentsAPI.deleteComment(recipeUri, commentId);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await commentsAPI.deleteReply(recipeUri, commentId, replyId);
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      let date;
      if (timestamp._seconds) {
        // Firebase timestamp
        date = new Date(timestamp._seconds * 1000);
      } else if (timestamp.toDate) {
        // Firestore timestamp
        date = timestamp.toDate();
      } else {
        // Regular timestamp
        date = new Date(timestamp);
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  return (
    <div className="comments-section">
      <h2>Comments ({comments.length})</h2>
      
      {loading ? (
        <div className="loading">Loading comments...</div>
      ) : (
        <>
          {/* Comments List */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">@{comment.authorUsername}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {user && user.uid === comment.authorId && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-btn"
                      aria-label="Delete comment"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.text}</p>
                
                {/* Reply Toggle */}
                <div className="comment-actions">
                  <button 
                    onClick={() => toggleReplies(comment.id)}
                    className="reply-toggle"
                  >
                    {showReplies[comment.id] ? 'Hide' : 'Reply'} 
                    {comment.replies && comment.replies.length > 0 && 
                      ` (${comment.replies.length})`
                    }
                  </button>
                </div>
                
                {/* Replies */}
                {showReplies[comment.id] && comment.replies && comment.replies.length > 0 && (
                  <div className="replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <div className="reply-header">
                          <span className="reply-author">@{reply.authorUsername}</span>
                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                          {user && user.uid === reply.authorId && (
                            <button 
                              onClick={() => handleDeleteReply(comment.id, reply.id)}
                              className="delete-btn"
                              aria-label="Delete reply"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <p className="reply-text">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Reply Form */}
                {showReplies[comment.id] && user && (
                  <div className="reply-form">
                    <textarea
                      value={replyTexts[comment.id] || ''}
                      onChange={(e) => setReplyTexts(prev => ({
                        ...prev, 
                        [comment.id]: e.target.value
                      }))}
                      placeholder="Write a reply..."
                      rows="2"
                    />
                    <button 
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyTexts[comment.id]?.trim()}
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <div className="comment-input-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this recipe..."
                  rows="3"
                  disabled={submitting}
                />
                <button 
                  type="submit" 
                  disabled={!newComment.trim() || submitting}
                  className="submit-comment-btn"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please log in to leave a comment</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Comments; 