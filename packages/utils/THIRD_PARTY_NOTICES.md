# Third-party notices

`@construkt-kit/utils` includes code adapted from the open-source projects below. Each entry names the
release and commit the code was ported from, the files it went into, and that project's licence.

## Zag

- Source: https://github.com/chakra-ui/zag, release `1.47.0`, commit `7a415c9d670fd1e3beb653bab242cda7ff9c7304`
- Ported from `packages/utilities/color-utils/src/color.ts`, `rgb-color.ts`, `hsl-color.ts`, `hsb-color.ts`,
  `native-color.ts`, `parse-color.ts` and `types.ts`, as functions over plain color objects, and the
  step, range and decimal arithmetic helpers of `packages/utilities/core/src/number.ts`
- Into `src/color.ts` and `src/number.ts`

```
MIT License

Copyright (c) 2021 Chakra UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
