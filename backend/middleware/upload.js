const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configuration du storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', // Dossier dans Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: 'limit', // Limite la taille max sans déformer
        quality: 'auto:good',
      },
    ],
  },
});

// Configuration Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max par fichier
  },
  fileFilter: (req, file, cb) => {
    // Vérifier le type MIME
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.'), false);
    }
  },
});

module.exports = upload;