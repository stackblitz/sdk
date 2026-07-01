import { genID } from './helpers';

interface MessagePayload {
  [key: string]: any;
}

interface MessagePayloadWithMetadata extends MessagePayload {
  __reqid: string;
  __success: boolean;
  __error?: string;
}

interface MessageData {
  type: string;
  payload: MessagePayloadWithMetadata;
}

interface RequestData {
  type: string;
  payload: MessagePayload;
}

interface PendingResolvers {
  [id: string]: {
    resolve(value: any): void;
    reject(error: string): void;
  };
}

export class RDC {
  private port: MessagePort;
  private pending: PendingResolvers = {};
  private requestTimeout: number;

  constructor(port: MessagePort, requestTimeout: number) {
    this.port = port;
    this.requestTimeout = requestTimeout;
    this.port.onmessage = this.messageListener.bind(this);
  }

  public request<TResult = null>({ type, payload }: RequestData): Promise<TResult | null> {
    return new Promise((resolve, reject) => {
      const id = genID();
      const timeout = setTimeout(() => {
        this.rejectPending(id, type, 'request timed out')
      }, this.requestTimeout);
      this.pending[id] = { 
        resolve: (result: TResult | null) => {
          resolve(result);
          clearTimeout(timeout)
        },
        reject: (e: any) => {
          reject(e);
          clearTimeout(timeout)
        } };
      this.port.postMessage({
        type,
        payload: {
          ...payload,
          // Ensure the payload object includes the request ID
          __reqid: id,
        },
      });
    });
  }

  private resolvePending(payload: MessagePayloadWithMetadata): void{
    const id = payload.__reqid;

    if (this.pending[id]) {
      this.pending[id].resolve(this.cleanResult(payload));
      delete this.pending[id];
    }
  }

  private rejectPending(id: string, type: string, error: string | undefined): void{
    if (this.pending[id]) {
      this.pending[id].reject(error ? `${type}: ${error}` : type);
      delete this.pending[id];
    }
  }

  private messageListener(event: MessageEvent<MessageData>) {
    if (typeof event.data.payload?.__reqid !== 'string') {
      return;
    }

    const { type, payload } = event.data;
    const { __reqid: id, __success: success, __error: error } = payload;

    if(success){
      this.resolvePending(payload);
    }else{
      this.rejectPending(id, type, error);
    }
  }

  private cleanResult(payload: MessagePayloadWithMetadata): MessagePayload | null {
    const result: Partial<typeof payload> = { ...payload };
    delete result.__reqid;
    delete result.__success;
    delete result.__error;
    // Null the result if payload was empty besides the private metadata fields
    return Object.keys(result).length ? result : null;
  }
}
