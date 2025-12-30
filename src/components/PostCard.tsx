import { motion } from 'framer-motion';
import type { PostSearchResponse } from '../types/api';
import { useViewTransitionNavigate } from '../hooks/useViewTransition';
import '../styles/PostCard.css';

interface PostCardProps {
  post: PostSearchResponse;
  showCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
  index?: number;
}

export const PostCard = ({ post, showCategory = true, size = 'medium', index = 0 }: PostCardProps) => {
  const navigate = useViewTransitionNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`post-card size-${size}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut"
      }}
    >
      {/* 썸네일 이미지 */}
      {post.thumbnailImageUrl && (
        <div className="post-card-thumbnail">
          <img
            src={post.thumbnailImageUrl}
            alt={post.title}
          />
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="post-card-content">
        {/* 카테고리 + 제목 */}
        <div className="post-card-title-section">
          {showCategory && post.categoryName && (
            <span className="post-card-category">
              {post.categoryName}
            </span>
          )}
          <h3 className="post-card-title">
            {post.title.length > 20 ? `${post.title.substring(0, 20)}…` : post.title}
            {post.commentCount > 0 && (
              <span className="post-card-comment-count">
                [{post.commentCount}]
              </span>
            )}
          </h3>
        </div>

        {/* 메타 정보 */}
        <div className="post-card-meta">
          <span className="post-card-author">
            {post.authorDisplayName}
          </span>
          <span>조회 {post.viewCount}</span>
          <span>추천 {post.likeCount}</span>
          <span className="post-card-date">
            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
