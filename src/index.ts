import {
  connect,
  embedGithubProject,
  embedProject,
  embedProjectId,
  openGithubProject,
  openProject,
  openProjectId,
} from './lib';

// Explicitly export public types (vs using `export * from './interfaces'`),
// so that additions to interfaces don't become a part of our public API by mistake.
export type {
  Project,
  ProjectDependencies,
  ProjectFiles,
  ProjectSettings,
  ProjectTemplate,
  ProjectOptions,
  EmbedOptions,
  OpenOptions,
  OpenFileOption,
  UiThemeOption,
  UiViewOption,
} from './interfaces';
export type { FsDiff, VM } from './vm';

const StackBlitzSDK = {
  connect,
  embedGithubProject,
  embedProject,
  embedProjectId,
  openGithubProject,
  openProject,
  openProjectId,
};

// Export a single object with methods, for compatibility with UMD and CommonJS.
// Ideally we would also have named exports, but that can create incompatibilities
// with some bundlers. To revisit in v2?
export default StackBlitzSDK;
