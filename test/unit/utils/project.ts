import type { Project } from '$src/index';

export function getTestProject(project?: Partial<Project>): Project {
  return {
    title: 'Test Project',
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
