import { GraphQLScalarType } from 'graphql';
import { ValueNode } from 'graphql/language';
import {
  defaultErrorHandler,
  defaultSerialize,
  getValueFromValueNode,
} from './common';
import { IScalarConfig } from './ts';

export type IntScalarErrorCode = 'type' | 'minimum' | 'maximum' | 'validate';

export interface IIntScalarConfig<TInternal = number, TExternal = number>
  extends IScalarConfig<
    IIntScalarConfig<TInternal, TExternal>,
    IntScalarErrorCode,
    number,
    TInternal,
    TExternal
  > {
  maximum?: number;
  minimum?: number;
}

// https://github.com/graphql/graphql-js/blob/master/src/type/scalars.js
const MAX_INT = 2147483647;
const MIN_INT = -2147483648;

export const isSafeInteger = (n: unknown): n is number =>
  typeof n === 'number' &&
  isFinite(n) &&
  Math.floor(n) === n &&
  n <= MAX_INT &&
  n >= MIN_INT;

export const createIntScalar = <TInternal = string, TExternal = string>(
  config: IIntScalarConfig<TInternal, TExternal>
): GraphQLScalarType => {
  const {
    coerce,
    errorHandler,
    maximum,
    minimum,
    parse,
    sanitize,
    validate,
    serialize,
    ...scalarConfig
  } = config;

  const handleError = errorHandler || defaultErrorHandler;

  const parseValue = (
    unknownValue: unknown,
    ast?: ValueNode
  ): TInternal | null => {
    // null inputs don't come here
    // Coersion Phase

    if (unknownValue == null) {
      return null;
    }

    let value: number;
    if (isSafeInteger(unknownValue)) {
      value = unknownValue;
    } else {
      if (coerce) {
        const valueOrNull = coerce(unknownValue);
        if (valueOrNull == null) {
          return null;
        }
        value = valueOrNull;
      } else {
        return handleError({
          code: 'type',
          originalValue: unknownValue,
          value: unknownValue,
          ast,
          config,
        });
      }
    }

    // Sanitization Phase

    if (sanitize && value != null) {
      const valueOrNull = sanitize(value);
      if (valueOrNull == null) {
        return null;
      }
      value = valueOrNull;
    }

    // Validation Phase

    if (minimum != null && value < minimum) {
      return handleError({
        code: 'minimum',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    if (maximum != null && value > maximum) {
      return handleError({
        code: 'maximum',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    if (validate && !validate(value)) {
      return handleError({
        code: 'validate',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    // Parse Phase

    if (parse) {
      return parse(value);
    }

    return value as any;
  };

  return new GraphQLScalarType({
    ...scalarConfig,
    serialize: serialize || defaultSerialize,
    parseValue,
    parseLiteral: (ast): TInternal | null =>
      parseValue(getValueFromValueNode(ast), ast),
  });
};
