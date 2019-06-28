import { GraphQLScalarType } from 'graphql';
import { ValueNode } from 'graphql/language';
import {
  defaultErrorHandler,
  defaultSerialize,
  getValueFromValueNode,
} from './common';
import { IScalarConfig } from './ts';

// https://github.com/graphql/graphql-js/blob/master/src/type/scalars.js

export type FloatScalarErrorCode = 'type' | 'minimum' | 'maximum' | 'validate';

export interface IFloatScalarConfig<TInternal = number, TExternal = number>
  extends IScalarConfig<
    IFloatScalarConfig<TInternal, TExternal>,
    FloatScalarErrorCode,
    number,
    TInternal,
    TExternal
  > {
  maximum?: number;
  minimum?: number;
}

export const isSafeFloat = (n: unknown): n is number =>
  typeof n === 'number' && isFinite(n);

export const createFloatScalar = <TInternal = string, TExternal = string>(
  config: IFloatScalarConfig<TInternal, TExternal>
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
    if (isSafeFloat(unknownValue)) {
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
