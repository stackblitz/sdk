import type { Project, EmbedOptions, OpenOptions } from './interfaces';
import { PROJECT_TEMPLATES } from './constants';
import { embedUrl, openTarget, openUrl } from './helpers';

function createHiddenInput(name: string, value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  return input;
}

/**
 * Encode file paths for use in input name attributes.
 * We need to replace square brackets (as used by Next.js, SvelteKit, etc.),
 * with custom escape sequences. Important: do not encodeURIComponent the
 * whole path, for compatibility with the StackBlitz backend.
 */
function encodeFilePath(path: string) {
  return path.replace(/\[/g, '%5B').replace(/\]/g, '%5D');
}

export function createProjectForm({
  template,
  title,
  description,
  dependencies,
  files,
  settings,
}: Project) {
  if (!PROJECT_TEMPLATES.includes(template)) {
    const names = PROJECT_TEMPLATES.map((t) => `'${t}'`).join(', ');
    console.warn(`Unsupported project.template: must be one of ${names}`);
  }

  const inputs: HTMLInputElement[] = [];
  const addInput = (name: string, value: string, defaultValue = '') => {
    inputs.push(createHiddenInput(name, typeof value === 'string' ? value : defaultValue));
  };

  addInput('project[title]', title);
  if (typeof description === 'string' && description.length > 0) {
    addInput('project[description]', description);
  }
  addInput('project[template]', template, 'javascript');

  if (dependencies) {
    if (template === 'node') {
      console.warn(
        `Invalid project.dependencies: dependencies must be provided as a 'package.json' file when using the 'node' template.`
      );
    } else {
      addInput('project[dependencies]', JSON.stringify(dependencies));
    }
  }

  if (settings) {
    addInput('project[settings]', JSON.stringify(settings));
  }

  Object.entries(files).forEach(([path, contents]) => {
    addInput(`project[files][${encodeFilePath(path)}]`, contents);
  });

  const form = document.createElement('form');
  form.method = 'POST';
  form.setAttribute('style', 'display:none!important;');
  form.append(...inputs);
  return form;
}

export function createProjectFrameHTML(project: Project, options?: EmbedOptions) {
  const form = createProjectForm(project);
  form.action = embedUrl('/run', options);
  form.id = 'sb_run';

  const html = `<!doctype html>
<html>
<head><title></title></head>
<body>
  ${form.outerHTML}
  <script>document.getElementById('${form.id}').submit();</script>
</body>
</html>`;

  return html;
}

export function openNewProject(project: Project, options?: OpenOptions) {
  const form = createProjectForm(project);
  form.action = openUrl('/run', options);
  form.target = openTarget(options);

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
