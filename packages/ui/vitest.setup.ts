import { installDomPolyfills } from "@construkt-kit/config/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { createMatchMedia } from "./src/_shared/matchMedia";

installDomPolyfills();
globalThis.matchMedia ??= createMatchMedia(false).matchMedia;

afterEach(cleanup);
