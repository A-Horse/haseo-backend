import { WebSocketHelper } from 'src/socket/websocket-helper';
import { CIDaemon } from 'src/ci-daemon';
import { Project } from 'src/module/project/project';
import { Socket } from 'net';

export function insureProjectExist(
  wsh: WebSocketHelper,
  daemon: CIDaemon,
  option: {
    errorType: string;
  }
): (message: SocketMessage) => boolean {
  return (message: SocketMessage): boolean => {
    const payload: { name: string; offset: number; limit: number } = message.payload;
    const project: Project = daemon.getProjectByName(payload.name);
    if (!project) {
      wsh.sendJSON({
        type: option.errorType,
        error: true,
        payload: `${payload.name} project not exist.`
      });
      return false;
    }
    return true;
  };
}
