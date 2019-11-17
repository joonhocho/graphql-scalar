import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { assertEqual, assertThrow } from './common.test';
import { createStringScalar, IStringScalarConfig } from './string';

const getSchema = (options: IStringScalarConfig<any, any>): GraphQLSchema =>
  new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        input: {
          type: GraphQLString,
          args: {
            value: {
              type: createStringScalar(options),
            },
          },
          resolve: (_, { value }): any => value,
        },
      },
    }),
  });

describe('GraphQLString', () => {
  it('basic', async () => {
    const schema = getSchema({ name: 'string' });
    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    await assertEqual(schema, value, value);
  });

  it('null', async () => {
    const schema = getSchema({ name: 'string' });
    await assertEqual(schema, null, null);
  });

  it('coerce', async () => {
    const schema = getSchema({
      name: 'string',
      coerce: (x: any): any => x || null,
    });
    await assertEqual(schema, 3, '3');
    await assertEqual(schema, 0, null);
  });

  it('trim', async () => {
    const schema = getSchema({
      name: 'string',
      trim: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';

    await assertEqual(schema, value, value.trim());
  });

  it('trimLeft', async () => {
    const schema = getSchema({
      name: 'string',
      trimLeft: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';

    await assertEqual(schema, value, value.trimLeft());
  });

  it('trimRight', async () => {
    const schema = getSchema({
      name: 'string',
      trimRight: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';

    await assertEqual(schema, value, value.trimRight());
  });

  it('singleline', async () => {
    const schema = getSchema({
      name: 'string',
      singleline: '.',
    });

    const value = '\nHello\n World\n \nHi';

    await assertEqual(schema, value, '.Hello. World. .Hi');
  });

  it('collapseWhitespace', async () => {
    const schema = getSchema({
      name: 'string',
      collapseWhitespace: true,
    });

    const value = '   Hello  \n   World\n ';

    await assertEqual(schema, value, ' Hello\nWorld\n');
  });

  it('collapseWhitespaceSingleline', async () => {
    const schema = getSchema({
      name: 'string',
      collapseWhitespace: true,
      singleline: ' ',
    });

    const value = ' \n\t\r  Hello   \n  World';
    const expected = ' Hello World';

    await assertEqual(schema, value, expected);
  });

  it('empty bad', async () => {
    const schema = getSchema({
      name: 'string',
      nonEmpty: true,
    });

    const value = '';
    await assertThrow(schema, value, /empty/i);
  });

  it('empty ok', async () => {
    const schema = getSchema({
      name: 'string',
    });

    const value = '';

    await assertEqual(schema, value, value);
  });

  it('truncate', async () => {
    const schema = getSchema({
      name: 'string',
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.substring(0, 10);

    await assertEqual(schema, value, expected);
  });

  it('truncate no effect', async () => {
    const schema = getSchema({
      name: 'string',
      truncate: 10,
    });

    const value = ' 921hlu';
    const expected = value;

    await assertEqual(schema, value, expected);
  });

  it('trim and truncate', async () => {
    const schema = getSchema({
      name: 'string',
      trim: true,
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trim().substring(0, 10);

    await assertEqual(schema, value, expected);
  });

  it('upperCase', async () => {
    const schema = getSchema({
      name: 'string',
      uppercase: true,
    });

    const value = ' 921hluAoCb1 au0[g2930,0.Uh, ';
    const expected = value.toUpperCase();

    await assertEqual(schema, value, expected);
  });

  it('lowerCase', async () => {
    const schema = getSchema({
      name: 'string',
      lowercase: true,
    });

    const value = ' 921HluAOCB1 au0[G2930,0.uh, ';
    const expected = value.toLowerCase();

    await assertEqual(schema, value, expected);
  });

  it('capitalize', async () => {
    const schema = getSchema({
      name: 'string',
      capitalize: 'first',
    });

    const value = 'hello my friend.';
    const expected = 'Hello my friend.';

    await assertEqual(schema, value, expected);
  });

  it('capitalize characters', async () => {
    const schema = getSchema({
      name: 'string',
      capitalize: 'characters',
    });

    const value = 'hello my friend.';
    const expected = 'HELLO MY FRIEND.';

    await assertEqual(schema, value, expected);
  });

  it('capitalize words', async () => {
    const schema = getSchema({
      name: 'string',
      capitalize: 'words',
    });

    const value = 'hello my friend.';
    const expected = 'Hello My Friend.';

    await assertEqual(schema, value, expected);
  });

  it('capitalize sentences', async () => {
    const schema = getSchema({
      name: 'string',
      capitalize: 'sentences',
    });

    const value = 'hello my friend. hello my friend.';
    const expected = 'Hello my friend. Hello my friend.';

    await assertEqual(schema, value, expected);
  });

  it('capitalize empty string', async () => {
    const schema = getSchema({
      name: 'string',
      capitalize: 'first',
    });

    const value = '';
    const expected = '';

    await assertEqual(schema, value, expected);
  });

  it('trim and capitalize', async () => {
    const schema = getSchema({
      name: 'string',
      trim: true,
      capitalize: 'first',
    });

    const value = '  hello my friend. ';
    const expected = 'Hello my friend.';

    await assertEqual(schema, value, expected);
  });

  it('sanitize', async () => {
    const schema = getSchema({
      name: 'string',
      sanitize: (s): string => s.replace(/[^\d]*/g, ''),
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = '9211029300';

    await assertEqual(schema, value, expected);
  });

  it('non-string bad', async () => {
    const schema = getSchema({
      name: 'string',
    });

    await assertThrow(schema, true, /type/i);
    await assertThrow(schema, false, /type/i);
    await assertThrow(schema, 3, /type/i);
    await assertThrow(schema, 3.5, /type/i);
  });

  it('sanitize to null', async () => {
    const schema = getSchema({
      name: 'string',
      sanitize: (x): string | null => x || null,
    });
    const value = '';
    await assertEqual(schema, value, null);
  });

  it('non-null error', async () => {
    const schema = getSchema({
      name: 'string',
      sanitize: (x): string | null => x || null,
    });
    const value = '';
    await assertEqual(schema, value, null);
  });

  it('non-string ok', async () => {
    const schema = getSchema({
      name: 'string',
    });

    const value = '3';

    await assertEqual(schema, value, value);
  });

  it('maxEmptyLines', async () => {
    const schema = getSchema({
      name: 'string',
      trim: true,
      collapseWhitespace: true,
      maxEmptyLines: 1,
    });

    const value =
      '\n\n  a \t\n  \n   \n   \n   b  \n c\r\n\r\nd\r\n\n\ne\r\r\r\rf   \n\n';

    await assertEqual(schema, value, 'a\n\nb\nc\n\nd\n\ne\n\nf');
  });

  it('minLength bad', async () => {
    const schema = getSchema({
      name: 'string',
      minLength: 3,
    });

    const value = 'ab';

    await assertThrow(schema, value, /minLength/i);
  });

  it('minLength ok', async () => {
    const schema = getSchema({
      name: 'string',
      minLength: 3,
    });

    const value = 'abc';

    await assertEqual(schema, value, value);
  });

  it('maxLength bad', async () => {
    const schema = getSchema({
      name: 'string',
      maxLength: 5,
    });

    const value = 'abcdef';

    await assertThrow(schema, value, /maxLength/i);
  });

  it('maxLength ok', async () => {
    const schema = getSchema({
      name: 'string',
      maxLength: 5,
    });

    const value = 'abcde';

    await assertEqual(schema, value, value);
  });

  it('pattern bad', async () => {
    const schema = getSchema({
      name: 'string',
      pattern: /^\w+$/,
    });

    const value = ' a ';

    await assertThrow(schema, value, /pattern/i);
  });

  it('pattern ok', async () => {
    const schema = getSchema({
      name: 'string',
      pattern: /^\w+$/,
    });

    const value = 'abc';

    await assertEqual(schema, value, value);
  });

  it('pattern string ok', async () => {
    const schema = getSchema({
      name: 'string',
      pattern: '^\\w+$',
    });

    const value = 'abc';

    await assertEqual(schema, value, value);
  });

  it('validate bad', async () => {
    const schema = getSchema({
      name: 'string',
      validate: (x): boolean => x.length < 3,
    });

    const value = 'abc';

    await assertThrow(schema, value, /validate/i);
  });

  it('validate ok', async () => {
    const schema = getSchema({
      name: 'string',
      validate: (x): boolean => x.length < 3,
    });

    const value = 'ab';

    await assertEqual(schema, value, value);
  });

  it('parse', async () => {
    const schema = getSchema({
      name: 'string',
      minLength: 5, // not forced to parse.
      parse: (s): string => s.substring(0, 3),
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.substring(0, 3);

    await assertEqual(schema, value, expected);
  });

  it('errorHandler', async () => {
    const schema = getSchema({
      name: 'string',
      errorHandler: (): string => 'there was error',
    });

    const value = 4;

    await assertEqual(schema, value, 'there was error');
  });

  it('description', () => {
    const description = 'this is description';
    const type = createStringScalar({
      name: 'string',
      description,
    });
    expect(type.description).toEqual(description);
  });

  it('serialize', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: createStringScalar({
              name: 'string',
              trim: true,
            }),
            resolve: (): string => ' test ',
          },
        },
      }),
    });

    const res = await graphql(schema, '{ output }');

    // trim is only applied to input
    expect(res.data!.output).toEqual(' test ');
  });
});
