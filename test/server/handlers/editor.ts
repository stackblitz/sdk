import type { HandleRequest } from '../types';
import { isTheme, isView, fileToPanes, filterPanes } from '../validation';

export const SDK_SET_UI_THEME: HandleRequest = (data, { success, patchState }) => {
  const newTheme = data.payload.theme;

  if (isTheme(newTheme)) {
    patchState((state) => {
      state.theme = newTheme;
    });
  }

  return success();
};

export const SDK_SET_UI_VIEW: HandleRequest = (data, { success, patchState }) => {
  const newView = data.payload.view;

  if (isView(newView)) {
    patchState((state) => {
      state.view = newView;
    });
  }

  return success();
};

export const SDK_TOGGLE_SIDEBAR: HandleRequest = (data, { success, patchState }) => {
  const visible = data.payload.visible;

  if (typeof visible === 'boolean') {
    patchState((state) => {
      state.sidebarVisible = visible;
    });
  }

  return success();
};

export const SDK_OPEN_FILE: HandleRequest = (data, { error, success, getProject, patchState }) => {
  const { files } = getProject();

  const rawPanes = fileToPanes(data.payload.path);
  const editorPanes = filterPanes(rawPanes, files);

  // Error if we have zero valid files
  if (!editorPanes.length) {
    return error(
      `No file found for: ${rawPanes
        .flat()
        .map((p) => `'${p}'`)
        .join(', ')}`
    );
  }

  patchState((state) => {
    state.editorPanes = editorPanes;
  });

  return success();
};

export const SDK_SET_CURRENT_FILE: HandleRequest = (
  data,
  { error, success, getProject, patchState }
) => {
  const { path } = data.payload;
  const { files } = getProject();

  // Check that we have this file
  if (typeof files[path] !== 'string') {
    return error(`File not found: '${path}'`);
  }

  patchState((state) => {
    state.currentFile = path;
  });

  return success();
};
