export interface IChannel {
  send(message: string, receiver: string): Promise<any>;
}
