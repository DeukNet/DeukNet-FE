/**
 * 유튜브 URL에서 비디오 ID를 추출합니다.
 * 지원 형식:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * 텍스트에서 유튜브 URL을 찾습니다.
 */
export const findYoutubeUrls = (text: string): string[] => {
  const urlPattern = /(https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:[^\s])*)/g;
  const matches = text.match(urlPattern);
  return matches || [];
};

/**
 * 유튜브 비디오 ID로부터 임베드 URL을 생성합니다.
 */
export const getYoutubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * 텍스트 내의 유튜브 링크를 임베드 플레이어로 치환합니다.
 */
export const replaceYoutubeLinksWithEmbeds = (content: string): string => {
  const youtubeUrls = findYoutubeUrls(content);

  let result = content;

  youtubeUrls.forEach((url) => {
    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      const embedUrl = getYoutubeEmbedUrl(videoId);
      const embedHtml = `
<div class="youtube-embed-container">
  <iframe
    src="${embedUrl}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>`;

      // URL을 임베드 HTML로 치환
      result = result.replace(url, embedHtml);
    }
  });

  return result;
};
