import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

function Discussion({ userName }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, commentId: null });
  const [isExpanded, setIsExpanded] = useState({});
  const [shouldShowMore, setShouldShowMore] = useState({});
  const commentRefs = useRef({});

  const fetchComments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/comments');
      const data = await response.json();
      
      if (data.status === 'ok') {
        
        const sortedComments = data.comments.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComments(sortedComments || []);
      } else {
        toast.error('Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          comment: newComment,
          name: userName 
        })
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setNewComment('');
        toast.success('Comment posted successfully!');
        fetchComments();
      } else {
        toast.error(data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    setDeleteConfirmation({ show: true, commentId });
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/comments/${deleteConfirmation.commentId}?userName=${encodeURIComponent(userName)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.status === 'ok') {
        toast.success('Comment deleted successfully');
        fetchComments();
      } else {
        toast.error(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeleteConfirmation({ show: false, commentId: null });
    }
  };

  const checkCommentHeight = (commentId) => {
    requestAnimationFrame(() => {
      if (commentRefs.current[commentId]) {
        const element = commentRefs.current[commentId];
        const shouldShow = element.scrollHeight > 100;
        
        if (shouldShowMore[commentId] !== shouldShow) {
          setShouldShowMore(prev => ({
            ...prev,
            [commentId]: shouldShow
          }));
        }
      }
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  // Add this useEffect to check comment heights when comments change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      comments.forEach(comment => {
        if (commentRefs.current[comment._id]) {
          checkCommentHeight(comment._id);
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [comments]);

  return (
    <div className="min-h-screen bg-[#020817] text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Discussion Forum</h1>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Posting as:</span>
              <span className="text-violet-400">{userName || 'Anonymous'}</span>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 md:p-4 rounded-lg bg-[#1a1a2e] border border-[#2a2a40] focus:border-violet-500 
                       focus:ring-1 focus:ring-violet-500 outline-none transition-all text-sm md:text-base
                       h-[100px] md:h-[120px] resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="self-end px-6 py-2 bg-violet-500/20 text-violet-400 rounded-lg 
                       hover:bg-violet-500/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          {isLoading ? (
            <p className="text-center text-gray-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-400">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => {
              const isOwnComment = comment.postedBy === userName;
              
              return (
                <div
                  key={comment._id}
                  className={`flex ${isOwnComment ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`bg-[#1a1a2e] rounded-lg p-6 border border-[#2a2a40]
                                 ${isOwnComment ? 'bg-opacity-80 border-violet-500/30' : ''}
                                 min-w-[300px] max-w-[600px] break-words relative`} 
                  >
                    <div className={`flex justify-between items-start mb-4 
                                   ${isOwnComment ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <h3 className={`font-semibold ${isOwnComment ? 'text-violet-400' : 'text-blue-400'}`}>
                        {comment.postedBy || comment.name}
                      </h3>
                      <span className={`text-sm text-gray-400 ${isOwnComment ? 'mr-6' : 'ml-6'}`}>
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div 
                      ref={el => {
                        if (el && (!commentRefs.current[comment._id] || commentRefs.current[comment._id] !== el)) {
                          commentRefs.current[comment._id] = el;
                          checkCommentHeight(comment._id);
                        }
                      }}
                      className={`relative overflow-hidden transition-all duration-300 ${
                        isExpanded[comment._id] ? 'max-h-none' : 'max-h-[100px]'
                      }`}
                    >
                      <p className={`text-gray-200 ${isOwnComment ? 'text-right' : 'text-left'} text-lg whitespace-pre-wrap`}>
                        {comment.comment}
                      </p>
                      
                      {shouldShowMore[comment._id] && !isExpanded[comment._id] && (
                        <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t 
                          from-[#1a1a2e] to-transparent pointer-events-none`}
                        />
                      )}
                    </div>
                    
                    {shouldShowMore[comment._id] && (
                      <button
                        onClick={() => setIsExpanded(prev => ({
                          ...prev,
                          [comment._id]: !prev[comment._id]
                        }))}
                        className="mt-2 text-violet-400 hover:text-violet-300 transition-colors text-sm"
                      >
                        {isExpanded[comment._id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                    
                    {/* Delete button - only shown for own comments */}
                    {isOwnComment && (
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="absolute bottom-4 right-2 p-2 hover:bg-red-500/10 rounded-full
                                  transition-all duration-200 group"
                        title="Delete comment"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] p-6 rounded-lg border border-violet-500/30 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Comment?</h3>
            <p className="text-gray-300 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation({ show: false, commentId: null })}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Discussion.defaultProps = {
  userName: 'Anonymous'
};

export default Discussion;
