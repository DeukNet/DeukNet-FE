import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { postService } from '../services/postService';
import { reactionService } from '../services/reactionService';
import { commentService } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { PostCard } from '../components/PostCard';
import type { PostSearchResponse, Comment } from '../types/api';
import { useViewTransitionNavigate } from '../hooks/useViewTransition';
import {
  trackViewPost,
  trackLikePost,
  trackUnlikePost,
  trackDislikePost,
  trackUndislikePost,
  trackDeletePost,
  trackCreateComment,
  trackUpdateComment,
  trackDeleteComment,
} from '../utils/analyticsEvents';

export const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useViewTransitionNavigate();
  const { isAuthenticated, user } = useAuth();
  const canAccessAnonymous = user?.canAccessAnonymous ?? false;
  const [post, setPost] = useState<PostSearchResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<PostSearchResponse[]>([]);
  const viewAddedRef = useRef(false);
  const pendingReactionRef = useRef<{
    action: 'add' | 'remove';
    type: 'LIKE' | 'DISLIKE';
    reactionId?: string;
  } | null>(null);

  // Handle pending reaction on unmount or page unload
  useEffect(() => {
    const flushPendingReaction = async () => {
      if (!id || !pendingReactionRef.current) return;

      const pending = pendingReactionRef.current;
      try {
        if (pending.action === 'add') {
          await reactionService.addReaction(id, { reactionType: pending.type });
        } else if (pending.action === 'remove' && pending.reactionId) {
          await reactionService.removeReaction(id, pending.reactionId);
        }
        pendingReactionRef.current = null;
      } catch (error) {
        console.error('Failed to flush pending reaction:', error);
      }
    };

    // Handle beforeunload (page refresh, close, navigation)
    const handleBeforeUnload = () => {
      flushPendingReaction();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Flush on component unmount
      flushPendingReaction();
    };
  }, [id]);

  useEffect(() => {
    // Reset view flag and show comments state when post ID changes
    viewAddedRef.current = false;
    setShowComments(true);
    setShowCommentEditor(false);
    pendingReactionRef.current = null;

    const fetchPost = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch only post data
        const postData = await postService.getPostById(id);

        setPost(postData);

        // Update document title with post title
        if (postData?.title) {
          document.title = `${postData.title} - DeukNet`;
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    // Cleanup: reset title when leaving the page
    return () => {
      document.title = 'DeukNet';
    };
  }, [id]);

  // Load comments when showComments becomes true
  useEffect(() => {
    const fetchComments = async () => {
      if (!id || !showComments) return;

      try {
        const commentsData = await commentService.getComments(id);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };

    fetchComments();
  }, [id, showComments]);

  // Fetch related posts based on current post title
  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!post?.title || !id) return;

      try {
        // Search posts with the current post's title as keyword
        const response = await postService.searchPosts({
          keyword: post.title,
          sortType: 'RECENT',
          page: 0,
          size: 9, // Fetch 9 to exclude current post and get 8 results
        });

        // Filter out the current post and limit to 8
        const filtered = (response?.results || [])
          .filter((p: PostSearchResponse) => p.id !== id)
          .slice(0, 8);

        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Failed to fetch related posts:', error);
      }
    };

    fetchRelatedPosts();
  }, [post?.title, id]);

  // Add VIEW reaction separately (only once when authenticated)
  useEffect(() => {
    let cancelled = false;

    const addView = async () => {
      if (!id || !isAuthenticated || viewAddedRef.current) return;

      viewAddedRef.current = true;

      try {
        await reactionService.addReaction(id, { reactionType: 'VIEW' });
        // Track view event
        trackViewPost(id);
      } catch (error: any) {
        if (cancelled) return;
        // Ignore duplicate view errors (user already viewed this post)
        if (error.response?.status !== 409) {
          console.error('Failed to add view:', error);
        }
      }
    };

    addView();

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated]);

  const handleLike = () => {
    if (!id || !post) return;

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // Optimistic UI update
    const updatedPost = { ...post };

    if (post.hasUserLiked) {
      // Cancel like
      updatedPost.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      updatedPost.hasUserLiked = false;
      pendingReactionRef.current = {
        action: 'remove',
        type: 'LIKE',
        reactionId: post.userLikeReactionId || undefined
      };
      updatedPost.userLikeReactionId = null;
      trackUnlikePost(id);
    } else {
      // Add like
      updatedPost.likeCount = (post.likeCount || 0) + 1;
      updatedPost.hasUserLiked = true;
      pendingReactionRef.current = {
        action: 'add',
        type: 'LIKE'
      };
      trackLikePost(id);

      // Remove dislike if exists
      if (post.hasUserDisliked) {
        updatedPost.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
        updatedPost.hasUserDisliked = false;
        updatedPost.userDislikeReactionId = null;
      }

      // 좋아요 수가 10의 배수일 때만 파티클 효과
      if (updatedPost.likeCount % 10 === 0) {
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        // 한 번 폭발
        confetti({
          ...defaults,
          particleCount: 150,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']
        });
        confetti({
          ...defaults,
          particleCount: 150,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']
        });
      }
    }

    setPost(updatedPost);
  };

  const handleDislike = () => {
    if (!id || !post) return;

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // Optimistic UI update
    const updatedPost = { ...post };

    if (post.hasUserDisliked) {
      // Cancel dislike
      updatedPost.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
      updatedPost.hasUserDisliked = false;
      pendingReactionRef.current = {
        action: 'remove',
        type: 'DISLIKE',
        reactionId: post.userDislikeReactionId || undefined
      };
      updatedPost.userDislikeReactionId = null;
      trackUndislikePost(id);
    } else {
      // Add dislike
      updatedPost.dislikeCount = (post.dislikeCount || 0) + 1;
      updatedPost.hasUserDisliked = true;
      pendingReactionRef.current = {
        action: 'add',
        type: 'DISLIKE'
      };
      trackDislikePost(id);

      // Remove like if exists
      if (post.hasUserLiked) {
        updatedPost.likeCount = Math.max(0, (post.likeCount || 0) - 1);
        updatedPost.hasUserLiked = false;
        updatedPost.userLikeReactionId = null;
      }
    }

    setPost(updatedPost);
  };

  const handleEdit = () => {
    if (!id) return;
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !post) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await postService.deletePost(id);
      trackDeletePost(id);
      toast.success('게시글이 삭제되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleCommentSubmit = async () => {
    if (!id) return;

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      toast.error('댓글 내용을 입력하세요.');
      return;
    }

    try {
      await commentService.createComment(id, {
        content: commentText,
        authorType: isAnonymousComment ? 'ANONYMOUS' : 'REAL'
      });
      trackCreateComment(id, false); // false = top-level comment
      setCommentText('');
      setIsAnonymousComment(false);
      setShowCommentEditor(false);

      // Ensure comments are shown
      setShowComments(true);

      // Refresh comments
      const updatedComments = await commentService.getComments(id);
      setComments(updatedComments);

      // Update comment count on client side (no need to refetch post)
      setPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);

      toast.success('댓글이 작성되었습니다.');
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      if (error.response?.status === 403) {
        toast.error('로그인이 필요합니다.');
        navigate('/login');
      } else {
        toast.error('댓글 작성에 실패했습니다.');
      }
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!id) return;

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!replyText.trim()) {
      toast.error('답글 내용을 입력하세요.');
      return;
    }

    try {
      await commentService.createComment(id, {
        content: replyText,
        parentCommentId: parentCommentId,
        authorType: isAnonymousReply ? 'ANONYMOUS' : 'REAL'
      });
      trackCreateComment(id, true); // true = reply
      setReplyText('');
      setReplyingToCommentId(null);
      setIsAnonymousReply(false);

      // Refresh comments
      const updatedComments = await commentService.getComments(id);
      setComments(updatedComments);

      // Update comment count on client side (no need to refetch post)
      setPost(prev => prev ? { ...prev, commentCount: (prev.commentCount || 0) + 1 } : null);

      toast.success('답글이 작성되었습니다.');
    } catch (error: any) {
      console.error('Failed to create reply:', error);
      if (error.response?.status === 403) {
        toast.error('로그인이 필요합니다.');
        navigate('/login');
      } else {
        toast.error('답글 작성에 실패했습니다.');
      }
    }
  };

  const handleCommentEdit = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(content);
  };

  const handleCommentUpdate = async (commentId: string) => {
    if (!id) return;

    if (!editingCommentText.trim()) {
      toast.error('댓글 내용을 입력하세요.');
      return;
    }

    try {
      await commentService.updateComment(id, commentId, { content: editingCommentText });
      trackUpdateComment(commentId);
      setEditingCommentId(null);
      setEditingCommentText('');

      // Refresh comments
      const updatedComments = await commentService.getComments(id);
      setComments(updatedComments);

      toast.success('댓글이 수정되었습니다.');
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      if (error.response?.status === 403) {
        toast.error('로그인이 필요합니다.');
        navigate('/login');
      } else {
        toast.error('댓글 수정에 실패했습니다.');
      }
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!id) return;
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentService.deleteComment(id, commentId);
      trackDeleteComment(commentId);

      // Refresh comments
      const updatedComments = await commentService.getComments(id);
      setComments(updatedComments);

      // Update comment count on client side (no need to refetch post)
      setPost(prev => prev ? { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) } : null);

      toast.success('댓글이 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      if (error.response?.status === 403) {
        toast.error('로그인이 필요합니다.');
        navigate('/login');
      } else {
        toast.error('댓글 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!post) {
    return <div className="loading">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '26px', marginBottom: '5px', color: '#ffffff' }}>DeukNet</h1>
            <div style={{ fontSize: '14px', color: '#999' }}>
              <Link to="/" style={{ color: '#66b3ff' }}>홈</Link>
              <span> &gt; </span>
              <span>게시판</span>
              {post.categoryName && (
                <>
                  <span> &gt; </span>
                  <span>{post.categoryName}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (post.categoryId) {
                navigate(`/categories/${post.categoryId}`);
              } else {
                navigate('/');
              }
            }}
            style={{
              padding: '8px 15px',
              background: '#2a2a2a',
              color: '#ffffff',
              border: '1px solid #555',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
          >
            {post.categoryId ? '카테고리 전체 보기' : '메인으로'}
          </button>
        </div>
      </header>

      <div className="box">
        <div className="box-header">
          {post.title}
          {post.categoryName && (
            <span style={{ marginLeft: '12px', fontSize: '18px', color: '#888', fontWeight: 'normal' }}>
              [{post.categoryName}]
            </span>
          )}
        </div>
        <div style={{ padding: '10px 15px', borderBottom: '1px solid #555', background: '#3a3a3a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#999' }}>
            <div>
              {post.authorId ? (
                <Link
                  to={`/users/${post.authorId}`}
                  style={{ fontWeight: 'bold', color: '#ffffff', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                >
                  {post.authorDisplayName}
                </Link>
              ) : (
                <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{post.authorDisplayName}</span>
              )}
              <span style={{ marginLeft: '10px' }}>
                {new Date(post.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            <div>
              <span>조회 {post.viewCount}</span>
              <span style={{ marginLeft: '10px' }}>추천 {post.likeCount}</span>
            </div>
          </div>
        </div>
        <div className="box-content">
          <div style={{ minHeight: '500px' }}>
            <MarkdownRenderer content={post.content || ''} />
          </div>
        </div>
        <div style={{ padding: '15px', borderTop: '1px solid #555', background: '#3a3a3a', textAlign: 'center' }}>
          <button
            onClick={handleLike}
            style={{
              marginRight: '5px',
              background: post.hasUserLiked ? '#4CAF50' : '#4a4a4a',
              color: '#ffffff',
              border: '1px solid #555'
            }}
          >
            {post.hasUserLiked ? '추천 취소' : '추천'} {post.likeCount}
          </button>
          <button
            onClick={handleDislike}
            style={{
              background: post.hasUserDisliked ? '#f44336' : '#4a4a4a',
              color: '#ffffff',
              border: '1px solid #555'
            }}
          >
            {post.hasUserDisliked ? '비추천 취소' : '비추천'} {post.dislikeCount}
          </button>
        </div>
      </div>

      <div className="box">
        <div className="box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>댓글 {post.commentCount || 0}개</span>
          {!showComments && (
            <button
              onClick={() => setShowComments(true)}
              style={{
                padding: '6px 12px',
                background: '#0066cc',
                color: '#ffffff',
                border: '1px solid #0066cc',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              댓글 보기
            </button>
          )}
        </div>
        {showComments && (
          <div className="box-content">
            {!showCommentEditor ? (
              <div>
                <div style={{ marginBottom: '15px' }}>
                  <button
                    onClick={() => setShowCommentEditor(true)}
                    style={{
                      padding: '10px 20px',
                      background: '#0066cc',
                      color: '#ffffff',
                      border: '1px solid #0066cc',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    댓글 쓰기
                  </button>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #555', margin: '15px 0' }} />
              </div>
            ) : (
              <div style={{ marginBottom: '15px' }}>
                <MarkdownEditor
                  value={commentText}
                  onChange={setCommentText}
                  placeholder="댓글을 입력하세요... (마크다운 지원)"
                  minHeight="150px"
                />
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  {canAccessAnonymous && (
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#ffffff' }}>
                      <input
                        type="checkbox"
                        checked={isAnonymousComment}
                        onChange={(e) => setIsAnonymousComment(e.target.checked)}
                        style={{ marginRight: '5px', cursor: 'pointer' }}
                      />
                      익명으로 작성
                    </label>
                  )}
                  {!canAccessAnonymous && <div />}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setShowCommentEditor(false);
                        setCommentText('');
                        setIsAnonymousComment(false);
                      }}
                      style={{
                        padding: '8px 15px',
                        background: '#2a2a2a',
                        color: '#ffffff',
                        border: '1px solid #555',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      취소
                    </button>
                    <button onClick={handleCommentSubmit}>댓글 작성</button>
                  </div>
                </div>
              </div>
            )}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                첫 댓글을 작성해보세요!
              </div>
            ) : (
              <div>
                {comments
                  .filter(comment => !comment.parentCommentId) // 최상위 댓글만 먼저 필터링
                  .map((comment) => {
                    // 해당 댓글의 답글들 찾기
                    const replies = comments.filter(c => c.parentCommentId === comment.id);

                    return (
                      <div key={comment.id}>
                        {/* 최상위 댓글 렌더링 */}
                        {renderComment(comment)}

                        {/* 답글들 렌더링 */}
                        {replies.map(reply => (
                          <div key={reply.id}>
                            {renderComment(reply)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 관련 게시글 */}
      {relatedPosts.length > 0 && (
        <div className="box" style={{ marginTop: '15px' }}>
          <div className="box-header">관련 게시글</div>
          <div className="box-content" style={{ padding: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {relatedPosts.map((relatedPost) => (
                <PostCard
                  key={relatedPost.id}
                  post={relatedPost}
                  showCategory={true}
                  size="small"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/">
          <button style={{
            background: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #555',
            padding: '8px 15px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>목록</button>
        </Link>
        {post.isAuthor && (
          <div>
            <button
              onClick={handleEdit}
              style={{
                marginRight: '5px',
                background: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #555',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >수정</button>
            <button
              onClick={handleDelete}
              style={{
                background: '#2a2a2a',
                color: '#ffffff',
                border: '1px solid #555',
                padding: '8px 15px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >삭제</button>
          </div>
        )}
      </div>
    </div>
  );

  // 댓글 렌더링 함수
  function renderComment(comment: Comment) {
    return (
      <div
        style={{
          padding: '15px',
          paddingLeft: comment.parentCommentId ? '50px' : '15px',
          borderBottom: '1px solid #555',
          borderLeft: comment.parentCommentId ? '3px solid #0066cc' : 'none',
          background: comment.isReply ? '#2b2b2b' : '#3a3a3a'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            {comment.authorId ? (
              <Link
                to={`/users/${comment.authorId}`}
                style={{ fontWeight: 'bold', color: '#ffffff', textDecoration: 'none', fontSize: '14px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0066cc'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {comment.authorDisplayName}
              </Link>
            ) : (
              <span style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px' }}>{comment.authorDisplayName}</span>
            )}
            <span style={{ marginLeft: '8px', color: '#999', fontSize: '14px' }}>
              @{comment.authorUsername}
            </span>
          </div>
          <span style={{ color: '#999', fontSize: '14px' }}>
            {new Date(comment.createdAt).toLocaleString('ko-KR')}
          </span>
        </div>
        {editingCommentId === comment.id ? (
          <div>
            <MarkdownEditor
              value={editingCommentText}
              onChange={setEditingCommentText}
              placeholder="댓글 내용을 수정하세요..."
              minHeight="150px"
            />
            <div style={{ marginTop: '10px', textAlign: 'right' }}>
              <button
                onClick={() => handleCommentUpdate(comment.id)}
                style={{ marginRight: '5px' }}
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditingCommentId(null);
                  setEditingCommentText('');
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="comment-content" style={{ color: '#ffffff', marginBottom: '8px' }}>
              <MarkdownRenderer content={comment.content} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {!comment.parentCommentId && (
                <button
                  onClick={() => {
                    setReplyingToCommentId(comment.id);
                    setReplyText('');
                  }}
                  style={{ fontSize: '14px', color: '#66b3ff', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  답글 작성
                </button>
              )}
              {comment.isAuthor && (
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => handleCommentEdit(comment.id, comment.content)}
                    style={{ fontSize: '14px', marginRight: '5px' }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleCommentDelete(comment.id)}
                    style={{ fontSize: '14px' }}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 답글 입력 폼 */}
        {replyingToCommentId === comment.id && (
          <div style={{ marginTop: '10px', paddingLeft: '20px', borderLeft: '3px solid #555' }}>
            <MarkdownEditor
              value={replyText}
              onChange={setReplyText}
              placeholder="답글을 입력하세요... (마크다운 지원)"
              minHeight="150px"
            />
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              {canAccessAnonymous && (
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymousReply}
                    onChange={(e) => setIsAnonymousReply(e.target.checked)}
                    style={{ marginRight: '5px', cursor: 'pointer' }}
                  />
                  익명으로 작성
                </label>
              )}
              {!canAccessAnonymous && <div />}
              <div>
                <button
                  onClick={() => handleReplySubmit(comment.id)}
                  style={{ marginRight: '5px' }}
                >
                  답글 작성
                </button>
                <button
                  onClick={() => {
                    setReplyingToCommentId(null);
                    setReplyText('');
                    setIsAnonymousReply(false);
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};
