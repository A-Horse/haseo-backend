declare interface SocketMessage {
  type: string;
  payload: any;
  meta: { jwt: string; user: User; [key: string]: any };
}
