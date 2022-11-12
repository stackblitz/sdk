import cloneDeep from 'lodash/cloneDeep';

import type { Project, ProjectOptions } from '../../src/interfaces';

import type {
  AppState,
  AppStateContext,
  MessageContext,
  RequestData,
  ProjectContext,
} from './types';
import { fileToPanes, filterPanes } from './validation';

export function getMessageContext(data: RequestData): MessageContext {
  return {
    error(msg) {
      return {
        type: `${data.type}_FAILURE`,
        payload: { __reqid: data.payload.__reqid, __success: false, __error: msg },
      };
    },
    success(payload) {
      return {
        type: `${data.type}_SUCCESS`,
        payload: { __reqid: data.payload.__reqid, __success: true, ...payload },
      };
    },
  };
}

export function getProjectContext(project: Project): ProjectContext {
  const clone = cloneDeep(project);

  return {
    getProject() {
      return clone;
    },
    patchProject(patchFn) {
      patchFn(clone);
    },
  };
}

export function getAppStateContext(project: Project, options: ProjectOptions): AppStateContext {
  const isNode = project.template === 'node';

  const openFile = options.openFile ?? Object.keys(project.files)[0];
  const panes: AppState['editorPanes'] = filterPanes(fileToPanes(openFile), project.files);

  const state: AppState = {
    editorPanes: panes,
    currentFile: panes.flat()[0],
    previewUrl: isNode ? undefined : 'https://test.stackblitz.io/',
    theme: options.theme ?? 'default',
    view: options.view ?? 'default',
    sidebarVisible: options.showSidebar ?? false,
  };

  return {
    getState() {
      return state;
    },
    patchState(patchFn) {
      patchFn(state);
    },
  };
}
