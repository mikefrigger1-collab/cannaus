'use client'

// components/CommentSystem.tsx
import React, { useState, useEffect } from 'react';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  approved: boolean;
  replies?: Comment[];
}

interface CommentFormProps {
  articleId: number;
  parentId?: number;
  onCommentAdded: () => void;
  onCancel?: () => void;
}

// Simple math captcha component
const MathCaptcha: React.FC<{
  onVerify: (isValid: boolean) => void;
  resetTrigger: number;
}> = ({ onVerify, resetTrigger }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isValid, setIsValid] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setUserAnswer('');
    setIsValid(false);
    onVerify(false);
  };

useEffect(() => {
  generateCaptcha();
}, [resetTrigger, generateCaptcha]);

useEffect(() => {
  const correctAnswer = num1 + num2;
  const valid = parseInt(userAnswer) === correctAnswer;
  setIsValid(valid);
  onVerify(valid);
}, [userAnswer, num1, num2, onVerify]);

  return (
    <div className="captcha-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Security Check: What is {num1} + {num2}?
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Answer"
        />
        <button
          type="button"
          onClick={generateCaptcha}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          New Question
        </button>
        {isValid && <span className="text-green-600 text-sm">✓ Correct</span>}
      </div>
    </div>
  );
};

const CommentForm: React.FC<CommentFormProps> = ({ 
  articleId, 
  parentId, 
  onCommentAdded, 
  onCancel 
}) => {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaValid) {
      setError('Please complete the security check correctly.');
      return;
    }

    if (!name.trim() || !comment.trim()) {
      setError('Name and comment are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          parentId,
          author: name.trim(),
          content: comment.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      // Reset form
      setName('');
      setComment('');
      setCaptchaReset(prev => prev + 1);
      onCommentAdded();
      
      if (onCancel) onCancel();
    } catch (error) {
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white m-16 rounded-lg">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comment *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your comment..."
          required
        />
      </div>

      <MathCaptcha onVerify={setCaptchaValid} resetTrigger={captchaReset} />

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting || !captchaValid}
          className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

const CommentItem: React.FC<{
  comment: Comment;
  onReply: (commentId: number) => void;
}> = ({ comment, onReply }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white pl-4 py-3">
      <div className="flex items-center space-x-2 mb-2">
        <span className="font-medium text-gray-900">{comment.author}</span>
        <span className="text-sm text-gray-500">
          {formatDate(comment.createdAt)}
        </span>
        {!comment.approved && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Pending Approval
          </span>
        )}
      </div>
      
      <div className="text-gray-700 mb-2 whitespace-pre-wrap">
        {comment.content}
      </div>
      
      <button
        onClick={() => onReply(comment.id)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Reply
      </button>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSystem: React.FC<{ articleId: number }> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?articleId=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchComments();
}, [articleId, fetchComments]);

  const handleCommentAdded = () => {
    fetchComments();
    setReplyingTo(null);
    setShowCommentForm(false);
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="mt-8 pt-8">
<div className="flex flex-col items-center mb-6 space-y-4">
  <h3 className="text-xl font-bold text-gray-900">
    Comments ({comments.length})
  </h3>

</div>
      {showCommentForm && (
        <div className="mb-6">
          <CommentForm
            articleId={articleId}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setShowCommentForm(false)}
          />
        </div>
      )}

      <div className="space-y-4 mr-8 ml-8">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={setReplyingTo}
              />
              
              {replyingTo === comment.id && (
                <div className="ml-6 mt-3">
                  <CommentForm
                    articleId={articleId}
                    parentId={comment.id}
                    onCommentAdded={handleCommentAdded}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

<div className="flex justify-center mt-6">
  <button
    onClick={() => setShowCommentForm(!showCommentForm)}
    className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-blue-600"
  >
    {showCommentForm ? 'Cancel' : 'Add Comment'}
  </button>
</div>
    </div>
  );
};

export default CommentSystem;