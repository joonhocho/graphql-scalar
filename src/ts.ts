import { GraphQLScalarTypeConfig, ValueNode } from 'graphql';
import { ExcludeKeys } from 'tsdef';

export interface IScalarParseError<TConfig, TCode = string> {
  code: TCode;
  originalValue: unknown;
  value: unknown;
  ast?: ValueNode;
  config: TConfig;
}

// may throw
export type ScalarParseErrorHandler<TInternal, TConfig, TCode = string> = (
  errorInfo: IScalarParseError<TConfig, TCode>
) => TInternal;

// coerce raw external input value into internal value
export type ScalarCoerceFunction<T> = (raw: unknown) => T | null | undefined;

export type ScalarSanitizeFunction<T> = (value: T) => T | null | undefined;

export type ScalarValidateFunction<T> = (value: T) => boolean;

export type ScalarParseFunction<T, U> = (value: T) => U;

export type ScalarSerializeFunction<T, U> = (value: T) => U;

// lifecycle
// coerce -> sanitize -> validate -> parse

export interface IScalarConfig<
  TConfig,
  TErrorCode,
  TValue,
  TInternal,
  TExternal
>
  extends ExcludeKeys<
    GraphQLScalarTypeConfig<TInternal, TExternal>,
    'serialize' | 'parseValue' | 'parseLiteral'
  > {
  coerce?: ScalarCoerceFunction<TValue>;
  errorHandler?: ScalarParseErrorHandler<TInternal, TConfig, TErrorCode>;
  parse?: ScalarParseFunction<TValue, TInternal>;
  sanitize?: ScalarSanitizeFunction<TValue>;
  serialize?: ScalarSerializeFunction<TInternal, TExternal>;
  validate?: ScalarValidateFunction<TValue>;
}
