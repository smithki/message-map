# ⧟ MessageMap

[![code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat)](https://github.com/airbnb/javascript)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Dynamic string generation with a strongly-typed interface.

## 💁🏼‍♂️ Introduction

`MessageMap` is an extra spicy version of `String.prototype.replace` that applies TypeScript static typing to the concept of [C-style string interpolation](http://www.cplusplus.com/reference/cstdio/printf/). Some potential use-cases include:

- Centrally manage error messages for your JavaScript/TypeScript package.
- Build a library of reactive translations for your front-end web application.
- Protect yourself from formatting bugs inside large/unwieldy template strings by maintaining type safety.
- Probably a lot more I haven't considered yet!

> _NOTE:_ This package uses modern TypeScript features to achieve type safety, `typescript@>=3.1` is recommended!

## 🔗 Installation

Install via `yarn` (recommended):

```sh
yarn add message-map
```

Install via `npm`:

```sh
npm install message-map
```

## 🛠️ Usage

### Basic example

`MessageMap` has a chaining API where each method returns a **new** instance of `MessageMap`, similar to [`RxJS`](https://github.com/ReactiveX/rxjs). This ensures the type signatures remain accurate and improves readability!

```ts
import { MessageMap } from 'message-map';

const myStringBuilder = new MessageMap('The date is %month %day, %year. The current epoch is %epoch.')
  .required('month')
  .required('day')
  .required('year')
  .optional('epoch', () => String(new Date().getTime())); // We can choose to specify a default value for the optional key.

myStringBuilder.toString({
  month: 'January',
  day: '1',
  year: '2000',
  epoch: ... // Optional -- as indicated above. TypeScript will not complain if this prop is missing.
});
// => "The date is January 1, 2000. The current epoch is 946684800."
```

### Using validator functions

You can optionally provide [`Validator`](https://github.com/smithki/message-map/blob/f142965a4bf88da72a994cd48c846c062ee25426/src/lib.ts#L7) functions to `MessageMap.required` or `MessageMap.optional`. The callback returns a `boolean` to indicate whether the interpolation should proceed at all **OR** a `string` fallback in case the user-provided substitution is missing or `undefined` (this enables you to specify defaults for `MessageMap.optional` replacement keys—as shown in the above example for `epoch`).

```ts
import { MessageMap } from 'message-map';

const myStringBuilder = new MessageMap('My phone number is %phoneNumber')
  .required('phoneNumber', str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(str));

myStringBuilder.toString({
  phoneNumber: '555-asdf-1234' // This will raise an error because the phone number won't pass validation!
});
```

### Using `MessageCollection`

The `MessageCollection` class is intended for large-scale use-cases (such as building a language library) and is configurable via JSON-compatible objects. With TypeScript's `resolveJsonModule` option enabled, or by providing a static object literal, your `MessageCollection` can be strongly-typed, too!

```ts
import * as languagelibrary from '../path/to/languageLibrary.json'; // Requires `resolveJsonModule` in tsconfig.json
import { MessageCollection } from 'message-map';

const myLanguageLibrary = new MessageCollection(languageLibrary);
```

`languageLibrary.json` has the following type signature:

```ts
interface JsonLanguageLibrary {
  [key: string]: string | {
    template: string;

    optional?: {
      [substitution: string]: string | null | {
        default?: string;
        regex?: string;
      };
    };

    required?: {
      [substitution: string]: string | null | {
        default?: string;
        regex?: string;
      };
    };
  };
}
```

Here's some example JSON:

```json
{
  "HELLO_X": {
    "template": "Good %partOfDay, %yourName!",
    "optional": {
      "yourName": {
        "default": "Jeeves"
      }
    },
    "required": {
      "partOfDay": {
        "regex": "//(morning|afternoon|evening)//"
      }
    }
  },
  "MORNING": "morning"
}
```

You can then use `myLanguageLibrary` as a collection of static `MessageMap` instances:

```ts
myLanguageLibrary.get('HELLO_X').toString({
  yourName: 'Bojack',
  partOfDay: myLanguageLibrary.get('MORNING').toString(),
});
// => "Good morning, Bojack!"
```

For convenience, the `MessageCollection` class includes an enum of valid key names:

```ts
myLanguageLibrary.keys.HELLO_X; // => "HELLO_X"
myLanguageLibrary.keys.MORNING; // => "MORNING"
keyof typeof myLanguageLibrary.keys; // => "HELLO_X" | "MORNING"
```

The underlying `MessageMap` instances are exposed on `MessageCollection.messages`, but note they are **lazily populated** by `MessageCollection.get(...)`. The `MessageCollection.messages` property is exposed primarily for TypeScript typing needs:

```ts
myLanguageLibrary.messageMaps
// => {
//      "HELLO_X"?: MessageMap,
//      "MORNING"?: MessageMap,
//    }
```

Then you can trivially extract the substitution parameters like so:

```ts
type MySubstitutionKeys = keyof typeof myLanguageLibrary['keys'];
type MySubstitutionConfig<TKey extends MySubstitutionKeys> = Parameters<typeof myLanguageLibrary['messages'][TKey]['toString']>;
```

### Using the UMD build

A [UMD](https://github.com/umdjs/umd) build of `MessageMap` is available via [UNPKG](https://unpkg.com/message-map@0.6.0/dist/index.umd.js). Drop it into your page via a `<script>` tag:

```html
<script type="text/javascript" src="https://unpkg.com/message-map/dist/index.umd.js"></script>
```

The API for the UMD build has one small difference: `MessageMap` is the default object with `MessageCollection` available on `MessageMap.Collection`. So, you would use...

```ts
new MessageMap.Collection(langaugeLibraryJson);
```

Voila!
