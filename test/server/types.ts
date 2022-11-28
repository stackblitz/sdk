import type { Project } from '$src/interfaces';

export interface InitRequestData {
  action: 'SDK_INIT';
  id: string;
}

export interface InitResponseData {
  action: 'SDK_INIT_SUCCESS';
  id: string;
  payload: {
    previewOrigin: string | null;
  };
}

export interface RequestData {
  type: `SDK_${string}`;
  payload: {
    __reqid: string;
    [key: string]: any;
  };
}

export type AnyRequestData = Partial<InitRequestData & RequestData>;

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

export type HandleRootRequest = (data: AnyRequestData) => InitResponseData | ResponseData | null;
