import type { Project, ProjectOptions } from '../../src/interfaces';

import type { HandleRequest, HandleRootRequest } from './types';
import { getAppStateContext, getMessageContext, getProjectContext } from './context';
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
    const messageContext = getMessageContext(data);

    if (typeof handlers[data.type] === 'function') {
      return handlers[data.type](data, {
        ...appStateContext,
        ...messageContext,
        ...projectContext,
      });
    }

    return messageContext.error('NOT IMPLEMENTED');
  };
}
