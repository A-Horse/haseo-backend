import { CIDaemon } from '../../../runner/ci-daemon';
import { Project } from '../../../runner/project/project';
import { Observable } from 'rxjs/Observable';

export function projectExistMiddle(
  daemon: CIDaemon,
  type: string,
  operationFn: (SocketMessage) => any
) {
  return (message: SocketMessage): any => {
    const payload: { name: string; offset: number; limit: number } = message.payload;
    const project: Project = daemon.getProjectByName(payload.name);
    if (!project) {
      return {
        type,
        error: true,
        payload: `${payload.name} project not exist.`
      };
    }
    return operationFn(message);
  };
}
