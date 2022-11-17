import { cleanPreviewPath } from '../validation';
import type { HandleRequest } from '../types';

export const SDK_GET_PREVIEW_URL: HandleRequest = (_data, { error, success, getState }) => {
  const { previewUrl } = getState();

  if (!previewUrl) {
    return error('No preview URL found');
  }

  return success({ url: previewUrl });
};

export const SDK_SET_PREVIEW_URL: HandleRequest = (
  data,
  { error, success, getProject, getState, patchState }
) => {
  const { template } = getProject();
  const { previewUrl } = getState();

  const newPath = cleanPreviewPath(data.payload.path);
  if (!newPath) {
    return error(`Invalid path '${data.payload.path}'`);
  }

  if (template === 'node' && !previewUrl) {
    return error('Server not running');
  }

  if (previewUrl) {
    const newUrl = new URL(previewUrl);
    newUrl.pathname = newPath;
    patchState((state) => {
      state.previewUrl = newUrl.toString();
    });
  }

  return success();
};
