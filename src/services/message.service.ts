import {Injectable, Signal, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _message: WritableSignal<string | null>;

  constructor() {
    this._message = signal<string | null>(null)
  }

  get message():Signal<string | null> {
    return this._message.asReadonly();
  }

  setMessage(value: string | null):void {
    this._message.set(value);
  }
}
