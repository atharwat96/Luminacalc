/**
 * Pure calculator logic engine, decoupled from UI for testability.
 */

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  display: string;          // Current primary number or result displayed
  expression: string;       // Expression string built so far
  storedValue: number | null; // Previous accumulator value
  operator: string | null;  // Pending binary operator: '+', '-', '*', '/'
  waitingForOperand: boolean; // True after an operator is pressed, ready for next number
  memory: number;           // Value in memory (M)
  history: CalculationHistoryItem[];
  error: string | null;     // Error message if any (e.g. "Cannot divide by 0")
  lastAction: string | null;
}

export const INITIAL_STATE: CalculatorState = {
  display: '0',
  expression: '',
  storedValue: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  history: [],
  error: null,
  lastAction: null,
};

/**
 * Clean floating point arithmetic precision issues (e.g. 0.1 + 0.2 -> 0.3)
 */
export function formatNumber(num: number, maxDigits: number = 12): string {
  if (isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // If number fits well in standard representation
  const abs = Math.abs(num);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e12)) {
    return num.toExponential(6).replace(/\.0+e/, 'e');
  }

  // Round to avoid precision issues like 0.30000000000000004
  const rounded = parseFloat(num.toPrecision(maxDigits));
  const str = rounded.toString();

  // If the number is integer or within standard string length
  if (!str.includes('.')) {
    return str;
  }

  // Remove trailing unnecessary zeros after decimal point
  return str.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
}

/**
 * Evaluate basic binary operation
 */
export function executeOperation(prev: number, next: number, op: string): { result: number; error: string | null } {
  switch (op) {
    case '+':
      return { result: prev + next, error: null };
    case '-':
      return { result: prev - next, error: null };
    case '*':
    case '×':
      return { result: prev * next, error: null };
    case '/':
    case '÷':
      if (next === 0) {
        return { result: 0, error: 'Cannot divide by 0' };
      }
      return { result: prev / next, error: null };
    case '^':
      return { result: Math.pow(prev, next), error: null };
    default:
      return { result: next, error: null };
  }
}

/**
 * Handle digit input (0-9, 00)
 */
export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.error) {
    return {
      ...INITIAL_STATE,
      history: state.history,
      memory: state.memory,
      display: digit === '00' ? '0' : digit,
      lastAction: 'digit',
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: digit === '00' ? '0' : digit,
      waitingForOperand: false,
      lastAction: 'digit',
    };
  }

  // Current display is '0'
  if (state.display === '0') {
    if (digit === '00') return state;
    return {
      ...state,
      display: digit,
      lastAction: 'digit',
    };
  }

  // Prevent display overflowing reasonable character limits
  if (state.display.length >= 16) {
    return state;
  }

  return {
    ...state,
    display: state.display + digit,
    lastAction: 'digit',
  };
}

/**
 * Handle decimal point input
 */
export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.error) {
    return {
      ...INITIAL_STATE,
      history: state.history,
      memory: state.memory,
      display: '0.',
      lastAction: 'decimal',
    };
  }

  if (state.waitingForOperand) {
    return {
      ...state,
      display: '0.',
      waitingForOperand: false,
      lastAction: 'decimal',
    };
  }

  if (!state.display.includes('.')) {
    return {
      ...state,
      display: state.display + '.',
      lastAction: 'decimal',
    };
  }

  return state;
}

/**
 * Handle Backspace / Delete
 */
export function backspace(state: CalculatorState): CalculatorState {
  if (state.error || state.waitingForOperand) {
    return state;
  }

  if (state.display.length <= 1 || (state.display.length === 2 && state.display.startsWith('-'))) {
    return {
      ...state,
      display: '0',
      lastAction: 'backspace',
    };
  }

  return {
    ...state,
    display: state.display.slice(0, -1),
    lastAction: 'backspace',
  };
}

/**
 * Handle All Clear (AC)
 */
