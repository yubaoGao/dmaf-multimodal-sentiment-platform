import { completeUpload, initUpload, uploadChunk } from '../api/client';
import { UploadFileType } from '../api/types';

export interface UploadSourceFile {
  file: File;
  fileType: UploadFileType;
}

export interface ChunkUploadOptions {
  taskName: string;
  files: UploadSourceFile[];
  onProgress?: (progress: number, currentFileName: string) => void;
}

function splitFile(file: File, chunkSize: number) {
  const chunks: Blob[] = [];
  for (let start = 0; start < file.size; start += chunkSize) {
    chunks.push(file.slice(start, start + chunkSize));
  }
  return chunks;
}

export async function runChunkUpload(options: ChunkUploadOptions) {
  const session = await initUpload({
    taskName: options.taskName,
    files: options.files.map((item) => ({
      fileName: item.file.name,
      fileSize: item.file.size,
      fileType: item.fileType,
    })),
  });

  const totalBytes = options.files.reduce((sum, item) => sum + item.file.size, 0);
  let uploadedBytes = 0;

  for (const source of options.files) {
    const chunks = splitFile(source.file, session.chunkSize);
    for (const [index, chunk] of chunks.entries()) {
      const formData = new FormData();
      formData.append('uploadId', session.uploadId);
      formData.append('fileName', source.file.name);
      formData.append('fileType', source.fileType);
      formData.append('chunkIndex', String(index));
      formData.append('totalChunks', String(chunks.length));
      formData.append('chunk', chunk, source.file.name);
      await uploadChunk(formData);
      uploadedBytes += chunk.size;
      options.onProgress?.(Math.round((uploadedBytes / totalBytes) * 100), source.file.name);
    }
  }

  return completeUpload({
    uploadId: session.uploadId,
    taskName: options.taskName,
  });
}
