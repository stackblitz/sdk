import type { AnyRequestData } from './types';

async function makeRequestFail(type: AnyRequestData['type']): Promise<void>{
    const iframeElement = document.getElementById('embed') as HTMLIFrameElement;
    const port = await new Promise<MessagePort>((res) => {
        const successListener = ({ data, ports }: MessageEvent) => {
            if(data?.test_action === 'TEST_INIT_SUCCESS'){
                window.removeEventListener('message', successListener);
                res(ports[0]);
            }
        };
        window.addEventListener('message', successListener);
        iframeElement.contentWindow?.postMessage({test_action: 'TEST_INIT'}, '*');
    })
    await new Promise<void>((res) => {
        const successListener = ({ data }: MessageEvent<any>) => {
            if(data?.test_action === 'TEST_MAKE_REQUEST_FAIL_SUCCESS'){
                port.close();
                res();
            }
        }
        port.onmessage = successListener;
        port.postMessage({test_action: 'TEST_MAKE_REQUEST_FAIL', type})
    })
}

const testSdk = {
    makeRequestFail
};

export default testSdk;