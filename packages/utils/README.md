# @construkt-kit/utils

Stateless, framework-agnostic utilities shared across Construkt Kit frontend apps.

## Exports

| Module         | Exports                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **array**      | `transformArray`, `addOrRemove`, `addOrRemoveByKey`, `getFirstItemId`, `getLastItemId`, `findInTree`                                                            |
| **date**       | `formatDateDefault`, `formatDateRelative`                                                                                                                       |
| **enum**       | `isEnumKey`, `enumToKeys`, `enumToValues`, `enumToEntries`, `enumToOptions`, `enumValueToKey`, `fromEnum`, `mapEnumToFlags`, `toListItems`, `getEnumKeyByValue` |
| **number**     | `isValidNumber`, `toInt`, `isStrictlyNumeric`                                                                                                                   |
| **object**     | `ObjectKeys` (type), `objectKeys`, `toKeyValue`, `isPlainObject`                                                                                                |
| **query**      | `buildQueryString`, `saveBlobResponse`, `downloadFile`                                                                                                          |
| **string**     | `toCamelCase`                                                                                                                                                   |
| **validation** | `emailSchema`, `phoneSchema`, `passwordSchema`, `loginSchema` (Zod)                                                                                             |

## Usage

```ts
import { buildQueryString, addOrRemove, emailSchema } from "@construkt-kit/utils";
```
