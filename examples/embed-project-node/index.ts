import sdk, { Project } from '@stackblitz/sdk';

import './styles.css';

// A dynamically generated WebContainers (`node`) project.
// For `node` projects, npm dependencies must be declared in the
// `package.json` file (the `dependencies` field of the Project is ignored).
const project: Project = {
  title: 'Dynamically Generated Node Project',
  description: 'A Node.js Express server created with the StackBlitz SDK!',
  template: 'node',
  files: {
    'package.json': JSON.stringify(
      {
        name: 'sdk-node-project',
        version: '0.0.0',
        private: true,
        type: 'module',
        scripts: {
          start: 'node index.js',
        },
        dependencies: {
          express: '^4.18.2',
        },
      },
      null,
      2
    ),
    'index.js': `import express from 'express';

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
  res.send('<h1>Hello from a dynamically generated Node project!</h1>');
});

app.listen(port, () => {
  console.log(\`Server listening on http://localhost:\${port}\`);
});
`,
  },
};

function embedProject() {
  const queryParams = new URLSearchParams(window.location.search);

  sdk.embedProject('embed', project, {
    openFile: 'index.js',
    startScript: 'start',
    crossOriginIsolated: queryParams.get('corp') === '1',
  });
}

function toggleCorp(event: Event) {
  const queryParams = new URLSearchParams(window.location.search);
  const isChecked = (event.target as any)?.checked;

  if (isChecked) {
    if (!queryParams.has('corp') || queryParams.get('corp') !== '1') {
      queryParams.set('corp', '1');
    }
  } else {
    queryParams.delete('corp');
  }

  window.location.search = queryParams.toString();
}

function setup() {
  const embedButton = document.querySelector('[name=embed-project]') as HTMLButtonElement;
  const corpCheckbox = document.querySelector('[name=corp]') as HTMLInputElement;

  embedButton.addEventListener('click', embedProject);
  corpCheckbox.addEventListener('change', toggleCorp);

  // mark the checkbox checked if the corp param is already set
  const queryParams = new URLSearchParams(window.location.search);

  corpCheckbox.checked = queryParams.get('corp') === '1';
}

setup();
