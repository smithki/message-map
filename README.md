# ⧟ MessageMap

[![code style: airbnb](https://img.shields.io/badge/code%20style-airbnb-blue.svg?style=flat)](https://github.com/airbnb/javascript)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Dynamic string generation with a strongly-typed interface.

## 💁🏼‍♂️ Introduction

`MessageMap` is a glorified version of `String.prototype.replace` that applies static typing to the concept of [C-style string interpolation](http://www.cplusplus.com/reference/cstdio/printf/). Some potential use-cases include:

- Centrally manage error messages for your JavaScript/TypeScript package.
- Build a library of reactive translations for your front-end web application.
- Protect yourself from formatting bugs inside large/unwieldy template strings by maintaining type safety.

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

console.log(myStringBuilder.toString({
  month: 'January',
  day: '1',
  year: '2000',
  epoch: ... // Optional -- as indicated above. TypeScript will not complain if this prop is missing.
}));
```

### Using validator functions

You can optionally provide `Validator` functions to the `MessageMap.required` and `MessageMap.optional` methods. These can return a `boolean` to indicate whether the interpolation should proceed or return a fallback `string` in the event the user-provided substitution is missing or `undefined` (this enables you to specify defaults for `MessageMap.optional` replacement keys—as shown in the above example for `epoch`).

```ts
import { MessageMap } from 'message-map';

const myStringBuilder = new MessageMap('My phone number is %phoneNumber')
  .required('month', str => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(str));

console.log(myStringBuilder.toString({
  phoneNumber: '555-asdf-1234' // This will raise an error becuase the phone number won't pass validation!
}));
```
