import { getRequestHandler } from '$test/server/request';
import { getTestProject } from '$test/unit/utils/project';

import './styles.css';

function getProjectData() {
  const data = document.getElementById('project-data')?.innerHTML || 'null';
  return JSON.parse(data) || getTestProject();
}

window.addEventListener('message', (event: MessageEvent) => {
  if (event.data.action === 'SDK_INIT' && typeof event.data.id === 'string') {
    const project = getProjectData();
    const handleRequest = getRequestHandler(project);
    const sdkChannel = new MessageChannel();

    sdkChannel.port1.onmessage = function (event) {
      const message = handleRequest(event.data);
      if (message) {
        this.postMessage(message);
      }
    };

    window.parent.postMessage(
      {
        action: 'SDK_INIT_SUCCESS',
        id: event.data.id,
        payload: {
          previewOrigin: project.template === 'node' ? null : 'https://test.stackblitz.io',
        },
      },
      '*',
      [sdkChannel.port2]
    );
  }
});
