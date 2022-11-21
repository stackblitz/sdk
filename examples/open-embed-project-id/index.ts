import sdk from '@stackblitz/sdk';

import './styles.css';

// This opens https://stackblitz.com/edit/css-custom-prop-color-values
// in the current window with the Preview pane
function openProject() {
  sdk.openProjectId('css-custom-prop-color-values', {
    newWindow: false,
    view: 'preview',
  });
}

//  This replaces the HTML element with
// the id of "embed" with https://stackblitz.com/edit/css-custom-prop-color-values embedded in an iframe.
function embedProject() {
  sdk.embedProjectId('embed', 'css-custom-prop-color-values', {
    openFile: 'index.ts',
  });
}

function setup() {
  const embedButton = document.querySelector('[name=embed-project]');
  const openButton = document.querySelector('[name=open-project]');
  embedButton!.addEventListener('click', embedProject);
  openButton!.addEventListener('click', openProject);
}

setup();
