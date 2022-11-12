import type { HandleRequest } from '../types';

export const SDK_GET_FS_SNAPSHOT: HandleRequest = (_data, { success, getProject }) => {
  return success(getProject().files);
};

export const SDK_APPLY_FS_DIFF: HandleRequest = (
  { payload },
  { success, getProject, patchProject }
) => {
  const updatedFiles = { ...getProject().files, ...payload.create };
  for (const path of payload.destroy) {
    delete updatedFiles[path];
  }
  patchProject((project) => (project.files = updatedFiles));

  return success();
};
