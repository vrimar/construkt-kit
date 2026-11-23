import { createMatchMedia, installDomPolyfills } from "@construkt-kit/config/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

installDomPolyfills();
globalThis.matchMedia ??= createMatchMedia(false).matchMedia;

afterEach(cleanup);
