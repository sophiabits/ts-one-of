import { describe, it } from 'vitest';
import { OneOf, oneOf } from '.';

interface Named {
  name: string;
}

interface Foo {
  bar?: string;
  baz?: Named;
}

describe('one-of', () => {
  describe('types', () => {
    it('creates a one-of type', () => {
      type OneOfFoo = OneOf<Foo>;

      {
        // eslint-disable-next-line no-unused-vars
        const foo: OneOfFoo = { bar: 'bar' };
      }

      {
        const foo: OneOfFoo = { baz: { name: 'baz' } };
      }

      {
        // @ts-expect-error
        const invalid: OneOfFoo = { bar: 'bar', baz: { name: 'baz' } };
      }

      {
        // @ts-expect-error
        const invalid: OneOfFoo = {};
      }

      {
        // @ts-expect-error
        const invalid: OneOfFoo = { bar: 42 };
      }
    });

    it('oneOf function errors if not all keys are provided', () => {
      // @ts-expect-error
      void (() => oneOf<Foo>({}, ['baz']));
    });
  });

  describe('runtime', () => {
    it('fails when no key is set', ({ expect }) => {
      expect(() => {
        oneOf<Foo>({}, ['bar', 'baz']);
      }).toThrow('No key set in oneOf type');
    });

    it('fails when multiple keys are set', ({ expect }) => {
      expect(() => {
        oneOf<Foo>({ bar: 'bar', baz: { name: 'baz' } }, ['bar', 'baz']);
      }).toThrow('Multiple keys set in oneOf type');
    });

    it('fails when an invalid key is set', ({ expect }) => {
      expect(() => {
        oneOf<Foo>({ unrecognized: 'bar' } as Foo, ['bar', 'baz']);
      }).toThrow('Key unrecognized not in oneOf type');
    });

    it('returns the correct one-of type', ({ expect }) => {
      const output = oneOf<Foo>({ bar: 'bar' }, ['bar', 'baz']);
      expect(output).toEqual({ bar: 'bar' });
    });
  });
});
