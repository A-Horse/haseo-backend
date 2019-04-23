import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

export function ofType<SocketMessage>(
  this: Observable<SocketMessage>,
  type: string
): Observable<SocketMessage> {
  return this.filter((message: any) => {
    return message.type === type;
  });
}

Observable.prototype.ofType = ofType;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    ofType: typeof ofType;
  }
}
