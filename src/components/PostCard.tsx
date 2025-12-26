import { Link } from 'react-router-dom';
import type { PostSearchResponse } from '../types/api';
import '../styles/PostCard.css';

interface PostCardProps {
  post: PostSearchResponse;
  showCategory?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PostCard = ({ post, showCategory = true, size = 'medium' }: PostCardProps) => {
  return (
    <Link
      to={`/posts/${post.id}`}
      className={`post-card size-${size}`}
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
    </Link>
  );
};
