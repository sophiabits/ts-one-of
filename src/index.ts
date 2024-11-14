// From: https://www.hacklewayne.com/typescript-convert-union-to-tuple-array-yes-but-how
// N.B. Converting unions to tuples is generally a bad idea.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Contra<T> = T extends any ? (arg: T) => void : never;
type InferContra<T> = [T] extends [(arg: infer I) => void] ? I : never;
type PickOne<T> = InferContra<InferContra<Contra<Contra<T>>>>;
type Union2Tuple<T> =
  PickOne<T> extends infer U
    ? Exclude<T, U> extends never
      ? [T]
      : [...Union2Tuple<Exclude<T, U>>, U]
    : never;

/**
 * Turns a single object type into a union of objects, each with only a single key
 * from the original object set.
 *
 * @see https://github.com/graphql/graphql-spec/pull/825
 */
export type OneOf<Object> = OneOfRec<Object, keyof Object>;

type OneOfObject<Object, Key extends keyof Object> = Required<Pick<Object, Key>> &
  Partial<Record<Exclude<keyof Object, Key>, undefined>>;
type OneOfRec<Object, RemainingKeys extends keyof Object> =
  Union2Tuple<RemainingKeys> extends [infer Left, ...infer Right]
    ? Left extends keyof Object
      ? Right[number] extends keyof Object
        ? OneOfObject<Object, Left> | OneOfRec<Object, Right[number]>
        : never
      : never
    : never;

export class OneOfError extends Error {}

/**
 * Given an input object, validates it is a valid `oneOf` type and returns it.
 *
 * If the input object is not a valid `oneOf` type (e.g. no field set, multiple fields set,
 * contains key that isn't a part of the `oneOf` type), throws an error.
 *
 * @throws {OneOfError}
 */
export function oneOf<T extends object>(input: T, allKeys: Union2Tuple<keyof T>): OneOf<T> {
  const setKeys = new Set<keyof T>();

  const allKeysArray = allKeys as (keyof T)[];
  for (const key of Object.keys(input)) {
    if (!allKeysArray.includes(key as keyof T)) {
      throw new OneOfError(`Key ${key} not in oneOf type`);
    }

    const thisKey = key as keyof T;
    if (input[thisKey]) {
      setKeys.add(thisKey);
    }
  }

  if (setKeys.size === 0) {
    throw new OneOfError('No key set in oneOf type');
  }
  if (setKeys.size > 1) {
    throw new OneOfError('Multiple keys set in oneOf type');
  }

  return input as OneOf<T>;
}
