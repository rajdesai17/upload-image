const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.patch('/upload-profile-image', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const token = req.headers['authorization'];

  if (!token) {
    fs.unlinkSync(filePath);
    return res.status(401).json({ message: 'Missing Authorization token' });
  }

  // Prepare form-data for SSO API
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), originalName);

  try {
    const ssoResponse = await axios.patch(
      'https://devauth.formidium.com/api/v1/user/uploadProfileImage',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: token,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    fs.unlinkSync(filePath);
    // Print the uploaded file path to the terminal
    if (ssoResponse.data && ssoResponse.data.filePath) {
      console.log('Image uploaded to SSO API:', ssoResponse.data.filePath);
    } else {
      console.log('SSO API response:', ssoResponse.data);
    }
    return res.status(200).json(ssoResponse.data);
  } catch (error) {
    fs.unlinkSync(filePath);
    // Log detailed error for debugging
    console.error('SSO API upload error:', {
      message: error.message,
      stack: error.stack,
      response: error.response && {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      },
      config: error.config,
    });
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.listen(5001, () => console.log('Server running on http://localhost:5001')); 