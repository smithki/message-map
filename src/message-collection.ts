// --- Imports -------------------------------------------------------------- //

import { MessageMap } from './message-map';
import {
  MessageCollectionDefinition,
  MessageCollectionItem,
  MessageCollectionItemToMessageMap,
  MessageCollectionKeyedEnum,
  MessageCollectionKeys,
  MessageCollectionSubstitution,
  Validator,
} from './types';

// --- Utilities ------------------------------------------------------------ //

/**
 * Creates a generic `Validator` function for registering keys internally to
 * `MessageCollection` instances.
 *
 * @param config - The substitutions configuration data
 * @param fallback - A fallback `Validator` to use.
 */
function createValidator(config: string | MessageCollectionSubstitution | null, fallback: Validator): Validator {
  return message => {
    if (typeof config === 'string') return config;
    if (config === null || !Object.keys(config).length) {
      return fallback(message);
    }

    let proceed: string | boolean = true;

    if (config.regex) {
      const regex = typeof config.regex === 'string' ? new RegExp(config.regex, 'i') : new RegExp(config.regex);
      proceed = regex.test(message!);
    }

    if (config.validator) {
      proceed = config.validator(message);
    }

    return proceed || config.default || fallback(message);
  };
}

// --- MessageCollection class ---------------------------------------------- //

export class MessageCollection<TCollection extends MessageCollectionDefinition | void = void> {
  /** The underlying collection definition. */
  private collection: Exclude<TCollection, void>;

  /** The underlying `MessageMap` instances. These are lazily populated and cached. */
  private messageMaps: { [P in MessageCollectionKeys<Exclude<TCollection, void>>]: MessageMap } = {} as any;

  /**
   * An enum of keys that identify `MessageMap` instances stored in this
   * `MessageCollection`.
   */
  public keys: MessageCollectionKeyedEnum<Exclude<TCollection, void>>;

  /**
   * Creates an instance of `MessageCollection`, a strongly-typed interface for
   * working with many `MessageMap` instances configured via object literals.
   * This enables use-cases where a library of `MessageMap(s)` can be configured
   * in JSON and served over a CDN.
   *
   * In TypeScript, with the
   * [`resolveJsonModule`](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
   * option, you can provide an imported JSON module and receive strongy-typed
   * `MessageMap(s)` in return.
   *
   * @param collection - A plain object implementing `MessageCollectionDefinition`.
   * @return An instance of `MessageMap`
   */
  constructor(collection: Exclude<TCollection, void>) {
    this.collection = collection;
    this.keys = {} as any;

    // Create a simple enum of collection keys mapped to their name.
    Object.keys(collection).forEach(key => {
      this.keys[key] = key;
    });
  }

  /**
   * Gets a `MessageMap` instance from the given `key`.
   *
   * @param key - A key name to idenfity the desired `MessageMap` in this collection.
   */
  public get<TKey extends MessageCollectionKeys<Exclude<TCollection, void>>>(
    key: TKey,
  ): MessageCollectionItemToMessageMap<Exclude<TCollection, void>, TKey> {
    // Check if we already build a `MessageMap` instance for the given `key`.
    if (this.messageMaps[key]) return this.messageMaps[key] as any;

    // Data shortcuts
    const item = this.collection[key] as MessageCollectionItem;
    let mm = new MessageMap(item.message);

    // Build required substitutions
    if (item.required) {
      for (const [k, config] of Object.entries(item.required)) {
        mm = mm.required(
          k,
          createValidator(config, message => typeof message !== 'undefined' && message !== null),
        ) as any;
      }
    }

    // Build optional substitutions
    if (item.optional) {
      for (const [k, config] of Object.entries(item.optional)) {
        mm = mm.optional(k, createValidator(config, () => true)) as any;
      }
    }

    // Cache the newly created `MessageMap` and return it.
    this.messageMaps[key] = mm as any;
    return mm as any;
  }
}
