import React, { useState,useRef, useEffect } from 'react';
import { uploadImg } from '@/services/uploadImg/api';
import { addFile } from '@/services/Personal Center/api';
import './index.less';

interface FileWithPreview extends File {
  preview: string;
  status: 'pending' | 'loading' | 'success' | 'failed'; // 上传状态
}

interface BatchUploadProps {
  email: string;
  isReset:boolean;
}

const BatchUpload: React.FC<BatchUploadProps> = ({ email ,isReset}) => {
  const [fileList, setFileList] = useState<FileWithPreview[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  let count = useRef(0);

  // 清空文件列表
    const clearFileList = () => {
        setFileList([]);
        setFiles(null);
        count.current = 0;
        const fileInput=document.querySelector('.file-input');
        if(fileInput){
          fileInput.value='';
          fileInput.files=null;
        }
    };
    useEffect(()=>{
        clearFileList();
        console.log('isReset:',isReset);
    },[isReset])

  // 选择文件并预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let filesChoosed = e.target.files;
    if (!filesChoosed) return;

    // 过滤filesChoosed，确保里面内容不存在于fileList中
    const filesChoosedFiltered = Array.from(filesChoosed).filter((file) => {
      return !fileList.find((f) => f.name === file.name);
    });
    if (!filesChoosedFiltered) return;

    // 更新 files
    const dataTransfer = new DataTransfer();
    setFiles((prevFiles) => {
      if (!prevFiles){
        count.current = filesChoosedFiltered.length;
        return filesChoosedFiltered;
      }
      Array.from(prevFiles).forEach((file) => dataTransfer.items.add(file));
      Array.from(filesChoosedFiltered).forEach((file) => dataTransfer.items.add(file));
      const fileInput = document.querySelector('.file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.files = dataTransfer.files; // 更新 input 的 files 属性
      }
      count.current = dataTransfer.files.length;
      return dataTransfer.files;
    });

    // 转换文件为数组并添加预览
    const newFiles: FileWithPreview[] = Array.from(filesChoosedFiltered).map((file) => ({
      ...file,
      preview: URL.createObjectURL(file), // 生成文件的预览 URL
      status: 'pending', // 初始状态为待上传
      name: file.name,
    }));

    setFileList((prevFileList) => [...prevFileList, ...newFiles]);
  };

  const handleRemove = (file: FileWithPreview) => {
    // 删除 fileList 中的文件（只影响预览列表）
    setFileList((prevFileList) =>
      prevFileList.filter((f) => f.preview !== file.preview)
    );

    // 删除 files 中的文件
    handleRemoveFile(file);
  };

  const handleRemoveFile = (file: FileWithPreview) => {
    // 过滤掉被删除的文件，更新 files 状态
    if (!files) return;

    const updatedFiles = Array.from(files).filter((f) => f.name !== file.name);
    const dataTransfer = new DataTransfer();
    updatedFiles.forEach((f) => dataTransfer.items.add(f));

    // 使用 setFiles 更新状态
    setFiles(dataTransfer.files);

    // 访问 file input 并更新其 files
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.files = dataTransfer.files; // 更新 input 的 files 属性
    }
    count.current = dataTransfer.files.length;
    console.log('Updated files:', dataTransfer.files);
  };

  // 请求队列
  const handQueue = (
    reqs: (() => Promise<any>)[] // 请求总数
  ) => {
    const concurrency = 6; // 最大并发数
    const queue: (() => Promise<any>)[] = []; // 请求池
    let current = 0;
  
    const dequeue = () => {
      while (current < concurrency && queue.length) {
        current++;
        const requestPromiseFactory = queue.shift(); // 出列
        requestPromiseFactory()
          .then(() => { // 成功的请求逻辑
              --count.current
              if(count.current === 0){
                setFiles(null);
                const fileInput=document.querySelector('.file-input');
                if(fileInput){
                  fileInput.value='';
                  fileInput.files=null;
                }
                count.current=0;
              }
          })
          .catch(error => { // 失败
            console.log(error);
          })
          .finally(() => {
            current--;
            dequeue();
          });
      }
    };
  
    return (requestPromiseFactory: () => Promise<any>) => {
      queue.push(requestPromiseFactory); // 入队
      dequeue();
    };
  };

  // 文件上传
  const handleUpload = async () => {
    const enqueue = handQueue([]); // 创建请求池

    if (!files) return;
    const uploadPromises = Array.from(files).map((file) => {
      const formData = new FormData();
      formData.append('fileupload', file); // 这里还是使用 file ，但 file 是文件对象

      return () => {
        return uploadImg(formData)
          .then(async (res) => {
            await addFile({ name: file.name, url: res.url, owner: email });
            setFileList((prevFileList) =>
              prevFileList.map((f) =>
                f.name === file.name ? { ...f, status: 'success' } : f
              )
            );
          })
          .catch(() => {
            setFileList((prevFileList) =>
              prevFileList.map((f) =>
                f.name === file.name ? { ...f, status: 'failed' } : f
              )
            );
          });
      };
    });

    // 将每个上传请求加入到请求队列中
    uploadPromises.forEach((uploadPromiseFactory) => enqueue(uploadPromiseFactory));
  };

  return (
    <div className="batch-upload">
      <h2 className="upload-title">Upload Images</h2>

      {/* 文件选择输入框 */}
      <div className="file-input-wrapper">
        <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="file-input"
        />
        <label htmlFor="file-upload" className="custom-file-upload">
            选择文件
        </label>
      </div>

      {/* 图片预览区 */}
      <div className="image-preview">
        {fileList.length > 0 && (
          <ul className="preview-list">
            {fileList.map((file) => (
              <li key={file.name} className="preview-item">
                <div className="preview-image">
                  <img src={file.preview} alt={file.name} />
                </div>
                <div className="file-info">
                  <span>{file.name}</span>
                  <div className="status-text">
                    {file.status === 'loading' ? (
                      <span className="loading">上传中...</span>
                    ) : file.status === 'success' ? (
                      <span className="success">成功</span>
                    ) : file.status === 'failed' ? (
                      <span className="failed">上传失败</span>
                    ) : (
                      <span className="waiting">等待上传</span>
                    )}
                  </div>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(file)}>
                  删除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 上传按钮 */}
      <button
        className="upload-btn"
        onClick={handleUpload}
        disabled={fileList.length === 0}
      >
        上传 {count.current} 张图片
      </button>
    </div>
  );
};

export default BatchUpload;
