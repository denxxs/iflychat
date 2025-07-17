import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Upload, FileText, X } from 'lucide-react';

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (file) {
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (allowedTypes.includes(fileExtension)) {
        onFileUpload(file);
      } else {
        alert('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      }
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-orange-400 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: isDragging ? '#ff6a22' : '#d1d5db',
          backgroundColor: isDragging ? '#fff7ed' : '#f8f9fa'
        }}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1b2f5a' }}>
            <Upload className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: '#1b2f5a' }}>
              Drop your legal document here
            </p>
            <p className="text-xs text-gray-500">
              Or click to browse • PDF, DOC, DOCX up to 10MB
            </p>
          </div>
          
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="transition-all duration-200"
            style={{
              borderColor: '#1b2f5a',
              color: '#1b2f5a'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ff6a22';
              e.target.style.color = 'white';
              e.target.style.borderColor = '#ff6a22';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#1b2f5a';
              e.target.style.borderColor = '#1b2f5a';
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;