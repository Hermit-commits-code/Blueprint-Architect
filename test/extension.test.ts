import * as assert from 'assert';
import { toPascalCase, toKebabCase, toSnakeCase } from '../src/utils/case';

describe('Case Transformation Utilities', () => {
  it('should convert to PascalCase', () => {
    assert.strictEqual(toPascalCase('my component'), 'MyComponent');
    assert.strictEqual(toPascalCase('my_component'), 'MyComponent');
    assert.strictEqual(toPascalCase('my-component'), 'MyComponent');
  });

  it('should convert to kebab-case', () => {
    assert.strictEqual(toKebabCase('MyComponent'), 'my-component');
    assert.strictEqual(toKebabCase('my_component'), 'my-component');
    assert.strictEqual(toKebabCase('my component'), 'my-component');
  });

  it('should convert to snake_case', () => {
    assert.strictEqual(toSnakeCase('MyComponent'), 'my_component');
    assert.strictEqual(toSnakeCase('my-component'), 'my_component');
    assert.strictEqual(toSnakeCase('my component'), 'my_component');
  });
});
