import { GraphQLFloat, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { assertEqual, assertThrow } from './common.test';
import { createFloatScalar, IFloatScalarConfig, isSafeFloat } from './float';

test('isSafeFloat', () => {
  expect(isSafeFloat(0)).toBe(true);
  expect(isSafeFloat(1)).toBe(true);
  expect(isSafeFloat(-1)).toBe(true);
  expect(isSafeFloat(null)).toBe(false);
  expect(isSafeFloat(true)).toBe(false);
  expect(isSafeFloat('')).toBe(false);
  expect(isSafeFloat('0')).toBe(false);
  expect(isSafeFloat(1.1)).toBe(true);
  expect(isSafeFloat(Number.NaN)).toBe(false);
  expect(isSafeFloat(Number.POSITIVE_INFINITY)).toBe(false);
  expect(isSafeFloat(Number.NEGATIVE_INFINITY)).toBe(false);
});

const getSchema = (options: IFloatScalarConfig<any, any>): GraphQLSchema =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        input: {
          type: GraphQLFloat,
          args: {
            value: {
              type: createFloatScalar(options),
            },
          },
          resolve: (_, { value }): any => value,
        },
      },
    }),
  });

describe('GraphQLInputFloat', () => {
  it('default', async () => {
    const schema = getSchema({
      name: 'float',
    });
    const value = 3.1;
    const expected = value;
    await assertEqual(schema, value, expected);
  });

  it('coerce', async () => {
    const schema = getSchema({
      name: 'float',
      coerce: parseFloat as any,
    });
    await assertEqual(schema, '3.1', 3.1);
  });

  it('coerce to null', async () => {
    const schema = getSchema({
      name: 'float',
      coerce: (): null => null,
    });
    await assertEqual(schema, '3.1', null);
  });

  it('sanitize', async () => {
    const schema = getSchema({
      name: 'float',
      sanitize: (x): number => 2 * x,
    });

    const value = 3.1;
    const expected = 6.2;

    await assertEqual(schema, value, expected);
  });

  it('sanitize to null', async () => {
    const schema = getSchema({
      name: 'float',
      sanitize: (): null => null,
    });

    await assertEqual(schema, 1, null);
  });

  it('non-float bad', async () => {
    const schema = getSchema({
      name: 'float',
    });

    const value = '3.1';

    await assertThrow(schema, value, /type/i);
  });

  it('non-float ok', async () => {
    const schema = getSchema({
      name: 'float',
    });

    const value = 3.1;

    await assertEqual(schema, value, value);
  });

  it('minimum bad', async () => {
    const schema = getSchema({
      name: 'float',
      minimum: 3,
    });

    const value = 2.9;

    await assertThrow(schema, value, /minimum/i);
  });

  it('minimum ok', async () => {
    const schema = getSchema({
      name: 'float',
      minimum: 3,
    });

    const value = 3.1;

    await assertEqual(schema, value, value);
  });

  it('maximum bad', async () => {
    const schema = getSchema({
      name: 'float',
      maximum: 5,
    });

    const value = 5.1;

    await assertThrow(schema, value, /maximum/i);
  });

  it('maximum ok', async () => {
    const schema = getSchema({
      name: 'float',
      maximum: 5,
    });

    const value = 4.9;

    await assertEqual(schema, value, value);
  });

  it('validate bad', async () => {
    const schema = getSchema({
      name: 'float',
      validate: (x): boolean => x < 3,
    });

    const value = 3.1;

    await assertThrow(schema, value, /validate/i);
  });

  it('validate ok', async () => {
    const schema = getSchema({
      name: 'float',
      validate: (x): boolean => x < 3,
    });

    const value = 2.9;

    await assertEqual(schema, value, value);
  });

  it('errorHandler', async () => {
    const schema = getSchema({
      name: 'float',
      minimum: 3,
      errorHandler: (err: any): number => err.value - 3,
    });

    const value = 2;

    await assertEqual(schema, value, -1);
  });

  it('parse', async () => {
    const schema = getSchema({
      name: 'float',
      maximum: 5,
      parse: (x): number => 2 * x,
    });

    const value = 3.1;
    const expected = 6.2;

    await assertEqual(schema, value, expected);
  });
});
