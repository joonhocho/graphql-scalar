import { GraphQLInt, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { assertEqual, assertThrow } from './common.test';
import { createIntScalar, IIntScalarConfig, isSafeInteger } from './int';

const getSchema = (options: IIntScalarConfig<any, any>): GraphQLSchema =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        input: {
          type: GraphQLInt,
          args: {
            value: {
              type: createIntScalar(options),
            },
          },
          resolve: (_, { value }): any => value,
        },
      },
    }),
  });

test('isSafeInteger', () => {
  expect(isSafeInteger(0)).toBe(true);
  expect(isSafeInteger(1)).toBe(true);
  expect(isSafeInteger(-1)).toBe(true);
  expect(isSafeInteger(null)).toBe(false);
  expect(isSafeInteger(true)).toBe(false);
  expect(isSafeInteger('')).toBe(false);
  expect(isSafeInteger('0')).toBe(false);
  expect(isSafeInteger(1.1)).toBe(false);
  expect(isSafeInteger(Number.NaN)).toBe(false);
  expect(isSafeInteger(Number.POSITIVE_INFINITY)).toBe(false);
  expect(isSafeInteger(Number.NEGATIVE_INFINITY)).toBe(false);
});

describe('GraphQLInputInt', () => {
  it('default', async () => {
    const schema = getSchema({
      name: 'int',
    });
    const value = 3;
    const expected = value;
    await assertEqual(schema, value, expected);
  });

  it('coerce', async () => {
    const schema = getSchema({
      name: 'int',
      coerce: parseInt as any,
    });
    await assertEqual(schema, '3', 3);
  });

  it('coerce to null', async () => {
    const schema = getSchema({
      name: 'int',
      coerce: (): null => null,
    });
    await assertEqual(schema, '3', null);
  });

  it('sanitize', async () => {
    const schema = getSchema({
      name: 'int',
      sanitize: (x): number => 2 * x,
    });
    const value = 3;
    const expected = 6;
    await assertEqual(schema, value, expected);
  });

  it('sanitize to null', async () => {
    const schema = getSchema({
      name: 'int',
      sanitize: (): null => null,
    });
    await assertEqual(schema, 1, null);
  });

  it('non-int bad', async () => {
    const schema = getSchema({
      name: 'int',
    });
    const value = '3';
    await assertThrow(schema, value, /type/i);
  });

  it('non-int ok', async () => {
    const schema = getSchema({
      name: 'int',
    });
    const value = 3;
    await assertEqual(schema, value, value);
  });

  it('float bad', async () => {
    const schema = getSchema({
      name: 'int',
    });
    const value = 3.5;
    await assertThrow(schema, value, /type/i);
  });

  it('minimum bad', async () => {
    const schema = getSchema({
      name: 'int',
      minimum: 3,
    });
    const value = 2;
    await assertThrow(schema, value, /minimum/i);
  });

  it('minimum ok', async () => {
    const schema = getSchema({
      name: 'int',
      minimum: 3,
    });
    const value = 3;
    await assertEqual(schema, value, value);
  });

  it('maximum bad', async () => {
    const schema = getSchema({
      name: 'int',
      maximum: 5,
    });
    const value = 6;
    await assertThrow(schema, value, /maximum/i);
  });

  it('maximum ok', async () => {
    const schema = getSchema({
      name: 'int',
      maximum: 5,
    });
    const value = 5;
    await assertEqual(schema, value, value);
  });

  it('validate bad', async () => {
    const schema = getSchema({
      name: 'int',
      validate: (x): boolean => x < 3,
    });
    const value = 3;
    await assertThrow(schema, value, /validate/i);
  });

  it('validate ok', async () => {
    const schema = getSchema({
      name: 'int',
      validate: (x): boolean => x < 3,
    });
    const value = 2;
    await assertEqual(schema, value, value);
  });

  it('errorHandler', async () => {
    const schema = getSchema({
      name: 'int',
      minimum: 3,
      errorHandler: (err: any): number => err.value - 3,
    });
    const value = 2;
    await assertEqual(schema, value, -1);
  });

  it('parse', async () => {
    const schema = getSchema({
      name: 'int',
      maximum: 5,
      parse: (x): number => 2 * x,
    });
    const value = 3;
    const expected = 6;
    await assertEqual(schema, value, expected);
  });
});
