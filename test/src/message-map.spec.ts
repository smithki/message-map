// --- Imports -------------------------------------------------------------- //

import { Expect, SetupFixture, Test, TestFixture } from 'alsatian';
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
}
