import Project from '../lib/project';
import path from 'path';

describe('Project', () => {

  test('project', () => {
    console.log(path.join(__dirname, '/__mock_project__/'));
    const project =  new Project(path.join(__dirname, '/__mock_project__/'), 'TEST-ONE');
  });


});
