"use client";

import { attachBaseRipple, AttachBaseRippleOptions } from "@base-ripple/core";
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  ReactElement,
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";

// region TYPES

type PolymorphicAs<E extends ElementType> = { as?: E };

type PolymorphicOmit<E extends ElementType, P> = keyof (PolymorphicAs<E> & P);

type PolymorphicComponentProps<E extends ElementType, P> = P &
  PolymorphicAs<E> &
  Omit<ComponentPropsWithoutRef<E>, PolymorphicOmit<E, P>>;

type PolymorphicComponentRef<E extends ElementType> =
  ComponentPropsWithRef<E>["ref"];

type RippleProps = {
  rippleOptions?: AttachBaseRippleOptions;
};

type RippleComponent = <E extends ElementType = "button">(
  props: PolymorphicComponentProps<E, RippleProps> & {
    ref?: PolymorphicComponentRef<E>;
  },
) => ReactElement | null;

// endregion TYPES
// region MAIN

const DEFAULT_RIPPLE_OPTIONS: AttachBaseRippleOptions = {};
const RIPPLE_CONTAINER_CLASS = "base-ripple-container";

function Ripple(
  {
    rippleOptions = DEFAULT_RIPPLE_OPTIONS,
    as: Component = "button",
    className,
    ...restProps
  }: PolymorphicComponentProps<ElementType, RippleProps>,
  ref: ForwardedRef<unknown>,
) {
  const localRef = useRef(null);
  const mergedRef = useMergedRefs(ref, localRef);

  useEffect(() => {
    if (!localRef.current) return;
    return attachBaseRipple(localRef.current, rippleOptions);
  }, [serializeOptions(rippleOptions)]);

  return (
    <Component
      ref={mergedRef}
      className={mergeClassName(className)}
      {...restProps}
    />
  );
}

export const BaseRipple = forwardRef(Ripple) as RippleComponent;

function mergeClassName<ClassName>(
  className: ClassName,
): MergedClassName<ClassName> {
  if (typeof className === "function") {
    return ((...args: unknown[]) =>
      joinClassNames(
        RIPPLE_CONTAINER_CLASS,
        Reflect.apply(className, undefined, args),
      )) as MergedClassName<ClassName>;
  }

  return joinClassNames(
    RIPPLE_CONTAINER_CLASS,
    className,
  ) as MergedClassName<ClassName>;
}

type MergedClassName<ClassName> = ClassName extends (
  ...args: infer Args
) => unknown
  ? (...args: Args) => string
  : string;

function joinClassNames(...classNames: unknown[]) {
  return classNames
    .filter((className): className is string => typeof className === "string")
    .map((className) => className.trim())
    .filter(Boolean)
    .join(" ");
}

// endregion MAIN
// region USE MERGED REFS

type PossibleRef<T> = Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (!ref) return;

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  try {
    (ref as RefObject<T | null>).current = value;
  } catch {
    // in extremely rare cases (e.g. read-only refs), ignore.
  }
}

function useMergedRefs<T>(...refs: PossibleRef<T>[]) {
  const refsRef = useRef(refs);

  useEffect(() => {
    refsRef.current = refs;
  }, refs);

  return useCallback((node: T | null) => {
    for (const ref of refsRef.current) setRef(ref, node);
  }, []);
}

// endregion USE MERGED REFS
// region OTHER UTILITIES

function serializeOptions(options: AttachBaseRippleOptions | undefined) {
  if (!options) return "";

  const attributes = options.attributes;
  const serializedAttributes = attributes
    ? Object.keys(attributes)
        .sort()
        .map(
          (key) =>
            `${encodeURIComponent(key)}:${encodeURIComponent(attributes[key])}`,
        )
        .join("|")
    : "";

  return `${options.origin ?? ""}__${
    options.sizeOffset ?? ""
  }__${serializedAttributes}`;
}

// endregion OTHER UTILITIES
