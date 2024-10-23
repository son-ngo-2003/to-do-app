class Message<T> {
    private readonly isSuccess: boolean;
    private readonly data: T;
    private readonly error: string;

    constructor(isSuccess: boolean, data?: T, error?: string) {
        this.isSuccess = isSuccess;
        this.data = data as T;
        this.error = error ?? '';
    }

    public static success<T>(data: T): Message<T> {
        return new Message<T>(true, data);
    }

    public static failure<T>(error: any): Message<T> {
        let errorMessage: string = 'Unknown error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        return new Message<T>(false, undefined, errorMessage);
    }

    public getIsSuccess(): boolean {
        return this.isSuccess;
    }

    public getData(): T {
        return this.data;
    }

    public getError(): string {
        return this.error;
    }
}

export default Message;