export function clearAll(state: CalculatorState): CalculatorState {
  return {
    ...INITIAL_STATE,
    history: state.history,
    memory: state.memory,
    lastAction: 'clearAll',
  };
}

/**
 * Handle Clear Entry (CE)
 */
export function clearEntry(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: '0',
    error: null,
    lastAction: 'clearEntry',
  };
}

/**
 * Handle binary operator (+, -, *, /)
 */
export function handleOperator(state: CalculatorState, nextOperator: string): CalculatorState {
  if (state.error) {
    return state;
  }

  const inputValue = parseFloat(state.display);

  if (state.storedValue === null) {
    return {
      ...state,
      storedValue: inputValue,
      operator: nextOperator,
      expression: `${formatNumber(inputValue)} ${nextOperator}`,
      waitingForOperand: true,
      lastAction: 'operator',
    };
  }

  if (state.waitingForOperand) {
    // Change operator
    return {
      ...state,
      operator: nextOperator,
      expression: `${formatNumber(state.storedValue)} ${nextOperator}`,
      lastAction: 'operator',
    };
  }

  if (state.operator) {
    const { result, error } = executeOperation(state.storedValue, inputValue, state.operator);

    if (error) {
      return {
        ...state,
        display: error,
        error: error,
        storedValue: null,
        operator: null,
        expression: '',
        waitingForOperand: true,
        lastAction: 'error',
      };
    }

    return {
      ...state,
      display: formatNumber(result),
      storedValue: result,
      operator: nextOperator,
      expression: `${formatNumber(result)} ${nextOperator}`,
      waitingForOperand: true,
      lastAction: 'operator',
    };
  }

  return state;
}

/**
 * Handle Equals (=)
 */
export function handleEquals(state: CalculatorState): CalculatorState {
  if (state.error) {
    return state;
  }

  if (state.operator === null || state.storedValue === null) {
    return state;
  }

  const currentValue = parseFloat(state.display);
  const { result, error } = executeOperation(state.storedValue, currentValue, state.operator);

  if (error) {
    return {
      ...state,
      display: error,
      error: error,
      storedValue: null,
      operator: null,
      expression: '',
      waitingForOperand: true,
      lastAction: 'error',
    };
  }

  const formattedResult = formatNumber(result);
  const fullExpr = `${formatNumber(state.storedValue)} ${state.operator} ${formatNumber(currentValue)} =`;

  const newHistoryItem: CalculationHistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    expression: fullExpr,
    result: formattedResult,
    timestamp: Date.now(),
  };

  return {
    ...state,
    display: formattedResult,
    expression: fullExpr,
    storedValue: null,
    operator: null,
    waitingForOperand: true,
    history: [newHistoryItem, ...state.history].slice(0, 50),
    lastAction: 'equals',
  };
}

/**
 * Handle Percentage (%)
 * In typical ordinary calculator:
 * If there is an active operation e.g. "100 + 10%", 10% is 10 (100 * 0.1)
 * If standalone "50%", 50% = 0.5
 */
export function handlePercentage(state: CalculatorState): CalculatorState {
  if (state.error) return state;

  const current = parseFloat(state.display);
  if (isNaN(current)) return state;

  let percentVal: number;
  if (state.storedValue !== null && (state.operator === '+' || state.operator === '-')) {
    percentVal = (state.storedValue * current) / 100;
  } else if (state.storedValue !== null && (state.operator === '*' || state.operator === '×' || state.operator === '/' || state.operator === '÷')) {
    percentVal = current / 100;
  } else {
    percentVal = current / 100;
  }

  return {
    ...state,
    display: formatNumber(percentVal),
    lastAction: 'percent',
  };
}

/**
 * Handle Sign Toggle (+/-)
 */
export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.error) return state;

  const current = parseFloat(state.display);
  if (current === 0) return state;

  const toggled = -current;
  return {
    ...state,
    display: formatNumber(toggled),
    lastAction: 'negate',
  };
}

/**
 * Handle Immediate Scientific / Unary Math Operations
 */
