import Project from '../lib/project';
import path from 'path';

describe('Project', () => {
  test('project', () => {
    const project = new Project(path.join(__dirname, '/__mock_project__/'), 'TEST-ONE');
  });
});
