const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const saveBinaryFiles = async (images, folderName) => {
    const imagesMetadata = [];
    const uploadDir = path.join(__dirname, `../uploads/${folderName}`);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const image of images) {
        const processedImage = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toBuffer();

        const randomName = Math.random().toString(36).substr(2, 9);
        const extension = path.extname(image.originalname);
        const filePath = path.join(uploadDir, `${randomName}${extension}`);
        fs.writeFileSync(filePath, processedImage);

        const imageMetadata = `${randomName}${extension}`;
        imagesMetadata.push(imageMetadata);
    }

    return imagesMetadata;
};

const removeBinaryFile = async (imageToRemove, folderName) => {
    const uploadDir = path.join(__dirname, `../uploads/${folderName}`);

    if (!fs.existsSync(uploadDir)) {
        return;
    }

    const filePath = path.join(uploadDir, imageToRemove);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

module.exports = { saveBinaryFiles, removeBinaryFile };