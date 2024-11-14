# one-of

Utility type and function for working with [GraphQL `oneOf` types](https://github.com/graphql/graphql-spec/pull/825).

## Example

```typescript
import type { OneOf } from 'ts-one-of';

type UserQueryFilterInput = OneOf<{
  id?: string;
  name?: string;
}>;
// => UserQueryInput looks like:
// { id: string; name?: undefined } | { name: string; id?: undefined };
```

```typescript
import { oneOf } from 'ts-one-of';

interface UserQueryFilterInput {
  id?: string;
  name?: string;
}

const input = oneOf<UserQueryFilterInput>({ name: 'Sophia' }, ['id', 'name']);
// => `input` is now `OneOf<UserQueryFilterInput>`

const input = oneOf<UserQueryFilterInput>({ id: 'user_abc', name: 'Sophia' }, ['id', 'name']);
// => error: more than one key set in input object
```

## FAQ

### Why does the `oneOf` function take its second argument?

For the same reason that `Object.keys` returns `string[]`. TypeScript uses a structual type system, which means that the following code typechecks without problem:

```typescript
interface Foo {
  bar?: string;
  baz?: number;
}

function doSomething(foo: Foo) {
  const validatedFoo = oneOf(foo);
  // typechecks!
  // => `validatedFoo` is now `{ invalidKey: true }`
}

const foo = {
  bar: undefined,
  invalidKey: true,
};
doSomething(foo);
```

In this case, we _want_ to throw an error because the `foo` object is invalid. Neither `bar` nor `baz` were set, and `invalidKey` is not supposed to be a valid key on our `Foo` type. Because TypeScript types don't exist at runtime, there is no way to detect this error if `oneOf` only took the object parameter.

By enforcing all keys of `Foo` are passed as a tuple at runtime, it's now possible to detect this error (because `invalidKey` isn't part of the tuple!)

```typescript
interface Foo {
  bar?: string;
  baz?: number;
}

function doSomething(foo: Foo) {
  const validatedFoo = oneOf(foo, ['bar', 'baz']);
  // => throws an error as we would expect
}

const foo = {
  bar: undefined,
  invalidKey: true,
};
doSomething(foo);
```
