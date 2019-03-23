// --- Imports -------------------------------------------------------------- //

import { OptionalSubstitution, RequiredSubstitution, Substitution, Validator, WidenSubstitutions } from './types';

// --- MessageMap class ----------------------------------------------------- //

export class MessageMap<TSubstitutions extends Substitution<any> | void = void> {
  /** The underlying base message string. */
  private message: string;

  /** Configured substitutions. */
  private substitutions: { [key: string]: Validator } = {};

  /**
   * Creates an instance of `MessageMap`, a strongly-typed interface for building dynamic strings. Your base `message`
   * may contain substrings like: `"%name"`, which is replaced by a substitution keyed as `name`. So `"Hello, %name!"`
   * might form into `"Hello, Nancy!"` or `"Hello, George!"`.
   *
   * @param message - The base message.
   * @return An instance of `MessageMap`
   */
  constructor(message: string) {
    this.message = message;
  }

  /**
   * Registers an optional substitution.
   *
   * @param name - The name by which to identify this substitution in the `message` string.
   * @param validator - An optional validation function to test replacement strings against.
   * @return A new instance of `MessageMap` with an expanded type signature.
   */
  public optional<T extends string>(
    name: T,
    validator: Validator = () => true,
  ): MessageMap<WidenSubstitutions<OptionalSubstitution<T>, TSubstitutions>> {
    const nextInst = new MessageMap(this.message);
    nextInst.substitutions = { ...this.substitutions };
    nextInst.substitutions[name] = validator;
    return nextInst as any;
  }

  /**
   * Registers a required substitution.
   *
   * @param name - The name by which to identify this substitution in the `message` string.
   * @param validator - An optional validation function to test replacement strings against.
   * @return A new instance of `MessageMap` with an expanded type signature.
   */
  public required<T extends string>(
    name: T,
    validator: Validator = message => typeof message !== 'undefined' && message !== null,
  ): MessageMap<WidenSubstitutions<RequiredSubstitution<T>, TSubstitutions>> {
    const nextInst = new MessageMap(this.message);
    nextInst.substitutions = { ...this.substitutions };
    nextInst.substitutions[name] = validator;
    return nextInst as any;
  }

  /**
   * Transform the underlying `message` into a string with interpolated
   * substitutions.
   *
   * @param substitutions - A plain object of substitutions to replace keys in
   * the `message` string.
   * @return The formed and validated string.
   */
  public toString<T extends TSubstitutions>(
    ...substitutions: T extends RequiredSubstitution<any> ? [TSubstitutions] : [TSubstitutions | void]
  ): string {
    let result = this.message;
    const substitutionsQualified: any = !!substitutions.length ? substitutions[0] : {};

    for (const [name, validator] of Object.entries(this.substitutions)) {
      const replacer = substitutionsQualified[name];
      const replacement = typeof replacer === 'function' ? replacer() : replacer;

      const isValid = validator(replacement);
      if (typeof isValid !== 'string' && !isValid) {
        const sub = `"%${name}"`;
        const msg = `"${this.message}"`;
        const received =
          typeof replacement === 'undefined' || replacement === null ? String(replacement) : `"${replacement}"`;
        throw new Error(`[MessageMap] Validation failed.\n\nSubstitution: ${sub} in ${msg}\nReceived: ${received}\n`);
      }

      const re = new RegExp(`%${name}`, 'g');

      if (replacement) {
        result = result.replace(re, replacement);
      } else if (typeof isValid === 'string') {
        result = result.replace(re, isValid);
      }
    }

    return result;
  }
}