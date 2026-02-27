const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const s3 = require('../config/s3');

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

// 1. Multer Memory Storage (file buffer mein rakhega, direct S3 pe bhejenge)
const storage = multer.memoryStorage();

// 2. Filter logic (Sirf images allow karne ke liye)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// 3. Final Multer Setup
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// 4. S3 Upload Helper — image ko compress + resize karke S3 pe upload karega
const uploadToS3 = async (file) => {
    // Sharp se image compress + resize
    // - 1000x1000 max size, aspect ratio maintain
    // - WebP format (best compression for web)
    // - quality 75 (good balance: file size vs visual quality)
    // - effort 6 (higher compression effort for smaller files)
    const resizedBuffer = await sharp(file.buffer)
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

    const key = `JewelNest_Products/${Date.now()}-${file.originalname.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '')}.webp`;

    const s3Upload = new Upload({
        client: s3,
        params: {
            Bucket: BUCKET,
            Key: key,
            Body: resizedBuffer,
            ContentType: 'image/webp',
        },
    });

    await s3Upload.done();

    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    return { url, key };
};

// 5. S3 Delete Helper — S3 se image delete karega
const deleteFromS3 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });
    await s3.send(command);
};

module.exports = { upload, uploadToS3, deleteFromS3 };