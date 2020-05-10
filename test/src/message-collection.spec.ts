// --- Imports -------------------------------------------------------------- //

import { Expect, SetupFixture, Test, TestFixture } from 'alsatian';
import { MessageCollection } from '../../src/message-collection';

// -------------------------------------------------------------------------- //

const base = 'hello world %one %two';
const qwerty = 'qwerty';
const foo = 'foo';
const bar = 'bar';
const baz = 'baz';

const definition = {
  HELLO: {
    template: base,
    optional: {
      one: null,
    },
    required: {
      two: null,
    },
  },

  HAS_VALIDATOR: {
    template: base,
    optional: { one: { validator: () => qwerty } },
  },

  HAS_REGEX: {
    template: base,
    required: { one: { regex: '^qwe' } },
  },

  IS_STRING_ITEM: qwerty,
};

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

  @Test('It calls `toString` on a top-level message definition that is a string.')
  public toStringSimpleConfigTest() {
    const result = this.mc.get(this.mc.keys.IS_STRING_ITEM).toString();

    Expect(result).toEqual(qwerty);
  }
}
