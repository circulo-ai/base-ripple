// region TYPES

export type AttachBaseRippleOptions = {
  origin?: "pointer" | "center";
  sizeOffset?: number;
  attributes?: Record<string, string>;
};

type RippleKeyframes = {
  from: {
    size: number;
    x: number;
    y: number;
  };
  to: {
    size: number;
    x: number;
    y: number;
  };
};

type Dispose = () => void;

type GlobalHandlers = {
  fadeAll: () => void;
  fadeFromPointer: (event: PointerEvent) => void;
};

// endregion TYPES
// region GLOBALS

const globalHandlers = new Set<GlobalHandlers>();
let globalsInstalled = false;

function installGlobalListeners() {
  if (globalsInstalled) return;
  globalsInstalled = true;
  addEventListener("blur", onGlobalFadeAll);
  addEventListener("pagehide", onGlobalFadeAll);
  addEventListener("beforeunload", onGlobalFadeAll);

  addEventListener("pointerup", onGlobalFadeFromPointer, { passive: true });
  addEventListener("pointercancel", onGlobalFadeFromPointer, { passive: true });

  document.addEventListener("visibilitychange", onGlobalVisibilityChange);
}

function uninstallGlobalListenersIfIdle() {
  if (!globalsInstalled || globalHandlers.size > 0) return;
  globalsInstalled = false;
  removeEventListener("blur", onGlobalFadeAll);
  removeEventListener("pagehide", onGlobalFadeAll);
  removeEventListener("beforeunload", onGlobalFadeAll);

  removeEventListener("pointerup", onGlobalFadeFromPointer);
  removeEventListener("pointercancel", onGlobalFadeFromPointer);

  document.removeEventListener("visibilitychange", onGlobalVisibilityChange);
}

function onGlobalFadeAll() {
  for (const handler of globalHandlers) {
    handler.fadeAll();
  }
}

function onGlobalFadeFromPointer(event: PointerEvent) {
  for (const handler of globalHandlers) {
    handler.fadeFromPointer(event);
  }
}

function onGlobalVisibilityChange() {
  if (document.visibilityState === "hidden") {
    onGlobalFadeAll();
  }
}

// endregion GLOBALS
// region MAIN

