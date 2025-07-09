import React, { useState, useRef } from 'react';
import './FileUpload.css';

function FileUpload() {
  // 선택된 파일 목록 (배열)
  const [selectedFiles, setSelectedFiles] = useState([]);
  // 드래그 앤 드랍 시 UI 변경용 (boolean)
  const [isDragOver, setIsDragOver] = useState(false);
  // 숨긴 <input type="file">에 접근하기 위한 참조
  const fileInputRef = useRef(null);

  // 파일 누적 및 중복 방지
  const handleIncomingFiles = (incomingFiles) => {
    setSelectedFiles(prevFiles => {
      const newFiles = Array.from(incomingFiles);

      // 중복되지 않는 파일만 필터링
      const uniqueNewFiles = newFiles.filter(
        newFile => !prevFiles.some(
          prevFile => prevFile.name === newFile.name && prevFile.size === newFile.size
        )
      );

      // 중복되지 않은 새 파일들 추가해 반환
      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  // browse 클릭
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // 파일 탐색기에서 파일 선택
  const handleFileChange = (event) => {
    if (event.target.files.length) {
      handleIncomingFiles(event.target.files);
      
      event.target.value = '';
    }
  };

  // 드래그 앤 드랍 이벤트 핸들러
  const handleDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => { // 드랍 시 파일 받아서 추가
    e.preventDefault();
    setIsDragOver(false);
    handleIncomingFiles(e.dataTransfer.files);
  };

  // 특정 파일 제거
  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  // 제출 버튼 클릭
  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("업로드할 파일을 먼저 선택해 주세요.");
      return;
    }
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    // 실제 서버 전송 로직...
  };

  return (
    <div className="upload-container">
      <h1>Upload a file</h1>

      <div
        className={`drop-zone ${isDragOver ? 'dragover' : ''}`}
        onClick={handleBrowseClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          hidden
        />
        <p>
          Drag and drop files here, or{' '}
          <span className="browse-link" onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}>
            browse
          </span>{' '}
          your computer.
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-list-container">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-list-item">
              <span>{file.name}</span>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => handleRemoveFile(file)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="submit-btn" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

export default FileUpload;