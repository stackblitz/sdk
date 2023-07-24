import { getRequestHandler } from '$test/server/request';
import { getFailingRequestHandler } from '$test/server/failing-request-handler';
import { getTestProject } from '$test/unit/utils/project';

import './styles.css';

function getProjectData() {
  const data = document.getElementById('project-data')?.innerHTML || 'null';
  return JSON.parse(data) || getTestProject();
}

const failingRequestHandler = getFailingRequestHandler();

window.addEventListener('message', (event: MessageEvent) => {
  if (event.data.action === 'SDK_INIT' && typeof event.data.id === 'string') {
    const project = getProjectData();
    const handleRequest = failingRequestHandler.createHandler(getRequestHandler(project));
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
  } else if(event.data.test_action === 'TEST_INIT'){
    const testSdkChannel = new MessageChannel();

    testSdkChannel.port1.onmessage = function ({ data }) {
      if(data?.test_action === 'TEST_MAKE_REQUEST_FAIL'){
        failingRequestHandler.makeRequestFail(data.type);
        this.postMessage({test_action: 'TEST_MAKE_REQUEST_FAIL_SUCCESS'})
      }
    };

    window.parent.postMessage(
      {
        test_action: 'TEST_INIT_SUCCESS'
      },
      '*',
      [testSdkChannel.port2]
    );
  }
});
