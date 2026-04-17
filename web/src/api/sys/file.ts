import request from 'src/api/request';

export interface UploadResult {
  url: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/sys/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
