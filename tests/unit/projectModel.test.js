const mongoose = require('../../server/node_modules/mongoose');
const Project = require('../../server/models/Project');

const validProject = () => ({
  user: new mongoose.Types.ObjectId(),
  title: 'Skill Platform',
  technologies: ['React', 'Node.js'],
});

describe('Project model validation', () => {
  test('accepts a valid project with string technologies', () => {
    const error = new Project(validProject()).validateSync();

    expect(error).toBeUndefined();
  });

  test('requires a user reference', () => {
    const project = new Project(validProject());
    project.user = undefined;

    expect(project.validateSync().errors.user).toBeDefined();
  });

  test('requires a project title', () => {
    const project = new Project(validProject());
    project.title = undefined;

    expect(project.validateSync().errors.title).toBeDefined();
  });

  test('accepts optional project fields with their defaults', () => {
    const project = new Project(validProject());

    expect(project.description).toBe('');
    expect(project.github).toBe('');
    expect(project.liveDemo).toBe('');
    expect(project.imageUrl).toBe('');
  });

  test('accepts an array of technology names', () => {
    const project = new Project({
      ...validProject(),
      technologies: ['TypeScript', 'MongoDB'],
    });

    expect(project.validateSync()).toBeUndefined();
  });

  test('casts technology values according to the existing String schema', () => {
    const project = new Project({
      ...validProject(),
      technologies: ['React', 123],
    });

    expect(project.validateSync()).toBeUndefined();
    expect(project.technologies[1]).toBe('123');
  });
});
