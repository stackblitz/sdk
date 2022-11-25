import type { Project } from '$src/interfaces';

export interface RequestData {
  type: string;
  payload: {
    __reqid: string;
    [key: string]: any;
  };
}

export interface ResponseData {
  type: string;
  payload: {
    __reqid: string;
    __success: boolean;
    __error?: string;
    [key: string]: any;
  };
}

export interface AppState {
  currentFile?: string;
  editorPanes: string[][];
  previewUrl?: string;
  sidebarVisible: boolean;
  view: 'default' | 'editor' | 'preview';
  theme: 'default' | 'light' | 'dark';
}

export interface AppStateContext {
  getState(): AppState;
  patchState(patchFn: (state: AppState) => void): void;
}

export interface ProjectContext {
  getProject(): Project;
  patchProject(patchFn: (project: Project) => void): void;
}

export interface MessageContext {
  error(msg: string): ResponseData;
  success(payload?: Record<string, any>): ResponseData;
}

export type HandlerContext = AppStateContext & ProjectContext & MessageContext;

export type HandleRequest = (data: RequestData, context: HandlerContext) => ResponseData;

export type HandleRootRequest = (data: RequestData) => ResponseData;
