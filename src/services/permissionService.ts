import { api } from './api';
import type { AnonymousAccessStatusResponse, RequestAnonymousAccessRequest } from '../types/api';

export const permissionService = {
  /**
   * 익명 권한 신청
   * 비밀번호를 입력하여 익명 작성/조회 권한을 신청합니다.
   * @param password 익명 권한 비밀번호
   * @throws 401 - 비밀번호 불일치
   * @throws 404 - 비밀번호 미설정
   */
  requestAnonymousAccess: async (password: string): Promise<void> => {
    const request: RequestAnonymousAccessRequest = { password };
    await api.post('/api/permissions/anonymous', request);
  },

  /**
   * 익명 권한 상태 조회
   * 현재 사용자의 익명 접근 권한 보유 여부를 확인합니다.
   * @returns 익명 접근 권한 보유 여부
   */
  checkAnonymousAccess: async (): Promise<AnonymousAccessStatusResponse> => {
    const response = await api.get<AnonymousAccessStatusResponse>('/api/permissions/anonymous');
    return response.data;
  },
};
