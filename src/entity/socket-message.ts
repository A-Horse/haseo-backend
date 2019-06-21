import { User } from "./user";

export class SocketMessage {
  public type: string;
  public payload: any;
  public meta: { jwt: string; user: User; [key: string]: any };
}