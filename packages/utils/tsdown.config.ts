import { createTsdownConfig } from "@construkt-kit/config/tsdown";

export default createTsdownConfig({ neverBundle: ["dayjs", "zod"] });
