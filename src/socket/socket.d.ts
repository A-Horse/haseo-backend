declare interface SocketMessage {
  type: string;
  payload: any;
  meta: { jwt: string; user: User; [key: string]: any };
}

declare interface ActionType {
  REQUEST: string;
  SUCCESS: string;
  FAILURE: string;
}
