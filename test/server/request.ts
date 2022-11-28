import cloneDeep from 'lodash/cloneDeep';

import type { Project, ProjectOptions } from '$src/interfaces';

import type {
  AppState,
  AppStateContext,
  HandleRequest,
  HandleRootRequest,
  MessageContext,
  RequestData,
  ProjectContext,
  InitRequestData,
  AnyRequestData,
  InitResponseData,
} from './types';
import { fileToPanes, filterPanes } from './validation';

import * as dependenciesHandlers from './handlers/dependencies';
import * as editorHandlers from './handlers/editor';
import * as fsHandlers from './handlers/fs';
import * as previewHandlers from './handlers/preview';

const handlers: Record<string, HandleRequest> = {
  ...dependenciesHandlers,
  ...editorHandlers,
  ...fsHandlers,
  ...previewHandlers,
};

export function getRequestHandler(
  project: Project,
  options: ProjectOptions = {}
): HandleRootRequest {
  const projectContext = getProjectContext(project);
  const appStateContext = getAppStateContext(project, options);

  return (data) => {
    if (isInitRequest(data)) {
      const response: InitResponseData = {
        action: 'SDK_INIT_SUCCESS',
        id: data.id,
        payload: {
          previewOrigin:
            projectContext.getProject().template === 'node' ? null : 'https://test.stackblitz.io',
        },
      };
      return response;
    }

    if (isVmRequest(data)) {
      const context = {
        ...appStateContext,
        ...projectContext,
        ...getMessageContext(data),
      };
      if (typeof handlers[data.type] === 'function') {
        return handlers[data.type](data, context);
      }
      return context.error('NOT IMPLEMENTED');
    }

    return null;
  };
}

function isInitRequest(data: AnyRequestData): data is InitRequestData {
  return data.action === 'SDK_INIT' && typeof data.id === 'string';
}

function isVmRequest(data: AnyRequestData): data is RequestData {
  return typeof data.type === 'string' && data.type.startsWith('SDK_');
}

function getMessageContext(data: RequestData): MessageContext {
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

export function getProjectContext(originalProject: Project): ProjectContext {
  const project = cloneDeep(originalProject);

  return {
    getProject() {
      return project;
    },
    patchProject(patchFn) {
      patchFn(project);
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
