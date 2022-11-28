import sdk from '@stackblitz/sdk';

import './styles.css';

type Repo = { github: string; openFile: string };

const REPOS: Record<string, Repo> = {
  angular: {
    github: 'gothinkster/angular-realworld-example-app',
    openFile: 'README.md',
  },
  vite: {
    github: 'vitejs/vite/tree/main/packages/create-vite/template-vanilla',
    openFile: 'index.html',
  },
};

let selectedRepo: Repo = REPOS.angular;

/**
 * Embed the project
 */
async function embedProject() {
  sdk.embedGithubProject('embed', selectedRepo.github, {
    height: 400,
    openFile: selectedRepo.openFile,
  });
}

/**
 * Open the project in a new window on StackBlitz
 */
function openProject() {
  sdk.openGithubProject(selectedRepo.github, {
    openFile: selectedRepo.openFile,
  });
}

function setRepo(value: string) {
  selectedRepo = REPOS[value];
  // if already embedded, update the embed
  if (document.getElementById('embed')?.nodeName === 'IFRAME') {
    embedProject();
  }
}

function setup() {
  const select = document.querySelector('[name=set-repo]');
  const embedButton = document.querySelector('[name=embed-project]');
  const openButton = document.querySelector('[name=open-project]');
  select!.addEventListener('change', (event) => {
    setRepo((event.target as HTMLSelectElement).value);
  });
  embedButton!.addEventListener('click', embedProject);
  openButton!.addEventListener('click', openProject);
}

setup();
