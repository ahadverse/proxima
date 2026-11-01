import type { FileUploadTicketDTO, UploadedFileDTO } from '@/shared';
import { API_BASE, ApiError, api, refreshSession } from './api';
import { compressImage } from './image';

type Progress = (percent: number) => void;

interface XhrResult {
  status: number;
  body: { success?: boolean; data?: UploadedFileDTO; code?: string; message?: string } | null;
}

function send(method: 'POST' | 'PUT', url: string, body: XMLHttpRequestBodyInit, options: { headers?: Record<string, string>; withCredentials?: boolean; onProgress?: Progress }) {
  return new Promise<XhrResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = Boolean(options.withCredentials);
    xhr.responseType = 'json';
    for (const [key, value] of Object.entries(options.headers ?? {})) xhr.setRequestHeader(key, value);
    // Hold at 99% until the server confirms the file is stored.
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.response });
    xhr.onerror = () => reject(new ApiError(0, 'NETWORK_ERROR', 'Upload failed. Check your connection and try again.'));
    xhr.send(body);
  });
}

/** Images are shrunk to WebP in the browser, then the API checks them and stores them in the public bucket. */
async function uploadImage(file: File, onProgress?: Progress): Promise<UploadedFileDTO> {
  const image = await compressImage(file);
  const post = () => {
    const form = new FormData();
    form.append('file', image);
    return send('POST', `${API_BASE}/admin/uploads/image`, form, { withCredentials: true, onProgress });
  };

  let result = await post();
  if (result.status === 401 && (await refreshSession())) {
    onProgress?.(0);
    result = await post();
  }
  if (result.status === 413) {
    throw new ApiError(413, 'FILE_TOO_LARGE', 'This image is too large, even after compression. Try a smaller one.');
  }
  if (result.status < 200 || result.status >= 300 || !result.body?.success || !result.body.data) {
    throw new ApiError(result.status, result.body?.code ?? 'UPLOAD_FAILED', result.body?.message ?? `Upload failed (${result.status})`);
  }
  return result.body.data;
}

/** Source zips can be gigabytes, so the browser sends them straight to private storage with a signed URL. */
async function uploadSourceZip(file: File, onProgress?: Progress): Promise<UploadedFileDTO> {
  const { data: ticket } = await api.post<FileUploadTicketDTO>('/admin/uploads/file', { fileName: file.name, size: file.size });
  let result: XhrResult;
  try {
    result = await send('PUT', ticket.uploadUrl, file, { headers: ticket.headers, onProgress });
  } catch {
    throw new ApiError(0, 'STORAGE_UNREACHABLE', 'Could not reach file storage. Check the bucket CORS settings for this admin URL.');
  }
  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(result.status, 'UPLOAD_FAILED', `Storage rejected the upload (${result.status}). Try again.`);
  }
  return { key: ticket.key, url: null, name: file.name, size: file.size };
}

export function uploadFile(file: File, kind: 'image' | 'file', onProgress?: Progress): Promise<UploadedFileDTO> {
  return kind === 'image' ? uploadImage(file, onProgress) : uploadSourceZip(file, onProgress);
}
