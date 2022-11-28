import { HandleRequest } from '../types';

export const SDK_GET_DEPS_SNAPSHOT: HandleRequest = (_data, { error, success, getProject }) => {
  const { template, files = {}, dependencies = {} } = getProject();

  const appDeps: Record<string, string> = {};

  if (template === 'node') {
    if (!files['package.json']) {
      return error(`Could not find package.json in project with template 'node'`);
    }
    try {
      const { dependencies, devDependencies } = JSON.parse(files['package.json']);
      Object.assign(appDeps, dependencies, devDependencies);
    } catch (err) {
      return error(`Could not parse package.json in project with template 'node'`);
    }
  } else {
    const rand = (max: number) => Math.floor(Math.random() * (max + 1));
    for (const name of Object.keys(dependencies || {})) {
      appDeps[name] = [rand(12), rand(20), rand(9)].join('.');
    }
  }

  return success(appDeps);
};
