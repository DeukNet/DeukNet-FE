import { api } from './api';

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  size: number;
}

export const fileService = {
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>(
      '/api/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};