export function attachBaseRipple(
  container: HTMLElement,
  {
    origin = "pointer",
    sizeOffset = 0,
    attributes,
  }: AttachBaseRippleOptions = {},
): Dispose {
  const ripples = new Set<HTMLSpanElement>();
  const activePointerRipples = new Map<number, HTMLSpanElement>();
  const activeKeyRipples = new Map<string, HTMLSpanElement>();
  const isPointerOrigin = origin === "pointer";
  let pointerDownInstalled = false;
  let reducedMotion = prefersReducedMotion();

  const createRippleKeyframes = (
    containerRect: DOMRect,
    fromX: number,
    fromY: number,
  ): RippleKeyframes => ({
    from: {
      size: 0,
      x: fromX,
      y: fromY,
    },
    to: {
      size:
        (isPointerOrigin
          ? rectBoundingCircleDiameterFromPoint(
              containerRect.width,
              containerRect.height,
              fromX,
              fromY,
            )
          : rectBoundingCircleDiameter(
              containerRect.width,
              containerRect.height,
            )) + sizeOffset,
      x: isPointerOrigin ? fromX : containerRect.width / 2,
      y: isPointerOrigin ? fromY : containerRect.height / 2,
    },
  });

  const createPointerRipple = (event: PointerEvent) => {
    if (event.defaultPrevented) return;
    if (isDisabled(container)) return;
    if (reducedMotion) return;

    const containerRect = container.getBoundingClientRect();
    const rippleKeyframes = createRippleKeyframes(
      containerRect,
      event.clientX - containerRect.x,
      event.clientY - containerRect.y,
    );

    const ripple = createRipple({
      rippleKeyframes,
      removeHandler: removeRipple,
      attributes,
    });

    ripples.add(ripple);
    activePointerRipples.set(event.pointerId, ripple);
    container.appendChild(ripple);
  };

  const createKeyRipple = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (isDisabled(container)) return;
    if (reducedMotion) return;

    if (event.repeat) return;
    if (activeKeyRipples.has(event.code)) return;
    if (!isActivationKey(event.code)) return;
    if (isEditableTarget(event.target)) return;

    const containerRect = container.getBoundingClientRect();
    const rippleKeyframes = createRippleKeyframes(
      containerRect,
      containerRect.width / 2,
      containerRect.height / 2,
    );

    const ripple = createRipple({
      rippleKeyframes,
      removeHandler: removeRipple,
      attributes,
    });

    ripples.add(ripple);
    activeKeyRipples.set(event.code, ripple);
    container.appendChild(ripple);
  };

  const fadeRipple = (ripple: HTMLSpanElement) => {
    ripple.style.opacity = "0";
  };

  const fadeActivePointerRipple = (event: PointerEvent) => {
    const rippleToFade = activePointerRipples.get(event.pointerId);
    if (!rippleToFade) return;
    fadeRipple(rippleToFade);
    activePointerRipples.delete(event.pointerId);
  };

  const fadeActiveKeyRipple = (event: KeyboardEvent) => {
    const rippleToFade = activeKeyRipples.get(event.code);
    if (!rippleToFade) return;
    fadeRipple(rippleToFade);
    activeKeyRipples.delete(event.code);
  };

  const fadeAllActiveRipples = () => {
    for (const ripple of activePointerRipples.values()) fadeRipple(ripple);
    activePointerRipples.clear();

    for (const ripple of activeKeyRipples.values()) fadeRipple(ripple);
    activeKeyRipples.clear();
  };

  const removeRipple = (ripple: HTMLSpanElement) => {
    ripples.delete(ripple);
    for (const [pointerId, activeRipple] of activePointerRipples) {
      if (activeRipple === ripple) {
        activePointerRipples.delete(pointerId);
        break;
      }
    }
    for (const [code, activeRipple] of activeKeyRipples) {
      if (activeRipple === ripple) {
        activeKeyRipples.delete(code);
        break;
      }
    }
    ripple.remove();
  };

  const removeAllRipples = () => {
    for (const ripple of ripples) {
      ripple.remove();
    }
    ripples.clear();
    activePointerRipples.clear();
    activeKeyRipples.clear();
  };

  const addPointerDownListener = () => {
    if (pointerDownInstalled) return;
    container.addEventListener("pointerdown", createPointerRipple, {
      passive: true,
    });
    pointerDownInstalled = true;
  };

  const removePointerDownListener = () => {
    if (!pointerDownInstalled) return;
    container.removeEventListener("pointerdown", createPointerRipple);
    pointerDownInstalled = false;
  };

  const unsubscribeReducedMotion = observeReducedMotion((nextReducedMotion) => {
    if (reducedMotion === nextReducedMotion) return;
    reducedMotion = nextReducedMotion;
    if (reducedMotion) {
      removePointerDownListener();
      removeAllRipples();
    } else {
      addPointerDownListener();
    }
  });

  const keyUpHandler = (event: KeyboardEvent) => {
    if (!isActivationKey(event.code)) return;
    fadeActiveKeyRipple(event);
  };

  if (!reducedMotion) addPointerDownListener();
  container.addEventListener("keyup", keyUpHandler);
  container.addEventListener("keydown", createKeyRipple);
  container.addEventListener("contextmenu", fadeAllActiveRipples);
  container.addEventListener("pointerleave", fadeActivePointerRipple, {
    passive: true,
  });

  installGlobalListeners();
  const globalHandler = {
    fadeAll: fadeAllActiveRipples,
    fadeFromPointer: fadeActivePointerRipple,
  };
  globalHandlers.add(globalHandler);

  return () => {
    unsubscribeReducedMotion();
    removePointerDownListener();
    container.removeEventListener("keyup", keyUpHandler);
    container.removeEventListener("keydown", createKeyRipple);
    container.removeEventListener("contextmenu", fadeAllActiveRipples);
    container.removeEventListener("pointerleave", fadeActivePointerRipple);
    globalHandlers.delete(globalHandler);
    uninstallGlobalListenersIfIdle();
    removeAllRipples();
  };
}

