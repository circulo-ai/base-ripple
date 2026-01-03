# @base-ripple/react

React wrapper for Base Ripple. Use this package when you want a declarative
component that attaches the ripple behavior from `@base-ripple/core`.

Demo: <https://base-ripple.vercel.app/>

## Install

```bash
npm i @base-ripple/react
```

## Quick start (React)

```tsx
"use client";

import "@base-ripple/react/styles.css";
import { BaseRipple } from "@base-ripple/react";

export function Example() {
  return <BaseRipple className="base-ripple-container">Click me</BaseRipple>;
}
```

You still need to define a fill color and opacity for the ripple:

```css
.base-ripple {
  background: currentColor;
  opacity: 0.12;
}
```

## Styles (required)

The ripple uses two class names:

- `.base-ripple-container` on the target element
- `.base-ripple` on the injected `<span>`

Option A: Import the default styles (recommended)

```css
@import "@base-ripple/react/styles.css";
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
      )
      scale(0);
  }
  to {
    transform: translate3d(
        calc(var(--base-ripple-keyframes-to-x) - 50%),
        calc(var(--base-ripple-keyframes-to-y) - 50%),
        0
      )
      scale(1);
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

```tsx
import { BaseRipple } from "@base-ripple/react";

<BaseRipple
  as="button"
  className="base-ripple-container"
  rippleOptions={{ origin: "pointer", sizeOffset: 96 }}
>
  Click me
</BaseRipple>;
```

### Props

| Prop            | Type                      | Default  | Description                                           |
| --------------- | ------------------------- | -------- | ----------------------------------------------------- |
| `as`            | `ElementType`             | `button` | Underlying element to render.                         |
| `rippleOptions` | `AttachBaseRippleOptions` | `{}`     | Options passed to the core `attachBaseRipple` helper. |

All other props are passed through to the underlying element, and the `ref` is
forwarded to the rendered element.

### `rippleOptions`

| Prop         | Type                     | Default     | Description                                                                                            |
| ------------ | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| `origin`     | `"pointer" \| "center"`  | `pointer`   | Where the ripple starts. `pointer` uses the pointer position; `center` starts from the element center. |
| `sizeOffset` | `number`                 | `0`         | Extra pixels added to the ripple diameter, useful when adding blur or glow.                            |
| `attributes` | `Record<string, string>` | `undefined` | Extra attributes added to each ripple `<span>`.                                                        |

## Behavior notes

- Uses pointer and keyboard interactions (Space, Enter, NumpadEnter).
- Respects `prefers-reduced-motion` by disabling ripples and clearing existing.
- Skips ripples for disabled elements (`disabled` or `aria-disabled="true"`).
- Adds `aria-hidden="true"` to the ripple spans for accessibility.
- Browser-only API; use inside client components.

## Core package

If you need the DOM API or want to build your own wrapper, use the core package:

- `@base-ripple/core`

## Planned framework wrappers (not implemented yet)

- Preact
- Vue
- Svelte
- Solid
- Angular
- Lit
- Qwik
