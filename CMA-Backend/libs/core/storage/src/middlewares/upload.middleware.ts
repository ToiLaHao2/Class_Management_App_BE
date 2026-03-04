import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { BadRequestError } from '@core/exceptions';

const storage = multer.memoryStorage();

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Not an image! Please upload only images.'));
    }
};

export const uploadImage = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
