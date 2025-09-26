import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TempFileStorageService {
    private readonly logger = new Logger(TempFileStorageService.name);

    private ensureTempDir(): string {
        const tempDir = path.join(process.cwd(), 'temp', 'uploads');
        this.logger.debug(`Ensuring temp directory exists: ${tempDir}`);

        try {
            if (!fs.existsSync(tempDir)) {
                this.logger.debug('Creating temp directory...');
                fs.mkdirSync(tempDir, { recursive: true });
                this.logger.debug('Temp directory created successfully');
            } else {
                this.logger.debug('Temp directory already exists');
            }
            return tempDir;
        } catch (error) {
            this.logger.error('Failed to create temp directory', error);
            throw error;
        }
    }

    private sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    async saveFile(file: Express.Multer.File, fileName?: string): Promise<{ path: string; size: number }> {
        try {
            this.logger.debug('Starting file save process');
            this.logger.debug(
                `File info: originalname=${file.originalname}, mimetype=${file.mimetype}, size=${file.size}`,
            );
            this.logger.debug(`Buffer exists: ${!!file.buffer}, Buffer length: ${file.buffer?.length || 0}`);

            if (!file.buffer || file.buffer.length === 0) {
                throw new Error('File buffer is empty or missing');
            }

            const tempDir = this.ensureTempDir();
            const sanitized = this.sanitizeFileName(fileName || file.originalname || 'upload');
            const tempPath = path.join(tempDir, `${Date.now()}_${sanitized}`);

            this.logger.debug(`Saving file to: ${tempPath}`);

            await fs.promises.writeFile(tempPath, file.buffer);
            this.logger.debug('File written successfully');

            const stats = await fs.promises.stat(tempPath);
            this.logger.debug(`File saved - size: ${stats.size} bytes`);

            return { path: tempPath, size: stats.size };
        } catch (error) {
            this.logger.error('Failed to save file', error);
            throw error;
        }
    }

    async remove(filePath: string): Promise<void> {
        try {
            if (!filePath || !fs.existsSync(filePath)) return;

            let retries = 3;
            while (retries > 0) {
                try {
                    fs.unlinkSync(filePath);
                    break;
                } catch (err) {
                    if ((err as NodeJS.ErrnoException)?.code === 'EBUSY' && retries > 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        retries -= 1;
                    } else {
                        throw err;
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to remove temp file:', e);
        }
    }
}
