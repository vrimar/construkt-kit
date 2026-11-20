import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { RuleTester } from "oxlint/plugins-dev";
import { afterAll, describe, expect, it } from "vitest";

import plugin from "./construkt.mjs";

const app = fs.mkdtempSync(path.join(os.tmpdir(), "construkt-lint-"));
fs.mkdirSync(path.join(app, "styled-system", "jsx"), { recursive: true });
fs.writeFileSync(
  path.join(app, "styled-system", "jsx", "is-valid-prop.mjs"),
  'export const isCssProperty = (name) => name === "width";\n',
);
afterAll(() => fs.rmSync(app, { recursive: true, force: true }));

it("reads the styled-system nearest the linted file, from any lint directory", () => {
  const file = path.join(app, "src", "components", "Card.tsx");
  const visitors = plugin.rules["no-style-prop-name"].create({
    settings: {},
    cwd: os.tmpdir(),
    filename: file,
    physicalFilename: file,
    report() {},
  });

  expect(Object.keys(visitors)).not.toHaveLength(0);
});

RuleTester.describe = describe;
RuleTester.it = it;

const styleProp = (code) => ({
  code,
  filename: "Card.tsx",
  settings: { construkt: { styledSystem: path.join(app, "styled-system") } },
  errors: [{ messageId: "styleProp", data: { name: "width" } }],
});

new RuleTester().run("no-style-prop-name", plugin.rules["no-style-prop-name"], {
  valid: [],
  invalid: [
    styleProp(
      "interface CardOptions { width: number }\nexport const Card = forwardRef<HTMLDivElement, CardOptions>((props, ref) => null);",
    ),
    styleProp(
      "export const Card = React.forwardRef<HTMLDivElement, { width: number }>((props, ref) => null);",
    ),
    styleProp("export class Card extends React.Component<{ width: number }> {}"),
    styleProp(
      "type CardOptions = { width: number };\nexport class Card extends Component<CardOptions> {}",
    ),
  ],
});
