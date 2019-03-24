import { MessageMap } from './message-map';

// --- MessageMap types ----------------------------------------------------- //

/**
 * Validates a string with custom logic. If a string is returned, that value is
 * used as a fallback in case the substitution string is `undefined`.
 */
export type Validator = (message: string | undefined) => boolean | string;
export type Substitution<T extends string> = RequiredSubstitution<T> | OptionalSubstitution<T>;
export type RequiredSubstitution<T extends string | never> = { [P in T]: string | (() => string) };
export type OptionalSubstitution<T extends string | never> = { [P in T]?: string | (() => string) };
/** Gets a union of keys from the given `Substitution` type. */
export type GetSubstitutionKeys<T extends Substitution<any>> = T extends Substitution<infer K> ? K : never;

// --- MessageCollection types ---------------------------------------------- //

export interface MessageCollectionSubstitution {
  default?: string;
  regex?: string | RegExp;
  validator?: Validator;
}

/** An item of a `MessageCollection` that defines `MessageMap` behavior. */
export type MessageCollectionItem = {
  message: string;
  optional?: {
    [key: string]: string | MessageCollectionSubstitution | null;
  };
  required?: {
    [key: string]: string | MessageCollectionSubstitution | null;
  };
};

/** An interface enforcing the expected shape of a `MessageCollection`. */
export interface MessageCollectionDefinition {
  [key: string]: MessageCollectionItem;
}

export type VerifiedMessageCollection<T extends any> = T[keyof T] extends MessageCollectionItem ? T : never;

export type MessageCollectionKeyedEnum<T extends MessageCollectionDefinition> = { [P in keyof T]: P };
export type MessageCollectionKeys<T extends MessageCollectionDefinition> = keyof MessageCollectionKeyedEnum<T>;

export type MessageCollectionItemToMessageMap<
  TCollection extends MessageCollectionDefinition,
  TKey extends MessageCollectionKeys<TCollection>
> = MessageMap<
  RequiredSubstitution<Exclude<keyof TCollection[TKey]['required'], symbol | number>>,
  OptionalSubstitution<Exclude<keyof TCollection[TKey]['optional'], symbol | number>>
>;
