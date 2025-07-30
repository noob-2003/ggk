import React, { useState, useRef } from 'react';
import './FileUpload.css';

function FileUpload() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ 성공 메시지 상태 추가
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleIncomingFiles = (incomingFiles) => {
    setSelectedFiles(prevFiles => {
      const newFiles = Array.from(incomingFiles);

      const uniqueNewFiles = newFiles.filter(
        newFile => !prevFiles.some(
          prevFile => prevFile.name === newFile.name && prevFile.size === newFile.size
        )
      );

      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files.length) {
      handleIncomingFiles(event.target.files);
      event.target.value = '';
    }
  };

  const handleDragEnter = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleIncomingFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

 /* const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) {
      alert("업로드할 파일을 먼저 선택해 주세요.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });  
  };*/

  const handleUpload = async () => {
    if (isUploading) {
      setUploadMessage("업로드 중입니다!");
      return;
    }

    setIsUploading(true);
    setUploadMessage("");
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append("file", file)); // 파일 추가

      const response = await fetch("http://211.42.159.18:8080/api/csv/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage("업로드 성공 ✅");
        setTimeout(() => {
          setIsUploading(false);
        }, 30000); // 30초 딜레이
      } else {
        setSuccessMessage("업로드 실패 ❌");
        setIsUploading(false);
      }
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      setSuccessMessage("서버 오류 ❌");
      setIsUploading(false);
    }
  };


  return (
    <div className="page-wrapper">
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
  
        <button type="button" className="submit-btn" onClick={handleUpload} disabled={isUploading}>
          {isUploading ? "업로드 중입니다..." : "Submit"}
        </button>
        {uploadMessage && <div style={{ marginTop: "10px", color: "red" }}>{uploadMessage}</div>}
      
        {/* 업로드 성공 메시지 표시 */}
        {successMessage && (
          <div style={{ marginTop: "20px", color: "green", fontWeight: "bold" }}>
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;