import { Observable } from "rxjs";
import { filter } from "rxjs/operators";

// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/filter';

// export function ofType<SocketMessage>(
//   this: Observable<SocketMessage>,
//   type: string
// ): Observable<SocketMessage> {
//   return this.filter((message: any) => {
//     return message.type === type;
//   });
// }

// Observable.prototype.ofType = ofType;

// declare module 'rxjs/Observable' {
//   interface Observable<T> {
//     ofType: typeof ofType;
//   }
// }

export const ofType = (
  type: string
) => <T>(source: Observable<T>) => {
  return source.pipe(filter((action: any) => action.type === type));
}