export function handleUnaryMath(state: CalculatorState, operation: string): CalculatorState {
  if (state.error) return state;

  const current = parseFloat(state.display);
  if (isNaN(current)) return state;

  let result: number;
  let label: string;

  switch (operation) {
    case 'sqrt':
    case '√':
      if (current < 0) {
        return {
          ...state,
          display: 'Invalid Input',
          error: 'Invalid Input',
          waitingForOperand: true,
          lastAction: 'error',
        };
      }
      result = Math.sqrt(current);
      label = `√(${formatNumber(current)})`;
      break;

    case 'sqr':
    case 'x²':
      result = current * current;
      label = `sqr(${formatNumber(current)})`;
      break;

    case 'recip':
    case '1/x':
      if (current === 0) {
        return {
          ...state,
          display: 'Cannot divide by 0',
          error: 'Cannot divide by 0',
          waitingForOperand: true,
          lastAction: 'error',
        };
      }
      result = 1 / current;
      label = `1/(${formatNumber(current)})`;
      break;

    case 'sin':
      // Degrees or radians? Standard calculator radians with degree conversion support
      result = Math.sin((current * Math.PI) / 180);
      label = `sin(${formatNumber(current)}°)`;
      break;

    case 'cos':
      result = Math.cos((current * Math.PI) / 180);
      // Clean small precision round for 90 deg cos -> 0
      if (Math.abs(result) < 1e-15) result = 0;
      label = `cos(${formatNumber(current)}°)`;
      break;

    case 'tan':
      if (Math.abs((current % 180) - 90) < 1e-6) {
        return {
          ...state,
          display: 'Invalid Input',
          error: 'Invalid Input',
          waitingForOperand: true,
          lastAction: 'error',
        };
      }
      result = Math.tan((current * Math.PI) / 180);
      label = `tan(${formatNumber(current)}°)`;
      break;

    case 'log':
      if (current <= 0) {
        return {
          ...state,
          display: 'Invalid Input',
          error: 'Invalid Input',
          waitingForOperand: true,
          lastAction: 'error',
        };
      }
      result = Math.log10(current);
      label = `log(${formatNumber(current)})`;
      break;

    case 'ln':
      if (current <= 0) {
        return {
          ...state,
          display: 'Invalid Input',
          error: 'Invalid Input',
          waitingForOperand: true,
          lastAction: 'error',
        };
      }
      result = Math.log(current);
      label = `ln(${formatNumber(current)})`;
      break;

    case 'pi':
    case 'π':
      return {
        ...state,
        display: formatNumber(Math.PI),
        waitingForOperand: false,
        lastAction: 'constant',
      };

    case 'e':
      return {
        ...state,
        display: formatNumber(Math.E),
        waitingForOperand: false,
        lastAction: 'constant',
      };

    default:
      return state;
  }

  const formatted = formatNumber(result);
  return {
    ...state,
    display: formatted,
    expression: label,
    waitingForOperand: true,
    lastAction: 'unary',
  };
}

/**
 * Memory Functions
 */
export function memoryAdd(state: CalculatorState): CalculatorState {
  if (state.error) return state;
  const current = parseFloat(state.display);
  return {
    ...state,
    memory: state.memory + (isNaN(current) ? 0 : current),
    waitingForOperand: true,
    lastAction: 'memory',
  };
}

export function memorySubtract(state: CalculatorState): CalculatorState {
  if (state.error) return state;
  const current = parseFloat(state.display);
  return {
    ...state,
    memory: state.memory - (isNaN(current) ? 0 : current),
    waitingForOperand: true,
    lastAction: 'memory',
  };
}

export function memoryRecall(state: CalculatorState): CalculatorState {
  return {
    ...state,
    display: formatNumber(state.memory),
    waitingForOperand: false,
    lastAction: 'memory',
  };
}

export function memoryClear(state: CalculatorState): CalculatorState {
  return {
    ...state,
    memory: 0,
    lastAction: 'memory',
  };
}
