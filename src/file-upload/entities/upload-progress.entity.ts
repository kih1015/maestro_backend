/**
 * 업로드 진행 상태 엔터티
 */
export class UploadProgress {
    readonly status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
    readonly percentage: number;
    readonly message: string;
    readonly processedRecords: number;
    readonly totalRecords: number;
    readonly error?: string;
    readonly timestamp: Date;

    constructor(params: {
        status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
        percentage: number;
        message: string;
        processedRecords: number;
        totalRecords: number;
        error?: string;
        timestamp: Date;
    }) {
        this.status = params.status;
        this.percentage = params.percentage;
        this.message = params.message;
        this.processedRecords = params.processedRecords;
        this.totalRecords = params.totalRecords;
        this.error = params.error;
        this.timestamp = params.timestamp;
    }

    static pending(): UploadProgress {
        return new UploadProgress({
            status: 'pending',
            percentage: 0,
            message: 'Upload pending',
            processedRecords: 0,
            totalRecords: 0,
            timestamp: new Date(),
        });
    }

    static uploading(percentage: number, message: string): UploadProgress {
        return new UploadProgress({
            status: 'uploading',
            percentage,
            message,
            processedRecords: 0,
            totalRecords: 0,
            timestamp: new Date(),
        });
    }

    static processing(processedRecords: number, totalRecords: number, message: string): UploadProgress {
        const percentage = totalRecords > 0 ? Math.floor((processedRecords / totalRecords) * 100) : 0;
        return new UploadProgress({
            status: 'processing',
            percentage,
            message,
            processedRecords,
            totalRecords,
            timestamp: new Date(),
        });
    }

    static completed(processedRecords: number, message: string): UploadProgress {
        return new UploadProgress({
            status: 'completed',
            percentage: 100,
            message,
            processedRecords,
            totalRecords: processedRecords,
            timestamp: new Date(),
        });
    }

    static failed(error: string): UploadProgress {
        return new UploadProgress({
            status: 'failed',
            percentage: 0,
            message: 'Upload failed',
            processedRecords: 0,
            totalRecords: 0,
            error,
            timestamp: new Date(),
        });
    }
}
