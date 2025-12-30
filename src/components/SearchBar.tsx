import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { postService } from '../services/postService';
import '../styles/SearchBar.css';

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT_SEARCHES = 10;

export const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('keyword') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number>();

  // 최근 검색어 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // 최근 검색어 저장
  const saveRecentSearch = (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // 최근 검색어 삭제
  const removeRecentSearch = (searchQuery: string) => {
    try {
      const updated = recentSearches.filter(s => s !== searchQuery);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  // Fetch suggestions
  useEffect(() => {
    // Reset selection when query changes
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length === 0) {
      setSuggestions([]);
      // Don't hide suggestions - keep showing recent searches
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await postService.suggestKeywords(query, 10);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(true);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      const params = new URLSearchParams();
      params.set('keyword', searchQuery.trim());
      navigate(`/posts?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Show suggestions if hidden
      if (!showSuggestions) {
        setShowSuggestions(true);
      }

      // When query exists with suggestions: 0~N-1 = suggestions
      // When query exists without suggestions: only 1 item (current query)
      // When no query: 0~N-1 = recent searches
      const maxIndex = query.trim().length > 0
        ? (suggestions.length > 0 ? suggestions.length - 1 : 0)
        : recentSearches.length - 1;

      // If there are no items, don't change selection
      if (maxIndex < 0) return;

      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Show suggestions if hidden
      if (!showSuggestions) {
        setShowSuggestions(true);
      }
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Tab') {
      // Tab key cycles through suggestions
      const hasItems = (query.trim().length > 0 && suggestions.length > 0) ||
                      (query.trim().length === 0 && recentSearches.length > 0);

      if (hasItems) {
        e.preventDefault();

        if (query.trim().length > 0 && suggestions.length > 0) {
          // Cycle through suggestions, starting from -1 (no selection)
          const nextIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : -1;
          if (nextIndex >= 0) {
            const nextSuggestion = suggestions[nextIndex];
            setQuery(nextSuggestion);
          }
          setSelectedIndex(nextIndex);
        } else if (query.trim().length === 0 && recentSearches.length > 0) {
          // Cycle through recent searches
          const nextIndex = selectedIndex < recentSearches.length - 1 ? selectedIndex + 1 : -1;
          if (nextIndex >= 0) {
            const nextRecent = recentSearches[nextIndex];
            setQuery(nextRecent);
          }
          setSelectedIndex(nextIndex);
        }

        // Make sure suggestions are shown
        if (!showSuggestions) {
          setShowSuggestions(true);
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Only use selected suggestion if explicitly selected (selectedIndex >= 0)
      if (showSuggestions && selectedIndex >= 0) {
        if (query.trim().length > 0) {
          if (suggestions.length > 0 && selectedIndex < suggestions.length) {
            // Has suggestions and one is selected: use selected suggestion
            const selected = suggestions[selectedIndex];
            setQuery(selected);
            handleSearch(selected);
          } else {
            // No suggestions or out of range: search current query
            handleSearch(query);
          }
        } else if (selectedIndex < recentSearches.length) {
          const selected = recentSearches[selectedIndex];
          setQuery(selected);
          handleSearch(selected);
        }
      } else {
        // No selection: search current query as typed
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <div ref={searchRef} className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="검색어를 입력하세요..."
            className="search-input"
          />
          <button
            onClick={() => handleSearch(query)}
            className="search-button"
          >
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

      {showSuggestions && (
        <div className="suggestions-dropdown">
          {query.trim().length > 0 ? (
            suggestions.length > 0 ? (
              /* 검색 제안이 있을 때: 제안 목록만 표시 */
              suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                >
                  <div className="suggestion-content">
                    <svg className="suggestion-icon" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="suggestion-text">{suggestion}</span>
                  </div>
                </button>
              ))
            ) : (
              /* 검색 제안이 없을 때만: 현재 검색어 표시 */
              <button
                onClick={() => handleSearch(query)}
                className={`suggestion-item ${selectedIndex === 0 ? 'selected' : ''}`}
              >
                <div className="suggestion-content">
                  <svg className="suggestion-icon" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="suggestion-text">{query}</span>
                </div>
              </button>
            )
          ) : (
            recentSearches.length > 0 ? (
              <>
                <div className="recent-searches-header">
                  최근 검색어
                </div>
                {recentSearches.map((search, index) => (
                  <div key={index} className={`recent-search-wrapper ${index === selectedIndex ? 'selected' : ''}`}>
                    <button
                      onClick={() => handleSuggestionClick(search)}
                      className="recent-search-button"
                    >
                      <svg className="suggestion-icon" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="suggestion-text">{search}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(search);
                      }}
                      className="recent-remove-button"
                    >
                      <svg className="suggestion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              <div className="empty-message">
                최근 검색어가 없습니다
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
