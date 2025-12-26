import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import type { PostSearchResponse, PostSearchParams } from '../types/api';
import { trackSearch } from '../utils/analyticsEvents';

export const SearchPage = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<PostSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    try {
      setLoading(true);
      const params: PostSearchParams = {
        keyword,
        sortType: 'RECENT',
      };
      const data = await postService.searchPosts(params);
      setResults(data.results);
      trackSearch(keyword, data.results.length);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>DeukNet</h1>
        <p style={{ color: '#666' }}>게시글 검색</p>
      </header>

      <div className="box">
        <div className="box-header">검색</div>
        <div className="box-content">
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력하세요..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '8px 20px',
                  background: loading ? '#ccc' : '#0066cc',
                  color: 'white',
                  border: 'none'
                }}
              >
                {loading ? '검색중...' : '검색'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {results.length > 0 && (
        <div className="box">
          <div className="box-header">검색 결과 ({results.length}개)</div>
          <div className="box-content">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>번호</th>
                  <th>제목</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>글쓴이</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>조회</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>작성일</th>
                </tr>
              </thead>
              <tbody>
                {results.map((post, index) => (
                  <tr key={post.id}>
                    <td style={{ textAlign: 'center', color: '#999' }}>
                      {results.length - index}
                    </td>
                    <td>
                      <Link to={`/posts/${post.id}`}>
                        {post.title}
                      </Link>
                      {post.commentCount > 0 && (
                        <span style={{ color: '#0066cc', marginLeft: '5px', fontSize: '12px' }}>
                          [{post.commentCount}]
                        </span>
                      )}
                      {post.categoryName && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          background: '#f0f0f0',
                          color: '#666',
                          fontSize: '11px',
                          borderRadius: '3px'
                        }}>
                          {post.categoryName}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', color: '#666' }}>
                      {post.authorDisplayName}
                    </td>
                    <td style={{ textAlign: 'center', color: '#999' }}>
                      {post.viewCount}
                    </td>
                    <td style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
                      {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && keyword && (
        <div className="box">
          <div className="box-content">
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              검색 결과가 없습니다.
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/">
          <button>홈으로</button>
        </Link>
      </div>
    </div>
  );
};
