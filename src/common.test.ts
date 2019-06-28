import { graphql, GraphQLSchema } from 'graphql';

export const runQuery = async (
  schema: GraphQLSchema,
  value: any
): Promise<any> => {
  const res = await graphql(
    schema,
    `{ input(value: ${JSON.stringify(value)}) }`
  );
  const { data, errors } = res;
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data!.input;
};

export const assertEqual = async (
  schema: GraphQLSchema,
  value: any,
  expected: any
): Promise<void> => {
  const actual = await runQuery(schema, value);
  return expect(actual).toEqual(expected);
};

export const assertThrow = async (
  schema: GraphQLSchema,
  value: any,
  pattern: any
): Promise<void> => {
  await expect(runQuery(schema, value)).rejects.toThrowError(pattern);
};

test('', () => {
  expect(1).toBe(1);
});
