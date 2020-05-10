import { MessageMap } from './message-map';

// --- MessageMap types ----------------------------------------------------- //

/**
 * Validates a string with custom logic. If a string is returned, that value is
 * used as a fallback in case the substitution string is `undefined`.
 */
export type Validator = (message: string | undefined) => boolean | string;

export type Substitution<T extends string> = RequiredSubstitution<T> | OptionalSubstitution<T>;
export type RequiredSubstitution<T extends string> = { [P in T]: string | (() => string) };
export type OptionalSubstitution<T extends string> = { [P in T]?: string | (() => string) };

/**
 * Gets a union of keys from the given `Substitution` type.
 */
export type GetSubstitutionKeys<T extends Substitution<any>> = T extends Substitution<infer K> ? K : never;

/**
 * Gets the required substitutions type from the given `MessageMap` type.
 */
export type GetRequiredSubstitutions<T extends MessageMap<any, any>> = T extends MessageMap<infer K, any> ? K : never;

/**
 * Gets the optional substitutions type from the given `MessageMap` type.
 */
export type GetOptionalSubstitutions<T extends MessageMap<any, any>> = T extends MessageMap<any, infer K> ? K : never;

type NarrowArgumentByOptionalSubstitutions<T extends MessageMap<any, any>> = GetSubstitutionKeys<
  GetOptionalSubstitutions<T>
> extends never
  ? [void]
  : [(GetRequiredSubstitutions<T> & GetOptionalSubstitutions<T>) | void];

type NarrowArgumentByRequiredSubstitutions<T extends MessageMap<any, any>> = GetSubstitutionKeys<
  GetRequiredSubstitutions<T>
> extends never
  ? NarrowArgumentByOptionalSubstitutions<T>
  : [GetRequiredSubstitutions<T> & GetOptionalSubstitutions<T>];

/**
 * Builds a strongly-typed argument interface for consuming substitutions
 * dynamically.
 */
export type GetSubstitutionsArgument<
  TArgumentType extends Substitution<any>,
  TMessageMap extends MessageMap<any, any>
> = TArgumentType extends RequiredSubstitution<any>
  ? NarrowArgumentByRequiredSubstitutions<TMessageMap>
  : NarrowArgumentByOptionalSubstitutions<TMessageMap>;

// --- MessageCollection types ---------------------------------------------- //

export interface MessageCollectionSubstitution {
  default?: string;
  regex?: string | RegExp;
  validator?: Validator;
}

/**
 * An item of a `MessageCollection` that defines `MessageMap` behavior.
 */
export type MessageCollectionItem =
  | string
  | {
      template: string;
      optional?: {
        [key: string]: string | MessageCollectionSubstitution | null;
      };
      required?: {
        [key: string]: string | MessageCollectionSubstitution | null;
      };
    };

/**
 * An interface enforcing the expected shape of a `MessageCollection`.
 */
export interface MessageCollectionDefinition {
  [key: string]: MessageCollectionItem;
}

export type VerifiedMessageCollection<T extends any> = T[keyof T] extends MessageCollectionItem ? T : never;

export type MessageCollectionKeyedEnum<T extends MessageCollectionDefinition> = { [P in keyof T]: P };
export type MessageCollectionKeys<T extends MessageCollectionDefinition> = keyof MessageCollectionKeyedEnum<T>;

export type MessageCollectionItemToMessageMap<TItem extends MessageCollectionItem> = TItem extends string
  ? MessageMap
  : MessageMap<
      RequiredSubstitution<Exclude<keyof Exclude<TItem, string>['required'], symbol | number>>,
      OptionalSubstitution<Exclude<keyof Exclude<TItem, string>['optional'], symbol | number>>
    >;
