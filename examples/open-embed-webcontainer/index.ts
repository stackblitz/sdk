import sdk from '@stackblitz/sdk';

import './styles.css';

// This opens https://stackblitz.com/edit/node
// in the current window with the Preview pane
function openProject() {
  sdk.openProjectId('node', {
    newWindow: false,
    view: 'preview',
  });
}

// This replaces the HTML element with
// the id of "embed" with https://stackblitz.com/edit/node embedded in an iframe.
function embedProject() {
  sdk.embedProjectId('embed', 'node', {
    openFile: 'index.ts',
    crossOriginIsolated: true,
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
  const openButton = document.querySelector('[name=open-project]') as HTMLButtonElement;
  const corpCheckbox = document.querySelector('[name=corp]') as HTMLInputElement;

  embedButton.addEventListener('click', embedProject);
  openButton.addEventListener('click', openProject);
  corpCheckbox.addEventListener('change', toggleCorp);

  // mark the checkbox checked if the corp param is already set
  const queryParams = new URLSearchParams(window.location.search);

  corpCheckbox.checked = queryParams.get('corp') === '1';
}

setup();
