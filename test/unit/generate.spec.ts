/** @vitest-environment happy-dom */

import { afterEach, describe, expect, test, vi } from 'vitest';

import { createProjectForm, createProjectFrameHTML, openNewProject } from '../../src/generate';

import { useMockConsole, restoreConsole } from './utils/console';
import { formValue, makeContainer, removeContainer } from './utils/dom';
import { getTestProject } from './utils/project';

const cleanUp = () => {
  restoreConsole();
  removeContainer();
};

describe('createProjectFrameHTML', () => {
  afterEach(cleanUp);

  test('generates a HTML document string', () => {
    const html = createProjectFrameHTML(getTestProject());
    expect(html).toBeTypeOf('string');
    expect(html).toMatchSnapshot();
  });

  test('generated HTML contains a form', () => {
    const parent = makeContainer();
    parent.innerHTML = createProjectFrameHTML(getTestProject(), {
      view: 'editor',
      terminalHeight: 50,
    });

    // Check for form element
    const form = parent.querySelector('form')!;
    expect(form).toBeInstanceOf(HTMLFormElement);
    expect(form.getAttribute('action')).toBe(
      'https://stackblitz.com/run?embed=1&view=editor&terminalHeight=50'
    );
  });
});

describe('createProjectForm', () => {
  afterEach(cleanUp);

  test('generates a form element', () => {
    const project = getTestProject({
      title: 'My Test Project',
      dependencies: { cowsay: '1.5.0' },
      settings: { compile: { clearConsole: false } },
    });
    const form = createProjectForm(project);
    const value = (name: string) => formValue(form, name);

    // Check input values
    expect(value('project[title]')).toBe('My Test Project');
    expect(value('project[description]')).toBe(project.description);
    expect(value('project[template]')).toBe(project.template);
    expect(value('project[dependencies]')).toBe(JSON.stringify(project.dependencies));
    expect(value('project[settings]')).toBe(JSON.stringify(project.settings));
    expect(value('project[files][package.json]')).toBe(project.files['package.json']);
    expect(value('project[files][index.js]')).toBe(project.files['index.js']);
  });

  test('warns on unknown template type', () => {
    const console = useMockConsole();
    const warnSpy = vi.spyOn(console, 'warn');

    const project = getTestProject({ template: 'doesntexist' as any });
    const form = createProjectForm(project);
    const value = (name: string) => formValue(form, name);

    // Unknown template value is accepted by triggers a warning
    expect(value('project[template]')).toBe('doesntexist');
    expect(warnSpy).toHaveBeenCalledWith(
      `Unsupported project.template: must be one of 'angular-cli', 'create-react-app', 'html', 'javascript', 'node', 'polymer', 'typescript', 'vue'`
    );
  });

  test('ignores dependencies for node template', () => {
    const console = useMockConsole();
    const warnSpy = vi.spyOn(console, 'warn');

    const project = getTestProject({
      template: 'node',
      dependencies: { serve: '^12' },
    });
    const form = createProjectForm(project);
    const value = (name: string) => formValue(form, name);

    // Unknown template value is accepted by triggers a warning
    expect(value('project[template]')).toBe('node');
    expect(value('project[dependencies]')).toBe(undefined);
    expect(warnSpy).toHaveBeenCalledWith(
      `Invalid project.dependencies: dependencies must be provided as a 'package.json' file when using the 'node' template.`
    );
  });
});

describe('openNewProject', () => {
  test('cleans up after itself', () => {
    const project = getTestProject();

    expect(document.body.children.length).toBe(0);
    expect(() => openNewProject(project)).not.toThrow();
    expect(document.body.children.length).toBe(0);
  });
});
