// --- Imports -------------------------------------------------------------- //

import { Expect, SetupFixture, SpyOn, Test, TestFixture } from 'alsatian';
import { MessageMap } from '../../src/lib';

// -------------------------------------------------------------------------- //

const base = 'hello world %one %two %three %four';
const qwerty = 'qwerty';
const foo = 'foo';
const bar = 'bar';
const baz = 'baz';

@TestFixture('MessageMap tests')
export class MessageMapTestFixture {
  mm: MessageMap;

  @SetupFixture
  public beforeAllTests() {
    this.mm = new MessageMap(base);
  }

  @Test('It replaces all substitutions without error')
  public replaceSubstitutionsWithoutErrorTest() {
    const mm = this.mm
      .optional('one')
      .required('two')
      .required('three')
      .optional('four');

    const result = mm.toString({ one: bar, two: qwerty, three: foo, four: baz });

    Expect(result).toEqual(`hello world ${bar} ${qwerty} ${foo} ${baz}`);
  }

  @Test('It raises an error if a required substitution is missing or `undefined`.')
  public missingRequiredSubstitutionTest() {
    const mm = this.mm
      .optional('one')
      .required('two')
      .required('three')
      .optional('four');

    const spy = SpyOn(mm, 'toString');
    const substitutionConfig = { one: bar, two: qwerty, four: baz };

    try {
      mm.toString(substitutionConfig as any);
    } catch (err) {
      Expect(err).toBeDefined();
    } finally {
      Expect(spy).toHaveBeenCalledWith(substitutionConfig);
    }
  }

  @Test('It DOES NOT raise an error if an optional substitution is missing or `undefined`.')
  public missingOptionalSubstitutionTest() {
    const mm = this.mm
      .optional('one')
      .required('two')
      .required('three')
      .optional('four');

    const spy = SpyOn(mm, 'toString');
    const substitutionConfig = { two: qwerty, three: foo, four: baz };

    let result: string;
    try {
      result = mm.toString(substitutionConfig as any);
    } catch (err) {
      Expect(err).not.toBeDefined();
    } finally {
      Expect(spy).toHaveBeenCalledWith(substitutionConfig);
      Expect(result).toEqual(`hello world %one ${qwerty} ${foo} ${baz}`);
    }
  }
}
