import { IError } from '../interfaces/i-error';

export class ErrorMessage implements IError {
  status: number;
  message: string;
  timestamp: Date;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
    this.timestamp = new Date();
  }
}
