# @base-ripple/core

Framework-agnostic ripple effect for DOM elements. Use this core package for
vanilla JS or to build your own wrapper. If you are using a framework, prefer
the framework-specific package (for example `@base-ripple/react`).

Demo: <https://base-ripple.vercel.app/>

## Install

```bash
npm i @base-ripple/core
```

## Quick start (vanilla)

```html
<button class="base-ripple-container">Click me</button>
```

```ts
import '@base-ripple/core/styles.css';
import { attachBaseRipple } from '@base-ripple/core';

const button = document.querySelector<HTMLButtonElement>(
  '.base-ripple-container'
);
if (!button) throw new Error('Missing button');

const dispose = attachBaseRipple(button, {
  origin: 'pointer',
  sizeOffset: 96,
  attributes: { 'data-ripple': 'true' },
});

// later
dispose();
```

The ripple attaches listeners to the target element and global pointer events.
Call the returned `dispose` function on teardown.

## Styles (required)

The ripple uses two class names:

- `.base-ripple-container` on the target element
- `.base-ripple` on the injected `<span>`

Option A: Import the default styles (recommended)

```css
@import '@base-ripple/core/styles.css';
```

The default stylesheet handles layout and animation. You still need to set a
fill color and opacity, for example:

```css
.base-ripple {
  background: currentColor;
  opacity: 0.12;
}
```

Option B: Provide your own styles (advanced)

If you do not import `styles.css`, create your own CSS using the same class
names. Make sure the container is positioned and clips overflow. Here is the
default `styles.css` you can copy and customize:

```css
.base-ripple-container {
  position: relative;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.base-ripple {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  pointer-events: none;
  animation: baseRipple 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transition: opacity 600ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

@keyframes baseRipple {
  from {
    transform: translate3d(
        calc(var(--base-ripple-keyframes-from-x) - 50%),
        calc(var(--base-ripple-keyframes-from-y) - 50%),
        0
      ) scale(0);
  }
  to {
    transform: translate3d(
        calc(var(--base-ripple-keyframes-to-x) - 50%),
        calc(var(--base-ripple-keyframes-to-y) - 50%),
        0
      ) scale(1);
  }
}
```

IMPORTANT: If you write your own `.base-ripple` styles, it MUST include a
`transition` for `opacity`. Cleanup relies on the `transitionend` event for
`opacity`. Without it, ripple elements never remove themselves. If you want no
transition, set a `transition` with 0 duration, for example:

```css
.base-ripple {
  transition: opacity 0ms linear;
}
```

## API

```ts
import type { AttachBaseRippleOptions } from '@base-ripple/core';

attachBaseRipple(
  container: HTMLElement,
  options?: AttachBaseRippleOptions
): () => void;
```

### Options

| Prop         | Type                     | Default     | Description                                                                                            |
| ------------ | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| `origin`     | `'pointer' \| 'center'`  | `pointer`   | Where the ripple starts. `pointer` uses the pointer position; `center` starts from the element center. |
| `sizeOffset` | `number`                 | `0`         | Extra pixels added to the ripple diameter, useful when adding blur or glow.                            |
| `attributes` | `Record<string, string>` | `undefined` | Extra attributes added to each ripple `<span>`.                                                        |

## Behavior notes

- Uses pointer and keyboard interactions (Space, Enter, NumpadEnter).
- Respects `prefers-reduced-motion` by disabling ripples and clearing existing.
- Skips ripples for disabled elements (`disabled` or `aria-disabled="true"`).
- Adds `aria-hidden="true"` to the ripple spans for accessibility.
- Browser-only API; call it after the DOM is available.

## Framework packages

Use the framework-specific package when available:

- React: `@base-ripple/react`

This core package is ideal for vanilla usage or custom integrations.

## Planned framework wrappers (not implemented yet)

- Preact
- Vue
- Svelte
- Solid
- Angular
- Lit
- Qwik
