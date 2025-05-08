import React, { useState } from 'react';
import axios from 'axios';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ImageUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  // Retrieve access token from localStorage
  const accessToken = localStorage.getItem('accessToken');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setStatus('Invalid file type. Please select a JPEG, PNG, GIF, or WEBP image.');
      setFile(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStatus(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setStatus('');
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Select a valid image file first.');
      return;
    }
    if (!accessToken) {
      setStatus('No access token found. Please log in.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setStatus('Uploading...');
    try {
      const response = await axios.patch('http://localhost:5001/upload-profile-image', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus(`Uploaded: ${response.data.filePath || JSON.stringify(response.data)}`);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setStatus('Unauthorized. Please log in again.');
      } else {
        setStatus('Upload failed. Please try again.');
      }
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Upload Profile Image</h2>
      <input type="file" accept="image/*" onChange={handleChange} />
      <button onClick={handleUpload} disabled={!file}>Upload</button>
      <p>{status}</p>
    </div>
  );
};

export default ImageUploader; 