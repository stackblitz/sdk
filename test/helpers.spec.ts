/** @vitest-environment happy-dom */

import { afterEach, describe, expect, test } from 'vitest';

import { DEFAULT_FRAME_HEIGHT } from '../src/constants';
import { embedUrl, findElement, genID, openTarget, openUrl, replaceAndEmbed } from '../src/helpers';
import { h, makeContainer, removeContainer } from './utils/dom';

describe('embedUrl', () => {
  test('works with custom origins', () => {
    expect(embedUrl('/edit/test', { origin: 'http://localhost:8000' })).toBe(
      'http://localhost:8000/edit/test?embed=1'
    );
    expect(embedUrl('/edit/test', { origin: 'http://localhost:8000/' })).toBe(
      'http://localhost:8000/edit/test?embed=1'
    );
  });

  test('turns config into URL query parameters', () => {
    expect(embedUrl('/edit/test', { clickToLoad: true, openFile: 'index.js', theme: 'dark' })).toBe(
      'https://stackblitz.com/edit/test?embed=1&ctl=1&file=index.js&theme=dark'
    );
  });

  test('allows removing the embed=1 query parameter', () => {
    expect(embedUrl('/edit/test', { forceEmbedLayout: false })).toBe(
      'https://stackblitz.com/edit/test'
    );
  });
});

describe('findElement', () => {
  afterEach(removeContainer);

  test('returns HTML elements as-is', () => {
    const div = h('div');
    expect(findElement(div)).toBe(div);
  });

  test('finds HTML elements by id', () => {
    const div = makeContainer().appendChild(h('div', { id: 'test' }));
    expect(findElement('test')).toBe(div);
  });

  test('throws when element cannot be found', () => {
    expect(() => findElement('test')).toThrowError("Could not find element with id 'test'");
  });

  test('throws with invalid input', () => {
    expect(() => findElement(Math.PI as any)).toThrowError('Invalid element: 3.141592653589793');
  });
});

describe('genID', () => {
  function findCollisions(generator: () => string, count = 0) {
    const generated: Record<string, true> = {};
    const collisions: string[] = [];
    while (count > 0) {
      const item = generator();
      if (generated[item]) collisions.push(item);
      generated[item] = true;
      count--;
    }
    return {
      all: Object.keys(generated),
      collisions,
    };
  }

  test('doesn’t produce collisions for a low number of values', () => {
    const RUN_COUNT = 1_000;
    const { all, collisions } = findCollisions(genID, RUN_COUNT);
    expect(all.length).toBe(RUN_COUNT);
    expect(collisions.length).toBe(0);
  });
});

describe('openTarget', () => {
  test('translates the newWindow option', () => {
    expect(openTarget()).toBe('_blank');
    expect(openTarget({ newWindow: true })).toBe('_blank');
    expect(openTarget({ newWindow: false })).toBe('_self');
  });
});

describe('openUrl', () => {
  test('works with custom origins', () => {
    expect(openUrl('/edit/test', { origin: 'http://localhost:8000/' })).toBe(
      'http://localhost:8000/edit/test'
    );
  });

  test('turns config into URL query parameters', () => {
    expect(openUrl('/edit/test', { clickToLoad: true, openFile: ['index.js', 'README.md'] })).toBe(
      'https://stackblitz.com/edit/test?ctl=1&file=index.js&file=README.md'
    );
  });

  test('allows adding the embed=1 query parameter', () => {
    expect(openUrl('/edit/test', { forceEmbedLayout: true })).toBe(
      'https://stackblitz.com/edit/test?embed=1'
    );
  });
});

describe('replaceAndEmbed', () => {
  afterEach(removeContainer);

  test('throws with invalid input', () => {
    const target = h('div') as HTMLDivElement;
    const iframe = h('iframe') as HTMLIFrameElement;

    expect(() => {
      replaceAndEmbed(target, undefined as any);
    }).toThrowError('Invalid Element');

    expect(() => {
      replaceAndEmbed(undefined as any, iframe);
    }).toThrowError('Invalid Element');

    // Still throws because the target element has not parent
    expect(() => {
      replaceAndEmbed(target, iframe);
    }).toThrowError('Invalid Element');

    // Attach target element to document
    makeContainer().append(target);
    expect(() => {
      replaceAndEmbed(target, iframe);
    }).not.toThrow();
  });

  test('replaces target element with iframe', () => {
    const embedSrc = 'https://stackblitz.com/edit/test?embed=1';
    const target = h('div', {
      id: 'embed',
      class: 'test',
      'data-old': 'true',
    });
    const iframe = h('iframe', {
      src: embedSrc,
      'data-new': 'true',
    }) as HTMLIFrameElement;

    makeContainer().append(target);
    replaceAndEmbed(target!, iframe);
    const found = document.getElementById('embed')!;

    expect(found).toBe(iframe);
    expect(found.className).toBe('test');
    expect(found.getAttribute('src')).toBe(embedSrc);
    expect(found.getAttribute('data-old')).toBe(null);
    expect(found.getAttribute('data-new')).toBe('true');
  });

  test('sets default iframe dimensions', () => {
    const div = makeContainer().appendChild(h('div'));
    const iframe = h('iframe', { src: 'https://example.com/' });

    replaceAndEmbed(div, iframe as HTMLIFrameElement);

    expect(iframe.getAttribute('height')).toBe(String(DEFAULT_FRAME_HEIGHT));
    expect(iframe.getAttribute('width')).toBe(null);
    expect(iframe.style.width).toBe('100%');
  });

  test('sets iframe dimensions from EmbedOptions', () => {
    const div = makeContainer().appendChild(h('div'));
    const iframe = h('iframe', { src: 'https://example.com/' });

    replaceAndEmbed(div, iframe as HTMLIFrameElement, { width: 500, height: 500 });

    expect(iframe.getAttribute('height')).toBe('500');
    expect(iframe.getAttribute('width')).toBe('500');
    expect(iframe.getAttribute('style')).toBe(null);
  });
});
