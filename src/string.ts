import { GraphQLScalarType } from 'graphql';
import { ValueNode } from 'graphql/language';
import {
  defaultErrorHandler,
  defaultSerialize,
  getValueFromValueNode,
} from './common';
import { IScalarConfig } from './ts';

export type StringScalarErrorCode =
  | 'type'
  | 'empty'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'validate';

export interface IStringScalarConfig<TInternal = string, TExternal = string>
  extends IScalarConfig<
    IStringScalarConfig<TInternal, TExternal>,
    StringScalarErrorCode,
    string,
    TInternal,
    TExternal
  > {
  capitalize?: 'characters' | 'words' | 'sentences' | 'first';
  collapseWhitespace?: boolean;
  lowercase?: boolean;
  maxLength?: number;
  minLength?: number;
  nonEmpty?: boolean;
  pattern?: RegExp | string;
  singleline?: string;
  trim?: boolean;
  trimLeft?: boolean;
  trimRight?: boolean;
  truncate?: number;
  uppercase?: boolean;
}

const strToUpperCase = (str: string): string => str.toUpperCase();

const wordRegex = /(?:^|\s)\S/g;

const sentenceRegex = /(?:^|\.\s)\S/g;

const newlineRegex = /[\r\n]+/g;

const newlineWithWSRegex = /\s*[\r\n]+\s*/g;

const whitespace = /\s+/g;

const collapseWS = (str: string): string => str.replace(whitespace, ' ');

export const createStringScalar = <TInternal = string, TExternal = string>(
  config: IStringScalarConfig<TInternal, TExternal>
): GraphQLScalarType => {
  const {
    capitalize,
    coerce,
    collapseWhitespace,
    errorHandler,
    lowercase,
    maxLength,
    minLength,
    nonEmpty,
    parse,
    pattern,
    sanitize,
    serialize,
    singleline,
    trim,
    trimLeft,
    trimRight,
    truncate,
    uppercase,
    validate,
    ...scalarConfig
  } = config;

  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

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

    let value: string;
    if (typeof unknownValue === 'string') {
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

    if (value) {
      if (trim) {
        value = value.trim();
      } else {
        if (trimLeft) {
          value = value.trimLeft();
        }
        if (trimRight) {
          value = value.trimRight();
        }
      }

      if (value) {
        if (singleline) {
          value = value.replace(newlineRegex, singleline);
        }

        if (collapseWhitespace) {
          if (singleline) {
            // newlines replaced already
            value = value.replace(whitespace, ' ');
          } else {
            value = value
              .split(newlineWithWSRegex)
              .map(collapseWS)
              .join('\n');
          }
        }

        if (truncate != null && value.length > truncate) {
          value = value.substring(0, truncate);
        }

        if (uppercase) {
          value = value.toUpperCase();
        } else if (lowercase) {
          value = value.toLowerCase();
        }

        if (capitalize) {
          switch (capitalize) {
            case 'characters':
              value = value.toUpperCase();
              break;
            case 'words':
              value = value.replace(wordRegex, strToUpperCase);
              break;
            case 'sentences':
              value = value.replace(sentenceRegex, strToUpperCase);
              break;
            case 'first':
            default:
              value = value[0].toUpperCase() + value.slice(1);
              break;
          }
        }
      }
    }

    if (sanitize) {
      const valueOrNull = sanitize(value);
      if (valueOrNull == null) {
        return null;
      }
      value = valueOrNull;
    }

    // Validation Phase

    if (nonEmpty && !value) {
      return handleError({
        code: 'empty',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    if (minLength != null && value.length < minLength) {
      return handleError({
        code: 'minLength',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    if (maxLength != null && value.length > maxLength) {
      return handleError({
        code: 'maxLength',
        originalValue: unknownValue,
        value,
        ast,
        config,
      });
    }

    if (regex != null && !regex.test(value)) {
      return handleError({
        code: 'pattern',
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
