import { HandleRequest } from '../types';

export const SDK_INIT: HandleRequest = (_data, { success, getProject }) => {
  return success({
    previewOrigin: getProject().template === 'node' ? null : 'https://test.stackblitz.io/',
  });
};
