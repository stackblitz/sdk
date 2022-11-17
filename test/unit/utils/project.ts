import type { Project } from '../../../src/interfaces';

export function getTestProject(project?: Partial<Project>): Project {
  return {
    title: 'Test Project',
    description: 'This is a test',
    template: 'javascript',
    files: {
      'package.json': `{
  "dependencies": {"cowsay": "1.5.0"}
}`,
      'index.js': `import cowsay from 'cowsay';
console.log(cowsay('Hello world!'));
`,
    },
    ...project,
  };
}