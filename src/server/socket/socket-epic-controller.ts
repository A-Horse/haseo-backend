import * as path from 'path';
import * as fs from 'fs';
import * as R from 'ramda';
import { SocketMessage } from '../../entity/socket-message';
import { Observable, Subject } from 'rxjs';
import { RunnerDaemon } from '../../runner/runner-daemon';
import { authMessage } from './middle/auth';
import { share } from 'rxjs/operators';
import * as WebSocket from 'ws';

export class SocketEpicController {

    public createSocketEpicReactive(message$: Subject<SocketMessage>, daemon: RunnerDaemon, ws: WebSocket) {
        const dirpath = path.join(__dirname, 'epics');
        const wsSubscriptionModules = fs
            .readdirSync(dirpath)
            .filter(filename => /epic.js$/.test(filename)) // ts => js
            .map(filename => {
            return require(path.join(dirpath, filename));
            });

        const epicFns: Array<(Observable, CIDaemon, WebSocket) => Observable<any>> = R.compose(
            R.flatten,
            R.map(R.values)
        )(wsSubscriptionModules);

        const authedMessage$: Observable<SocketMessage> = authMessage(message$, ws).pipe(share());

        const output$ = new Subject<any>();

        epicFns.forEach((epicFn: (Observable, CIDaemon, WebSocket) => Observable<any>): void => {
            epicFn(authedMessage$, daemon, ws).subscribe(output$);
        });

        output$.subscribe((output: object): void => {
            if (ws.readyState !== 1) {
            return;
            }
            ws.send(JSON.stringify(output));
        });
    }
}