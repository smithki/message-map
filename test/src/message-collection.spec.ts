// --- Imports -------------------------------------------------------------- //

import { Expect, SetupFixture, SpyOn, Test, TestFixture } from 'alsatian';
import { MessageCollection } from '../../src/message-collection';

// -------------------------------------------------------------------------- //

const base = 'hello world %one %two';

const definition = {
  HELLO: {
    message: base,
    optional: {
      one: null,
    },
    required: {
      two: null,
    },
  },

  HAS_VALIDATOR: {
    message: base,
    optional: { one: { validator: () => qwerty } },
  },

  HAS_REGEX: {
    message: base,
    required: { one: { regex: '^qwe' } },
  },
};

const qwerty = 'qwerty';
const foo = 'foo';
const bar = 'bar';
const baz = 'baz';

@TestFixture('MessageMap tests')
export class MessageMapTestFixture {
  mc: MessageCollection<typeof definition>;

  @SetupFixture
  public beforeAllTests() {
    this.mc = new MessageCollection(definition);
  }

  @Test('It replaces all substitutions without error')
  public replaceSubstitutionsWithoutErrorTest() {
    const result = this.mc.get(this.mc.keys.HELLO).toString({
      one: qwerty,
      two: bar,
    });

    Expect(result).toEqual(`hello world ${qwerty} ${bar}`);
  }

  @Test('It executes the defined validator')
  public validatorTest() {
    const result = this.mc.get(this.mc.keys.HAS_VALIDATOR).toString();

    Expect(result).toEqual(`hello world ${qwerty} %two`);
  }
}
