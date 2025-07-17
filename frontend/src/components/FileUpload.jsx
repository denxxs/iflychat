import React, { useRef } from 'react';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <Button
        onClick={handleUploadClick}
        variant="outline"
        className="w-full transition-all duration-200 hover:shadow-md"
        style={{ 
          borderColor: '#6B5B95',
          color: '#6B5B95'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#F5A623';
          e.target.style.color = 'white';
          e.target.style.borderColor = '#F5A623';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#6B5B95';
          e.target.style.borderColor = '#6B5B95';
        }}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload PDF or Word Document
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUpload;