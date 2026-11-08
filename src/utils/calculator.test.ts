import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_STATE,
  inputDigit,
  inputDecimal,
  backspace,
  clearAll,
  handleOperator,
  handleEquals,
  handlePercentage,
  toggleSign,
  handleUnaryMath,
  memoryAdd,
  memoryRecall,
  memoryClear,
  formatNumber,
} from './calculator';

test('formatNumber handles precision and edge cases', () => {
  assert.equal(formatNumber(0.1 + 0.2), '0.3');
  assert.equal(formatNumber(100), '100');
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(1 / 3), '0.333333333333');
});

test('basic addition: 7 + 8 = 15', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '7');
  assert.equal(s.display, '7');
  s = handleOperator(s, '+');
  assert.equal(s.storedValue, 7);
  assert.equal(s.operator, '+');
  s = inputDigit(s, '8');
  assert.equal(s.display, '8');
  s = handleEquals(s);
  assert.equal(s.display, '15');
  assert.equal(s.history.length, 1);
  assert.equal(s.history[0].result, '15');
});

test('floating point precision: 0.1 + 0.2 = 0.3', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '0');
  s = inputDecimal(s);
  s = inputDigit(s, '1');
  assert.equal(s.display, '0.1');
  s = handleOperator(s, '+');
  s = inputDigit(s, '0');
  s = inputDecimal(s);
  s = inputDigit(s, '2');
  assert.equal(s.display, '0.2');
  s = handleEquals(s);
  assert.equal(s.display, '0.3');
});

test('chained operations: 5 + 3 * 2 = 16 (immediate execution mode)', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '5');
  s = handleOperator(s, '+');
  s = inputDigit(s, '3');
  s = handleOperator(s, '*');
  assert.equal(s.display, '8');
  s = inputDigit(s, '2');
  s = handleEquals(s);
  assert.equal(s.display, '16');
});

test('division by zero produces clear error', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '9');
  s = handleOperator(s, '/');
  s = inputDigit(s, '0');
  s = handleEquals(s);
  assert.equal(s.display, 'Cannot divide by 0');
  assert.ok(s.error);
});

test('percentage calculation', () => {
  // 200 + 10% = 200 + 20 = 220
  let s = INITIAL_STATE;
  s = inputDigit(s, '2');
  s = inputDigit(s, '0');
  s = inputDigit(s, '0');
  s = handleOperator(s, '+');
  s = inputDigit(s, '1');
  s = inputDigit(s, '0');
  s = handlePercentage(s);
  assert.equal(s.display, '20');
  s = handleEquals(s);
  assert.equal(s.display, '220');
});

test('unary operations: square root and square', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '9');
  s = handleUnaryMath(s, '√');
  assert.equal(s.display, '3');

  s = handleUnaryMath(s, 'x²');
  assert.equal(s.display, '9');
});

test('sign toggle and backspace', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '5');
  s = toggleSign(s);
  assert.equal(s.display, '-5');
  s = toggleSign(s);
  assert.equal(s.display, '5');

  s = inputDigit(s, '8');
  assert.equal(s.display, '58');
  s = backspace(s);
  assert.equal(s.display, '5');
  s = backspace(s);
  assert.equal(s.display, '0');
});

test('memory operations M+, MR, MC', () => {
  let s = INITIAL_STATE;
  s = inputDigit(s, '4');
  s = inputDigit(s, '2');
  s = memoryAdd(s);
  assert.equal(s.memory, 42);

  s = clearAll(s);
  assert.equal(s.display, '0');
  assert.equal(s.memory, 42);

  s = memoryRecall(s);
  assert.equal(s.display, '42');

  s = memoryClear(s);
  assert.equal(s.memory, 0);
});
