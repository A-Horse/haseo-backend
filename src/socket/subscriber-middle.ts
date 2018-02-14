import { CIDaemon } from 'src/platform/ci-daemon';
import { Project } from '../platform/project/project';
import * as WebSocket from 'ws';

export function insureProjectExist(
  ws: WebSocket,
  daemon: CIDaemon,
  option: {
    errorType: string;
  }
): (message: SocketMessage) => boolean {
  return (message: SocketMessage): boolean => {
    const payload: { name: string; offset: number; limit: number } = message.payload;
    const project: Project = daemon.getProjectByName(payload.name);
    if (!project) {
      ws.send(
        JSON.stringify({
          type: option.errorType,
          error: true,
          payload: `${payload.name} project not exist.`
        })
      );
      return false;
    }
    return true;
  };
}
