export enum MessageType {
  USER_IDENTIFICATION = "USER_IDENTIFICATION",
  BOT_IDENTIFICATION = "BOT_IDENTIFICATION",
  BROCHURE_READY = "BROCHURE_READY",
  ERROR = "ERROR",
  DISCONNECT = "disconnect"
}

export class Message {
  constructor(
    public data: string,
    public files: string[]
  ) {}
}

export class ResponseObj {
  public status: number;
  public message: string;
  public data: any;

  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  public toJson() {
    return { status: this.status, message: this.message, data: this.data };
  }

  public toJsonString() {
    return JSON.stringify({ status: this.status, message: this.message, data: this.data });
  }
}
