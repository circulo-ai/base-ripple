import { BaseRipple } from "@base-ripple/react";
import { ComponentProps } from "react";

export default function Home() {
  return (
    <main className="grid min-h-dvh grid-cols-2 grid-rows-7 gap-1 p-1 sm:grid-cols-4 sm:grid-rows-4">
      <article className="col-span-full flex flex-col items-center justify-evenly gap-4 p-3">
        <h1 className="text-balance text-center text-xl font-medium">
          Base Ripple Demo
        </h1>
        <p className="text-balance text-center text-lg text-black/50">
          Framework-agnostic, customizable, high-performance ripple interaction.
        </p>
        <a
          className="text-balance text-center text-blue-500 underline"
          href="https://github.com/circulo-ai/base-ripple"
          target="_blank"
        >
          Go to Repo
        </a>
      </article>
      <BaseRippleExample
        title="Clean Start"
        description="Default behavior with pointer + keyboard, and motion awareness."
      />
      <BaseRippleExample
        title="Center Offset"
        description="Center origin with a negative size offset for a tighter ring."
        rippleOptions={{ origin: "center", sizeOffset: -64 }}
      />
      <BaseRippleExample
        title="Soft Blur"
        description="Heavy blur plus extra size to keep the glow from clipping."
        className="[&_>_.base-ripple]:blur-3xl"
        rippleOptions={{ sizeOffset: 64 * 5 }}
      />
      <BaseRippleExample
        title="Center Blur"
        description="Center origin with a blurred ripple that expands smoothly."
        className="[&_>_.base-ripple]:blur-3xl"
        rippleOptions={{ origin: "center" }}
      />
      <BaseRippleExample
        title="Huge Offset"
        description="Large sizeOffset pushes the circle far beyond the container."
        rippleOptions={{ sizeOffset: 512 }}
      />
      <BaseRippleExample
        title="Slow Trail"
        description="Longer duration and custom data attributes on each span."
        className="[&_>_.base-ripple]:[animation-duration:2s] [&_>_.base-ripple]:[transition-duration:2s]"
        rippleOptions={{ attributes: { "data-custom": "base-ripple" } }}
      />
      <BaseRippleExample
        title="Sharp Timing"
        description="Custom cubic-bezier easing makes the ripple feel snappier."
        className="[&_>_.base-ripple]:[animation-timing-function:cubic-bezier(0,1,1,0)] [&_>_.base-ripple]:[transition-timing-function:cubic-bezier(0,1,1,0)]"
      />
      <BaseRippleExample
        title="Square Ripple"
        description="No border radius gives a crisp, squared ripple edge."
        className="[&_>_.base-ripple]:rounded-none"
      />
      <BaseRippleExample
        title="Color Pop"
        description="Bold red ink for contrast while keeping the same behavior."
        className="[&_>_.base-ripple]:bg-blue-500/50"
      />
      <BaseRippleExample>
        <BaseRippleExample
          title="Nested"
          className="border border-white"
          tabIndex={0}
          as="div"
        />
      </BaseRippleExample>
      <BaseRippleExample
        title="Light Mode"
        description="Light surface with darker ripple for a softer contrast."
        className="bg-gray-500 [&_>_.base-ripple]:bg-black/15"
      />
      <BaseRippleExample
        title="View Source"
        description="This one gets rendered as an anchor element and links to the demo page code in GitHub."
        as="a"
        href="https://github.com/circulo-ai/base-ripple/blob/main/apps/site/src/app/page.tsx"
        target="_blank"
      />
    </main>
  );
}

function BaseRippleExample({
  title,
  description,
  children,
  className,
  ...restProps
}: {
  title?: string;
  description?: string;
} & ComponentProps<typeof BaseRipple>) {
  return (
    <BaseRipple
      className={
        "base-ripple-container flex flex-col items-center justify-center bg-black p-3 text-white [&_>_.base-ripple]:bg-white/15 " +
        className
      }
      {...restProps}
    >
      {title && (
        <h2 className="text-balance text-center text-lg font-medium">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-balance text-center text-white/50">{description}</p>
      )}
      {children}
    </BaseRipple>
  );
}
