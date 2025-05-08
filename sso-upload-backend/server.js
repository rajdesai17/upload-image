const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.patch('/upload-profile-image', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  // Simulate SSO upload delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Clean up local file
  fs.unlinkSync(filePath);

  // Respond with a fake file path or success message
  res.json({
    message: 'Mock upload successful!',
    filePath: `/mock/path/${req.file.originalname}`
  });
});

app.listen(5001, () => console.log('Server running on http://localhost:5001')); 