// endregion MAIN
// region REDUCED MOTION

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  if (typeof matchMedia !== "function") return false;
  return matchMedia(REDUCED_MOTION_QUERY).matches;
}

function observeReducedMotion(
  onChange: (nextReducedMotion: boolean) => void,
): Dispose {
  if (typeof matchMedia !== "function") return () => {};

  const mediaQueryList = matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", handler);
    return () => mediaQueryList.removeEventListener("change", handler);
  }

  if (typeof mediaQueryList.addListener === "function") {
    mediaQueryList.addListener(handler);
    return () => mediaQueryList.removeListener(handler);
  }

  return () => {};
}

// endregion REDUCED MOTION
// region OTHER UTILITIES

function createRipple({
  rippleKeyframes,
  removeHandler,
  attributes,
}: {
  rippleKeyframes: RippleKeyframes;
  removeHandler: (ripple: HTMLSpanElement) => void;
  attributes: Record<string, string> | undefined;
}): HTMLSpanElement {
  const ripple = document.createElement("span");
  ripple.setAttribute("aria-hidden", "true");
  ripple.className = "base-ripple";
  ripple.style.width = rippleKeyframes.to.size + "px";
  ripple.style.height = rippleKeyframes.to.size + "px";
  ripple.style.setProperty(
    "--base-ripple-keyframes-from-x",
    rippleKeyframes.from.x + "px",
  );
  ripple.style.setProperty(
    "--base-ripple-keyframes-from-y",
    rippleKeyframes.from.y + "px",
  );
  ripple.style.setProperty(
    "--base-ripple-keyframes-to-x",
    rippleKeyframes.to.x + "px",
  );
  ripple.style.setProperty(
    "--base-ripple-keyframes-to-y",
    rippleKeyframes.to.y + "px",
  );

  if (attributes)
    for (const [key, value] of Object.entries(attributes))
      ripple.setAttribute(key, value);

  const transitionEndHandler = (event: TransitionEvent) => {
    if (event.propertyName !== "opacity") return;
    removeHandler(ripple);
    ripple.removeEventListener("transitionend", transitionEndHandler);
  };
  ripple.addEventListener("transitionend", transitionEndHandler);

  return ripple;
}

function isDisabled(element: HTMLElement) {
  const ariaDisabled = element.getAttribute("aria-disabled");
  if (ariaDisabled !== null) return ariaDisabled.toLowerCase() === "true";
  return (
    "disabled" in element && Boolean((element as HTMLButtonElement).disabled)
  );
}

function isActivationKey(code: string) {
  return code === "Space" || code === "Enter" || code === "NumpadEnter";
}

const editableSelector =
  "input:not([type])," +
  'input[type="text"],' +
  'input[type="search"],' +
  'input[type="url"],' +
  'input[type="tel"],' +
  'input[type="email"],' +
  'input[type="password"],' +
  'input[type="number"],' +
  'input[type="date"],' +
  'input[type="time"],' +
  'input[type="datetime-local"],' +
  'input[type="month"],' +
  'input[type="week"],' +
  "textarea," +
  "[contenteditable]";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(editableSelector));
}

function rectBoundingCircleDiameter(width: number, height: number) {
  return Math.sqrt(width * width + height * height);
}

function rectBoundingCircleDiameterFromPoint(
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const dx = Math.max(x, width - x);
  const dy = Math.max(y, height - y);

  return 2 * Math.sqrt(dx * dx + dy * dy);
}

// endregion OTHER UTILITIES
