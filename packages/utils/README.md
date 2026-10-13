# @construkt-kit/utils

Stateless, framework-agnostic utilities shared across Construkt Kit frontend apps.

## Exports

| Module         | Exports                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **array**      | `transformArray`, `addOrRemove`, `addOrRemoveByKey`, `getFirstItemId`, `getLastItemId`, `findInTree`                                                                                  |
| **date**       | `formatDateDefault`, `formatDateRelative`                                                                                                                                             |
| **enum**       | `isEnumKey`, `enumToKeys`, `enumToValues`, `enumToEntries`, `enumToOptions`, `enumValueToKey`, `fromEnum`, `mapEnumToFlags`, `toListItems`, `toNumericListItems`, `getEnumKeyByValue` |
| **number**     | `isValidNumber`, `toInt`, `isStrictlyNumeric`                                                                                                                                         |
| **object**     | `ObjectKeys` (type), `objectKeys`, `toKeyValue`, `isPlainObject`                                                                                                                      |
| **query**      | `buildQueryString`, `saveBlob`, `saveBlobResponse`, `fileNameFromContentDisposition`, `downloadFile`                                                                                  |
| **string**     | `toCamelCase`                                                                                                                                                                         |
| **validation** | `emailSchema`, `phoneSchema`, `passwordSchema`, `loginSchema` (Zod)                                                                                                                   |

## Usage

```ts
import { buildQueryString, addOrRemove, emailSchema } from "@construkt-kit/utils";
```

## Upgrading from 0.5

- `toListItems` takes string-keyed maps; use `toNumericListItems` for numeric enums, whose values come back as numbers
- `buildQueryString` writes `Date` values as ISO 8601 UTC and skips invalid ones
- `buildQueryString` numbers array elements without gaps, skipping empty ones: `["", "open"]` gives `[0]=open`
- `saveBlob` revokes the blob URL 40 seconds after the download starts
- `formatDateDefault` and `formatDateRelative` read a date-only string as a local date instead of UTC midnight
- `toCamelCase` splits on spaces, `_`, `-` and case changes: `first_name` → `firstName`, `userID` → `userId`
- `isEnumKey` accepts string-enum keys, and `enumToEntries` keeps every key of an aliased value
