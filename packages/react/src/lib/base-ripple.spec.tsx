// @vitest-environment jsdom

import {
	act,
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactElement,
} from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { BaseRipple } from "./base-ripple.js";

type ButtonState = { active: boolean };
type StatefulButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"className"
> & {
	className?: string | ((state: ButtonState) => string | undefined);
};

const StatefulButton = forwardRef<HTMLButtonElement, StatefulButtonProps>(
	function StatefulButton({ className, ...props }, ref) {
		const resolvedClassName =
			typeof className === "function" ? className({ active: true }) : className;

		return <button ref={ref} className={resolvedClassName} {...props} />;
	},
);

describe("base-ripple/react", () => {
	it("renders and hydrates without a class when className is omitted", async () => {
		await expectMarkupAndHydration(
			<BaseRipple>Default</BaseRipple>,
			"base-ripple-container",
		);
	});

	it("merges a string className into the SSR and hydrated markup", async () => {
		await expectMarkupAndHydration(
			<BaseRipple className="custom-button">String</BaseRipple>,
			"base-ripple-container custom-button",
		);
	});

	it("resolves a state callback and merges its result during SSR and hydration", async () => {
		await expectMarkupAndHydration(
			<BaseRipple
				as={StatefulButton}
				className={(state) => (state.active ? "state-active" : undefined)}
			>
				Callback
			</BaseRipple>,
			"base-ripple-container state-active",
		);
	});
});

async function expectMarkupAndHydration(
	element: ReactElement,
	expectedClass: string,
) {
	const serverMarkup = renderToString(element);
	expect(serverMarkup).toContain(`class="${expectedClass}"`);
	expect(serverMarkup).not.toContain("undefined");

	const container = document.createElement("div");
	container.innerHTML = serverMarkup;
	document.body.append(container);

	const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
	let root: Root | undefined;

	try {
		await act(async () => {
			root = hydrateRoot(container, element);
		});

		const button = container.querySelector("button");
		expect(button?.className).toBe(expectedClass);
		expect(consoleError).not.toHaveBeenCalled();
	} finally {
		if (root) await act(async () => root?.unmount());
		consoleError.mockRestore();
		container.remove();
	}
}
