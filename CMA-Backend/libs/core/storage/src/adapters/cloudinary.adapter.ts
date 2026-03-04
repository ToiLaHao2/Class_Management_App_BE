import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { storageConfig } from '@core/config';

interface UploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

class CloudinaryAdapter {
    private _connected: boolean = false;

    connect(): void {
        if (this._connected) return;

        const { cloudName, apiKey, apiSecret } = storageConfig;

        if (!cloudName || !apiKey || !apiSecret) {
            console.warn('⚠️ Cloudinary config is missing. Upload will fail.');
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        this._connected = true;
        console.log('✅ Cloudinary Configured Successfully!');
    }

    async uploadImageFromBuffer(buffer: Buffer, folder: string = 'cma_general'): Promise<UploadResult> {
        if (!this._connected) this.connect();

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    const res = result as UploadApiResponse;
                    resolve({
                        url: res.secure_url,
                        publicId: res.public_id,
                        width: res.width,
                        height: res.height
                    });
                }
            );

            const bufferStream = new Readable();
            bufferStream.push(buffer);
            bufferStream.push(null);
            bufferStream.pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<unknown> {
        if (!this._connected) this.connect();
        return cloudinary.uploader.destroy(publicId);
    }
}

export const cloudinaryAdapter = new CloudinaryAdapter();
