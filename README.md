# graphql-scalar
Configurable custom GraphQL Scalars (string, number, date, etc) with sanitization / validation / transformation in TypeScript.

[![npm version](https://badge.fury.io/js/graphql-scalar.svg)](https://badge.fury.io/js/graphql-scalar)
[![npm](https://img.shields.io/npm/dw/graphql-scalar.svg)](https://www.npmjs.com/package/graphql-scalar)
![npm type definitions](https://img.shields.io/npm/types/graphql-scalar.svg)
[![Build Status](https://travis-ci.org/joonhocho/graphql-scalar.svg?branch=master)](https://travis-ci.org/joonhocho/graphql-scalar)
[![Dependency Status](https://david-dm.org/joonhocho/graphql-scalar.svg)](https://david-dm.org/joonhocho/graphql-scalar)
[![GitHub](https://img.shields.io/github/license/joonhocho/graphql-scalar.svg)](https://github.com/joonhocho/graphql-scalar/blob/master/LICENSE)

## Get Started
```
npm install graphql-scalar
```
or
```
yarn add graphql-scalar
```

## How to Use
```typescript
import { Nullable, NonNull } from 'graphql-scalar';

const nullableString: Nullable<string> = null; // ok

const nonNullString: NonNull<string | null> = null; // error
```

## License
[MIT License](https://github.com/joonhocho/graphql-scalar/blob/master/LICENSE)
