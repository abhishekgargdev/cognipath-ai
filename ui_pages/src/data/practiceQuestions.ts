import { PracticeQuestion, EvaluationResult } from '../types';

export const dailyPracticeQuestions: PracticeQuestion[] = [
  {
    id: 'q-1',
    index: 1,
    type: 'concept',
    typeLabel: 'CONCEPT CHECK',
    topicTitle: 'JavaScript Closures',
    title: 'Lexical Environment & Variable Lifetime',
    difficulty: 'Beginner',
    estMinutes: 3,
    whyThisMatters: 'Understanding when variables are allocated to the heap vs stack is essential for avoiding accidental memory retention in long-lived applications.',
    prompt: 'In JavaScript, why does an inner function still have access to variables declared in an outer function, even after the outer function has returned and exited the Call Stack?',
    options: [
      {
        id: 'opt-a',
        label: 'The variables are copied as global properties on the window/globalThis object.'
      },
      {
        id: 'opt-b',
        label: 'The inner function retains an internal [[Environment]] reference to the outer Lexical Environment, which the Garbage Collector keeps alive on the heap.'
      },
      {
        id: 'opt-c',
        label: 'The JavaScript compiler freezes the outer function on the stack until all timers complete.'
      },
      {
        id: 'opt-d',
        label: 'Closures clone all primitive values into the browser’s local storage cache.'
      }
    ],
    correctAnswer: 'opt-b',
    explanation: 'Correct! Every function object retains a hidden reference to its parent Lexical Environment. Because a live reference remains reachable from the inner function, JavaScript’s Mark-and-Sweep garbage collector preserves the environment record on the heap instead of destroying it.',
    conceptExplanation: {
      topic: 'Lexical Environment Records & Heap Allocation Mechanics',
      theoreticalFoundation: 'Under ECMAScript Section 9.1, each function execution context instantiates an Environment Record and an outer reference [[OuterEnv]]. When functions return, stack frames unwind, but objects that remain reachable through active reference graphs are not reclaimed by the Mark-and-Sweep Garbage Collector.',
      underlyingMechanics: 'When an inner function is declared, the V8 / JavaScriptCore engine captures all referenced variables into a heap-allocated Context object rather than the volatile execution stack. As long as any downstream consumer retains a pointer to the inner function, that Context object remains pinned in memory.',
      stepByStepTrace: [
        '1. Outer function execution context pushed to Call Stack.',
        '2. Local variables initialized in volatile stack frame.',
        '3. Inner function declared: engine allocates a Context object on the heap containing closed-over identifiers.',
        '4. Outer function returns and its stack frame is popped.',
        '5. Inner function is returned or stored: its [[Environment]] slot keeps the heap Context object reachable.',
        '6. Subsequent invocations resolve identifiers by ascending the [[OuterEnv]] linked chain.'
      ],
      architecturalTakeaways: 'Unintentional retention of parent contexts (such as large buffers, DOM nodes, or WebSocket subscriptions) causes stealth memory leaks. Senior architects decouple heavy payloads or explicitly nullify references when closures outlive their immediate lifecycle.',
      commonPitfalls: [
        'Assuming primitive values like numbers or booleans are copied by value into the closure rather than referenced.',
        'Retaining megabyte-sized JSON payloads in outer scopes that cannot be reclaimed until the closure terminates.',
        'Confusing closure scope with runtime "this" context binding.'
      ]
    },
    topSolutions: [
      {
        id: 'sol-1-1',
        rank: 1,
        title: 'Approach 1: Canonical Lexical Scope Encapsulation',
        subtitle: 'The Standard Idiomatic Closure Pattern',
        paradigm: 'Functional Closure & Lexical Scope',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `function createCounter(initialValue = 0) {
  // Heap-allocated private state
  let count = initialValue;

  return {
    increment() { return ++count; },
    decrement() { return --count; },
    get value() { return count; }
  };
}`,
        explanation: 'Encloses mutable state inside a factory function. Consumer functions read and mutate the counter through controlled accessor methods without exposing the raw identifier to global scope.',
        pros: ['True data privacy without classes', 'Zero external dependencies', 'Clean mental model'],
        cons: ['Each instance creates separate method references in memory'],
        whenToUse: 'Ideal for lightweight factory utilities, counters, and private token storage.'
      },
      {
        id: 'sol-1-2',
        rank: 2,
        title: 'Approach 2: WeakMap-Based Private Storage',
        subtitle: 'Automatic Memory Reclaim on Object Disposal',
        paradigm: 'Weak-Referenced Metadata Store',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `const privateStore = new WeakMap();

class SecureCounter {
  constructor(initial = 0) {
    privateStore.set(this, { count: initial });
  }

  increment() {
    const data = privateStore.get(this);
    return ++data.count;
  }
}`,
        explanation: 'Stores instance state keyed by the object itself in a WeakMap. When the instance is dereferenced by the consumer, the garbage collector automatically reclaims the private metadata.',
        pros: ['Guaranteed zero memory leak on instance garbage collection', 'Shared prototype methods save RAM'],
        cons: ['Slightly more boilerplate than vanilla closure'],
        whenToUse: 'Essential for high-scale enterprise applications instantiating thousands of stateful objects.'
      },
      {
        id: 'sol-1-3',
        rank: 3,
        title: 'Approach 3: Modern Private Class Fields (#field)',
        subtitle: 'ECMAScript 2022 Hard Private State',
        paradigm: 'Language-Enforced Encapsulation',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `class ModernCounter {
  #count;

  constructor(initial = 0) {
    this.#count = initial;
  }

  increment() {
    return ++this.#count;
  }

  get value() {
    return this.#count;
  }
}`,
        explanation: 'Leverages modern JavaScript private brand checks. Variables prefixed with # cannot be inspected or accessed from outside the class lexical boundary, even via Object.keys or getOwnPropertySymbols.',
        pros: ['Direct engine bytecode optimization', 'Syntax-level access control', 'No closure overhead'],
        cons: ['Requires modern runtime (ES2022+ / Node 16+)'],
        whenToUse: 'The recommended modern pattern when building class-based domain models.'
      },
      {
        id: 'sol-1-4',
        rank: 4,
        title: 'Approach 4: Pure Reducer with State Immobility',
        subtitle: 'Eliminating Closure Mutation via State Monad',
        paradigm: 'Pure Functional Programming',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT': return state + 1;
    case 'DECREMENT': return state - 1;
    default: return state;
  }
};`,
        explanation: 'Bypasses closure state entirely by treating state transitions as pure mathematical transformations (State, Action) -> NewState.',
        pros: ['100% deterministic and testable', 'Time-travel debugging', 'Zero race conditions'],
        cons: ['Requires external dispatcher or store to hold the resulting state'],
        whenToUse: 'Standard for Redux, Zustand, React useReducer, and distributed state machines.'
      },
      {
        id: 'sol-1-5',
        rank: 5,
        title: 'Approach 5: Symbol-Keyed Hidden Property Descriptor',
        subtitle: 'Semi-Private Metaprogramming Attribute',
        paradigm: 'Object Metaprogramming',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `const _count = Symbol('internalCount');

function createSymbolCounter(initial = 0) {
  return {
    [_count]: initial,
    increment() {
      return ++this[_count];
    }
  };
}`,
        explanation: 'Uses an unexported Symbol as the object key. Property will not clash with regular string keys or show up in for...in loops.',
        pros: ['Fast property lookup', 'No closure heap retention of outer scope'],
        cons: ['Can still be accessed via Object.getOwnPropertySymbols if symbol is leaked'],
        whenToUse: 'Ideal for internal framework hooks, plugins, and decorator flags.'
      }
    ]
  },
  {
    id: 'q-2',
    index: 2,
    type: 'output_prediction',
    typeLabel: 'OUTPUT PREDICTION',
    topicTitle: 'Async & Microtasks',
    title: 'Event Loop Execution Priority',
    difficulty: 'Medium',
    estMinutes: 4,
    whyThisMatters: 'Your learning profile identified Microtasks vs Macrotasks as an area needing reinforcement. Predicting console order tests your mental model of the event loop.',
    prompt: 'What will be printed to the console when the following code snippet is executed?',
    codeSnippet: `console.log('A');

setTimeout(() => {
  console.log('B');
}, 0);

Promise.resolve().then(() => {
  console.log('C');
}).then(() => {
  console.log('D');
});

console.log('E');`,
    options: [
      { id: 'opt-a', label: 'A, B, C, D, E' },
      { id: 'opt-b', label: 'A, E, B, C, D' },
      { id: 'opt-c', label: 'A, E, C, D, B' },
      { id: 'opt-d', label: 'A, C, E, B, D' }
    ],
    correctAnswer: 'opt-c',
    explanation: `Step-by-step resolution:
1. 'A' is logged synchronously.
2. setTimeout schedules 'B' to the Macrotask queue.
3. Promise.resolve schedules 'C' to the Microtask queue.
4. 'E' is logged synchronously.
5. The Call Stack is now empty. The Event Loop prioritizes the Microtask queue first: logs 'C'.
6. Logging 'C' chains the next microtask 'D', which logs immediately because microtasks run until the queue is empty.
7. Finally, the event loop picks from the Macrotask queue: logs 'B'.
Final Output: A, E, C, D, B.`
  },
  {
    id: 'q-3',
    index: 3,
    type: 'debugging',
    typeLabel: 'DEBUGGING',
    topicTitle: 'Closures & Scoping',
    title: 'Fix Stale Closure Loop in Event Dispatcher',
    difficulty: 'Medium',
    estMinutes: 5,
    whyThisMatters: 'Variable hoisting and loop closures are frequent sources of production bugs when registering listeners or async batches.',
    prompt: 'A developer wrote this function to create an array of loggers, but calling loggers[0]() logs 5 instead of 0. Identify the bug and select the best fix.',
    codeSnippet: `function createLoggers() {
  var loggers = [];
  
  for (var i = 0; i < 5; i++) {
    loggers.push(function() {
      return i;
    });
  }
  
  return loggers;
}`,
    options: [
      {
        id: 'opt-a',
        label: 'Replace var i = 0 with let i = 0 in the for loop head to give each iteration its own lexical binding.'
      },
      {
        id: 'opt-b',
        label: 'Change loggers.push to loggers.unshift so that the array elements are reversed.'
      },
      {
        id: 'opt-c',
        label: 'Convert the function into an async generator function.'
      },
      {
        id: 'opt-d',
        label: 'Add return i++ inside the inner function.'
      }
    ],
    correctAnswer: 'opt-a',
    explanation: 'Using `var i` creates a single variable scoped to `createLoggers`. All 5 closures refer to the exact same memory address. By loop end, `i` is 5. Replacing with `let i` gives each iteration its own block scope and unique closure binding.'
  },
  {
    id: 'q-4',
    index: 4,
    type: 'coding',
    typeLabel: 'CODING CHALLENGE',
    topicTitle: 'Functional Closures & Caching',
    title: 'Implement createOnce(fn) with Memory Guard',
    difficulty: 'Medium',
    estMinutes: 8,
    whyThisMatters: 'One-time execution guards are standard patterns in payment submissions, analytics tracking, and initialization hooks.',
    prompt: `Write a higher-order function \`createOnce(fn)\` that accepts a function \`fn\` and returns a new function.
The returned function should execute \`fn\` ONLY the first time it is invoked with any arguments, and return its result.
Subsequent calls must NOT invoke \`fn\` again, but should return the cached result of the initial call.

Requirements:
1. Retain execution result using a private closure variable.
2. Ensure \`fn\` is called with original arguments and \`this\` context.
3. If \`fn\` throws, subsequent calls should not retry.`,
    language: 'javascript',
    starterCode: `/**
 * Creates a function that is restricted to invoking fn once.
 * Repeat calls to the function return the value of the first invocation.
 *
 * @param {Function} fn - The function to restrict.
 * @returns {Function} Returns the new restricted function.
 */
function createOnce(fn) {
  let hasRun = false;
  let cachedResult;

  return function(...args) {
    // Your implementation here using closures:
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };
}
`,
    testCases: [
      {
        id: 'tc-1',
        input: 'createOnce((x) => x * 2)(5)',
        expectedOutput: '10',
        passed: true
      },
      {
        id: 'tc-2',
        input: 'const f = createOnce((x) => x + 10); f(5); f(100);',
        expectedOutput: '15 (returns cached 15, ignores second call)',
        passed: true
      },
      {
        id: 'tc-3',
        input: 'const spy = createOnce(() => Math.random()); spy() === spy()',
        expectedOutput: 'true',
        passed: true
      }
    ],
    hints: [
      'Think about private variables that survive inside the closure: a boolean flag hasRun and a variable cachedResult.',
      'Use fn.apply(this, args) to preserve arguments and invocation context.',
      'Once hasRun is true, simply return cachedResult directly without re-executing fn.'
    ],
    solution: `function createOnce(fn) {
  let hasBeenCalled = false;
  let memoizedValue;

  return function(...args) {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      memoizedValue = fn.apply(this, args);
    }
    return memoizedValue;
  };
}`,
    conceptExplanation: {
      topic: 'Higher-Order Function Caching, Lexical Closures & Memory Retention',
      theoreticalFoundation: 'A higher-order function is a mathematical functor mapping an input function ƒ to an augmented function ƒ′. In JavaScript, lexical closures retain bindings within a private Environment Record that persists on the heap across multiple invocation boundaries.',
      underlyingMechanics: 'The outer factory function creates a private closure scope holding `hasRun` and `cachedResult`. Every returned function call checks the boolean flag in O(1) time. If true, it returns `cachedResult` immediately, bypassing subsequent function body execution and downstream I/O operations.',
      stepByStepTrace: [
        '1. Outer createOnce(fn) allocates hasRun = false and cachedResult in a fresh Lexical Environment.',
        '2. The wrapper function is returned with a pointer to that Lexical Environment via [[Environment]].',
        '3. First invocation: hasRun is checked (false). It flips hasRun = true immediately (re-entrancy guard).',
        '4. fn.apply(this, args) is executed, preserving caller "this" binding and forwarding dynamic arguments.',
        '5. Return value is saved to cachedResult and returned to the caller.',
        '6. Second & subsequent invocations: hasRun is true, so fn is NEVER invoked again; cachedResult is returned in O(1).'
      ],
      architecturalTakeaways: 'In enterprise systems, one-time execution gates protect critical transactional boundaries: idempotent payment charges, singleton WebAssembly module compilations, analytics telemetry handshakes, and database connection pooling.',
      commonPitfalls: [
        'Losing "this" binding by calling fn(...args) instead of fn.apply(this, args) when methods belong to a class or object.',
        'Ignoring errors: if fn throws an unhandled exception on first run, forgetting whether it should retry or permanently stay locked.',
        'Retaining references to large closures in fn when they are no longer required after initial execution.'
      ]
    },
    topSolutions: [
      {
        id: 'sol-4-1',
        rank: 1,
        title: 'Approach 1: Canonical Closure Flag (Idiomatic)',
        subtitle: 'Production Standard Used by Lodash & Ramda',
        paradigm: 'Higher-Order Lexical Closure',
        timeComplexity: 'O(1) amortized',
        spaceComplexity: 'O(1) auxiliary',
        code: `function createOnce(fn) {
  let hasRun = false;
  let cachedResult;

  return function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };
}`,
        explanation: 'Stores execution status in a private closure boolean variable and guards invocation. Forwards this context and arguments via .apply().',
        pros: ['Simplest cognitive overhead', 'Standard cross-engine optimization', 'Guaranteed O(1) performance'],
        cons: ['Retains original fn reference in closure memory even after execution'],
        whenToUse: 'The recommended default for 95% of utility libraries, event listeners, and UI click debouncers.'
      },
      {
        id: 'sol-4-2',
        rank: 2,
        title: 'Approach 2: Garbage-Collector Memory-Safe Nullification',
        subtitle: 'Immediate Scope Release for Heavy Payloads',
        paradigm: 'Garbage Collector Optimization',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1) [Zero Long-Term Retained Memory]',
        code: `function createOnceMemorySafe(fn) {
  let cachedResult;

  return function(...args) {
    if (fn) {
      cachedResult = fn.apply(this, args);
      // Sever the pointer so V8 can GC heavy outer scopes immediately:
      fn = null;
    }
    return cachedResult;
  };
}`,
        explanation: 'Instead of keeping a boolean flag and an active reference to fn, it nullifies fn after execution. If fn captured a 50MB ArrayBuffer or heavy DOM trees, those are immediately freed.',
        pros: ['Prevents stealth memory leaks in long-lived single page apps', 'Eliminates redundant boolean variable'],
        cons: ['Mutates closure variable fn'],
        whenToUse: 'Critical for long-lived application lifecycles, heavy report generators, and WebGL context initializers.'
      },
      {
        id: 'sol-4-3',
        rank: 3,
        title: 'Approach 3: Transparent ES6 Proxy Trap Interceptor',
        subtitle: 'Metaprogramming with Arity & Name Preservation',
        paradigm: 'Proxy Virtualization',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `function createOnceProxy(fn) {
  let hasRun = false;
  let cachedResult;

  return new Proxy(fn, {
    apply(target, thisArg, argumentsList) {
      if (!hasRun) {
        hasRun = true;
        cachedResult = Reflect.apply(target, thisArg, argumentsList);
      }
      return cachedResult;
    }
  });
}`,
        explanation: 'Wraps the target function with an ES6 Proxy. Preserves the original function’s length (arity), name, prototype chain, and custom properties automatically.',
        pros: ['Preserves fn.length, fn.name, and instance properties', 'Fully transparent to reflection tools'],
        cons: ['Slight micro-overhead on Proxy trap invocation (~5-10% slower in micro-benchmarks)'],
        whenToUse: 'Best for TypeScript decorators, ORM method interceptors, and framework plugins.'
      },
      {
        id: 'sol-4-4',
        rank: 4,
        title: 'Approach 4: Stateful Functor with State Inspection & Reset',
        subtitle: 'Testable & Introspectable Command Functor',
        paradigm: 'Object-Oriented Command Pattern',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        code: `function createOnceInspectable(fn) {
  let hasRun = false;
  let cachedResult;

  const onceFn = function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };

  // Diagnostic & testing hooks:
  onceFn.hasExecuted = () => hasRun;
  onceFn.reset = () => {
    hasRun = false;
    cachedResult = undefined;
  };

  return onceFn;
}`,
        explanation: 'Enriches the wrapper function with inspectable accessor methods: .hasExecuted() for unit test assertion and .reset() for test fixture teardown.',
        pros: ['Enables easy unit testing and mock resets', 'Observable state without breaking callable interface'],
        cons: ['Exposes mutable reset method that could be abused in application code'],
        whenToUse: 'Ideal in test-driven development (TDD), mocking frameworks, and stateful lifecycle hooks.'
      },
      {
        id: 'sol-4-5',
        rank: 5,
        title: 'Approach 5: WeakMap-Keyed Universal Registry',
        subtitle: 'Non-Invasive Singleton Invocation Engine',
        paradigm: 'Weak-Referenced Global Registry',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(N) across multiple unique functions',
        code: `const onceRegistry = new WeakMap();

function runOnce(fn, context, ...args) {
  if (!onceRegistry.has(fn)) {
    const result = fn.apply(context, args);
    onceRegistry.set(fn, { result });
  }
  return onceRegistry.get(fn).result;
}`,
        explanation: 'Stores execution results in an external WeakMap keyed by the function object itself. Does not wrap or mutate the target function.',
        pros: ['Completely non-invasive—leaves function identity intact', 'Automatic garbage collection when function is discarded'],
        cons: ['Must pass the original function reference on each call site'],
        whenToUse: 'Great for distributed middleware pipelines and runtime patchers where wrapping functions is disallowed.'
      }
    ]
  },
  {
    id: 'q-5',
    index: 5,
    type: 'scenario',
    typeLabel: 'REAL-WORLD ARCHITECTURE',
    topicTitle: 'React Custom Hooks & Closures',
    title: 'Stale State Bug in Custom setInterval Hook',
    difficulty: 'Advanced',
    estMinutes: 6,
    whyThisMatters: 'Stale closures in React useEffect or setInterval hooks account for 40%+ of complex UI state sync bugs in enterprise React codebases.',
    prompt: `Review the following custom React hook designed to trigger a callback every interval.
A user reports that inside their callback, \`count\` is always stuck at 0.
Which explanation accurately diagnoses why this occurs and how to fix it?`,
    codeSnippet: `function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(() => {
      callback();
    }, delay);
    return () => clearInterval(id);
  }, [delay]); // Notice the dependency array
}`,
    options: [
      {
        id: 'opt-a',
        label: 'setInterval cannot run in a browser; requestAnimationFrame must be used instead.'
      },
      {
        id: 'opt-b',
        label: 'Stale Closure: The useEffect only re-runs when `delay` changes. The timer closes over the initial callback instance. To fix it, store the callback in a mutable useRef that updates on every render.'
      },
      {
        id: 'opt-c',
        label: 'React automatically cancels all setInterval timers after 1000ms for memory protection.'
      },
      {
        id: 'opt-d',
        label: 'The return () => clearInterval(id) cleanup function is invalid syntax in React 19.'
      }
    ],
    correctAnswer: 'opt-b',
    explanation: 'Precisely right. This is Dan Abramov’s canonical "Making setInterval Declarative with React Hooks" problem. Because `callback` is omitted from dependencies, the interval closure captures the callback created during mount with stale state (count = 0). By storing `const savedCallback = useRef(callback)` and updating `savedCallback.current = callback` each render, the interval can invoke `savedCallback.current()` and always read fresh state.'
  }
];

export const sampleSuccessfulEvaluation: EvaluationResult = {
  score: 92,
  passed: true,
  passedTests: 3,
  totalTests: 3,
  runtimeMs: 38,
  memoryMb: 11.4,
  timeComplexity: 'O(1) amortized',
  spaceComplexity: 'O(1) auxiliary',
  summary: 'Excellent solution. You demonstrated idiomatic closure state management and proper invocation context preservation.',
  whatYouDidWell: [
    'Enclosed the execution flag and cached result in a private lexical environment.',
    'Preserved the execution context using .apply(this, args) without leaking global scope.',
    'Handled multiple argument signatures seamlessly via rest parameters (...args).'
  ],
  conceptsDemonstrated: [
    { name: 'Lexical Scoping & Heap Retention', status: 'Strong' },
    { name: 'Function Context & Apply/Call', status: 'Strong' },
    { name: 'Edge Cases (Subsequent invocations)', status: 'Good' },
    { name: 'Memory Footprint', status: 'Strong' }
  ],
  whatCouldBeImproved: [
    'You could optionally nullify the original function reference `fn = null` after the first run to allow the garbage collector to immediately release heavy function closures.'
  ],
  alternativeApproach: `// Memory-Optimized Alternative: Nullifying the inner function
function createOnce(fn) {
  let cachedResult;
  return function(...args) {
    if (fn) {
      cachedResult = fn.apply(this, args);
      fn = null; // Unbinds reference to avoid retaining heavy outer scope
    }
    return cachedResult;
  };
}`,
  conceptExplanation: {
    topic: 'Higher-Order Function Caching, Lexical Closures & Memory Retention',
    theoreticalFoundation: 'A higher-order function is a mathematical functor mapping an input function ƒ to an augmented function ƒ′. In JavaScript, lexical closures retain bindings within a private Environment Record that persists on the heap across multiple invocation boundaries.',
    underlyingMechanics: 'The outer factory function creates a private closure scope holding `hasRun` and `cachedResult`. Every returned function call checks the boolean flag in O(1) time. If true, it returns `cachedResult` immediately, bypassing subsequent function body execution and downstream I/O operations.',
    stepByStepTrace: [
      '1. Outer createOnce(fn) allocates hasRun = false and cachedResult in a fresh Lexical Environment.',
      '2. The wrapper function is returned with a pointer to that Lexical Environment via [[Environment]].',
      '3. First invocation: hasRun is checked (false). It flips hasRun = true immediately (re-entrancy guard).',
      '4. fn.apply(this, args) is executed, preserving caller "this" binding and forwarding dynamic arguments.',
      '5. Return value is saved to cachedResult and returned to the caller.',
      '6. Second & subsequent invocations: hasRun is true, so fn is NEVER invoked again; cachedResult is returned in O(1).'
    ],
    architecturalTakeaways: 'In enterprise systems, one-time execution gates protect critical transactional boundaries: idempotent payment charges, singleton WebAssembly module compilations, analytics telemetry handshakes, and database connection pooling.',
    commonPitfalls: [
      'Losing "this" binding by calling fn(...args) instead of fn.apply(this, args) when methods belong to a class or object.',
      'Ignoring errors: if fn throws an unhandled exception on first run, forgetting whether it should retry or permanently stay locked.',
      'Retaining references to large closures in fn when they are no longer required after initial execution.'
    ]
  },
  topSolutions: [
    {
      id: 'eval-sol-1',
      rank: 1,
      title: 'Approach 1: Canonical Closure Flag (Idiomatic)',
      subtitle: 'Production Standard Used by Lodash & Ramda',
      paradigm: 'Higher-Order Lexical Closure',
      timeComplexity: 'O(1) amortized',
      spaceComplexity: 'O(1) auxiliary',
      code: `function createOnce(fn) {
  let hasRun = false;
  let cachedResult;

  return function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };
}`,
      explanation: 'Stores execution status in a private closure boolean variable and guards invocation. Forwards this context and arguments via .apply().',
      pros: ['Simplest cognitive overhead', 'Standard cross-engine optimization', 'Guaranteed O(1) performance'],
      cons: ['Retains original fn reference in closure memory even after execution'],
      whenToUse: 'The recommended default for 95% of utility libraries, event listeners, and UI click debouncers.'
    },
    {
      id: 'eval-sol-2',
      rank: 2,
      title: 'Approach 2: Garbage-Collector Memory-Safe Nullification',
      subtitle: 'Immediate Scope Release for Heavy Payloads',
      paradigm: 'Garbage Collector Optimization',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1) [Zero Long-Term Retained Memory]',
      code: `function createOnceMemorySafe(fn) {
  let cachedResult;

  return function(...args) {
    if (fn) {
      cachedResult = fn.apply(this, args);
      // Sever the pointer so V8 can GC heavy outer scopes immediately:
      fn = null;
    }
    return cachedResult;
  };
}`,
      explanation: 'Instead of keeping a boolean flag and an active reference to fn, it nullifies fn after execution. If fn captured a 50MB ArrayBuffer or heavy DOM trees, those are immediately freed.',
      pros: ['Prevents stealth memory leaks in long-lived single page apps', 'Eliminates redundant boolean variable'],
      cons: ['Mutates closure variable fn'],
      whenToUse: 'Critical for long-lived application lifecycles, heavy report generators, and WebGL context initializers.'
    },
    {
      id: 'eval-sol-3',
      rank: 3,
      title: 'Approach 3: Transparent ES6 Proxy Trap Interceptor',
      subtitle: 'Metaprogramming with Arity & Name Preservation',
      paradigm: 'Proxy Virtualization',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      code: `function createOnceProxy(fn) {
  let hasRun = false;
  let cachedResult;

  return new Proxy(fn, {
    apply(target, thisArg, argumentsList) {
      if (!hasRun) {
        hasRun = true;
        cachedResult = Reflect.apply(target, thisArg, argumentsList);
      }
      return cachedResult;
    }
  });
}`,
      explanation: 'Wraps the target function with an ES6 Proxy. Preserves the original function’s length (arity), name, prototype chain, and custom properties automatically.',
      pros: ['Preserves fn.length, fn.name, and instance properties', 'Fully transparent to reflection tools'],
      cons: ['Slight micro-overhead on Proxy trap invocation (~5-10% slower in micro-benchmarks)'],
      whenToUse: 'Best for TypeScript decorators, ORM method interceptors, and framework plugins.'
    },
    {
      id: 'eval-sol-4',
      rank: 4,
      title: 'Approach 4: Stateful Functor with State Inspection & Reset',
      subtitle: 'Testable & Introspectable Command Functor',
      paradigm: 'Object-Oriented Command Pattern',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      code: `function createOnceInspectable(fn) {
  let hasRun = false;
  let cachedResult;

  const onceFn = function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };

  // Diagnostic & testing hooks:
  onceFn.hasExecuted = () => hasRun;
  onceFn.reset = () => {
    hasRun = false;
    cachedResult = undefined;
  };

  return onceFn;
}`,
      explanation: 'Enriches the wrapper function with inspectable accessor methods: .hasExecuted() for unit test assertion and .reset() for test fixture teardown.',
      pros: ['Enables easy unit testing and mock resets', 'Observable state without breaking callable interface'],
      cons: ['Exposes mutable reset method that could be abused in application code'],
      whenToUse: 'Ideal in test-driven development (TDD), mocking frameworks, and stateful lifecycle hooks.'
    },
    {
      id: 'eval-sol-5',
      rank: 5,
      title: 'Approach 5: WeakMap-Keyed Universal Registry',
      subtitle: 'Non-Invasive Singleton Invocation Engine',
      paradigm: 'Weak-Referenced Global Registry',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(N) across multiple unique functions',
      code: `const onceRegistry = new WeakMap();

function runOnce(fn, context, ...args) {
  if (!onceRegistry.has(fn)) {
    const result = fn.apply(context, args);
    onceRegistry.set(fn, { result });
  }
  return onceRegistry.get(fn).result;
}`,
      explanation: 'Stores execution results in an external WeakMap keyed by the function object itself. Does not wrap or mutate the target function.',
      pros: ['Completely non-invasive—leaves function identity intact', 'Automatic garbage collection when function is discarded'],
      cons: ['Must pass the original function reference on each call site'],
      whenToUse: 'Great for distributed middleware pipelines and runtime patchers where wrapping functions is disallowed.'
    }
  ],
  aiRecommendation: 'Your understanding of function closures and memoization is verified. Next, let’s tackle asynchronous Promise scheduling.'
};

export const sampleFailedEvaluation: EvaluationResult = {
  score: 68,
  passed: false,
  passedTests: 2,
  totalTests: 3,
  runtimeMs: 54,
  memoryMb: 14.8,
  timeComplexity: 'O(1)',
  spaceComplexity: 'O(1)',
  summary: 'Not quite — but this is a high-value learning moment. Your solution passed 2 out of 3 tests.',
  whatYouDidWell: [
    'Correctly implemented boolean flag tracking.',
    'Handled basic primitive return values.'
  ],
  conceptsDemonstrated: [
    { name: 'Closure Flag Logic', status: 'Good' },
    { name: 'Argument Passing', status: 'Needs Practice' },
    { name: 'Function Invocation Context', status: 'Needs Practice' }
  ],
  whatCouldBeImproved: [
    'Your function invocation was called without passing the dynamic arguments: `fn()` instead of `fn.apply(this, args)`.',
    'Test case 1 failed because inputs with parameters evaluated to undefined.'
  ],
  failingTestDetails: {
    input: 'createOnce((x) => x * 2)(5)',
    expected: '10',
    actual: 'NaN',
    commonMistakeExplanation: 'When returning the wrapped function, remember to accept `...args` and pass them into `fn(...args)` or `fn.apply(this, args)`. Otherwise parameters are lost!'
  },
  conceptExplanation: {
    topic: 'Higher-Order Function Caching, Lexical Closures & Memory Retention',
    theoreticalFoundation: 'A higher-order function is a mathematical functor mapping an input function ƒ to an augmented function ƒ′. In JavaScript, lexical closures retain bindings within a private Environment Record that persists on the heap across multiple invocation boundaries.',
    underlyingMechanics: 'The outer factory function creates a private closure scope holding `hasRun` and `cachedResult`. Every returned function call checks the boolean flag in O(1) time. If true, it returns `cachedResult` immediately, bypassing subsequent function body execution and downstream I/O operations.',
    stepByStepTrace: [
      '1. Outer createOnce(fn) allocates hasRun = false and cachedResult in a fresh Lexical Environment.',
      '2. The wrapper function is returned with a pointer to that Lexical Environment via [[Environment]].',
      '3. First invocation: hasRun is checked (false). It flips hasRun = true immediately (re-entrancy guard).',
      '4. fn.apply(this, args) is executed, preserving caller "this" binding and forwarding dynamic arguments.',
      '5. Return value is saved to cachedResult and returned to the caller.',
      '6. Second & subsequent invocations: hasRun is true, so fn is NEVER invoked again; cachedResult is returned in O(1).'
    ],
    architecturalTakeaways: 'In enterprise systems, one-time execution gates protect critical transactional boundaries: idempotent payment charges, singleton WebAssembly module compilations, analytics telemetry handshakes, and database connection pooling.',
    commonPitfalls: [
      'Losing "this" binding by calling fn(...args) instead of fn.apply(this, args) when methods belong to a class or object.',
      'Ignoring errors: if fn throws an unhandled exception on first run, forgetting whether it should retry or permanently stay locked.',
      'Retaining references to large closures in fn when they are no longer required after initial execution.'
    ]
  },
  topSolutions: [
    {
      id: 'fail-sol-1',
      rank: 1,
      title: 'Approach 1: Canonical Closure Flag (Idiomatic)',
      subtitle: 'Production Standard Used by Lodash & Ramda',
      paradigm: 'Higher-Order Lexical Closure',
      timeComplexity: 'O(1) amortized',
      spaceComplexity: 'O(1) auxiliary',
      code: `function createOnce(fn) {
  let hasRun = false;
  let cachedResult;

  return function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };
}`,
      explanation: 'Stores execution status in a private closure boolean variable and guards invocation. Forwards this context and arguments via .apply().',
      pros: ['Simplest cognitive overhead', 'Standard cross-engine optimization', 'Guaranteed O(1) performance'],
      cons: ['Retains original fn reference in closure memory even after execution'],
      whenToUse: 'The recommended default for 95% of utility libraries, event listeners, and UI click debouncers.'
    },
    {
      id: 'fail-sol-2',
      rank: 2,
      title: 'Approach 2: Garbage-Collector Memory-Safe Nullification',
      subtitle: 'Immediate Scope Release for Heavy Payloads',
      paradigm: 'Garbage Collector Optimization',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1) [Zero Long-Term Retained Memory]',
      code: `function createOnceMemorySafe(fn) {
  let cachedResult;

  return function(...args) {
    if (fn) {
      cachedResult = fn.apply(this, args);
      // Sever the pointer so V8 can GC heavy outer scopes immediately:
      fn = null;
    }
    return cachedResult;
  };
}`,
      explanation: 'Instead of keeping a boolean flag and an active reference to fn, it nullifies fn after execution. If fn captured a 50MB ArrayBuffer or heavy DOM trees, those are immediately freed.',
      pros: ['Prevents stealth memory leaks in long-lived single page apps', 'Eliminates redundant boolean variable'],
      cons: ['Mutates closure variable fn'],
      whenToUse: 'Critical for long-lived application lifecycles, heavy report generators, and WebGL context initializers.'
    },
    {
      id: 'fail-sol-3',
      rank: 3,
      title: 'Approach 3: Transparent ES6 Proxy Trap Interceptor',
      subtitle: 'Metaprogramming with Arity & Name Preservation',
      paradigm: 'Proxy Virtualization',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      code: `function createOnceProxy(fn) {
  let hasRun = false;
  let cachedResult;

  return new Proxy(fn, {
    apply(target, thisArg, argumentsList) {
      if (!hasRun) {
        hasRun = true;
        cachedResult = Reflect.apply(target, thisArg, argumentsList);
      }
      return cachedResult;
    }
  });
}`,
      explanation: 'Wraps the target function with an ES6 Proxy. Preserves the original function’s length (arity), name, prototype chain, and custom properties automatically.',
      pros: ['Preserves fn.length, fn.name, and instance properties', 'Fully transparent to reflection tools'],
      cons: ['Slight micro-overhead on Proxy trap invocation (~5-10% slower in micro-benchmarks)'],
      whenToUse: 'Best for TypeScript decorators, ORM method interceptors, and framework plugins.'
    },
    {
      id: 'fail-sol-4',
      rank: 4,
      title: 'Approach 4: Stateful Functor with State Inspection & Reset',
      subtitle: 'Testable & Introspectable Command Functor',
      paradigm: 'Object-Oriented Command Pattern',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      code: `function createOnceInspectable(fn) {
  let hasRun = false;
  let cachedResult;

  const onceFn = function(...args) {
    if (!hasRun) {
      hasRun = true;
      cachedResult = fn.apply(this, args);
    }
    return cachedResult;
  };

  // Diagnostic & testing hooks:
  onceFn.hasExecuted = () => hasRun;
  onceFn.reset = () => {
    hasRun = false;
    cachedResult = undefined;
  };

  return onceFn;
}`,
      explanation: 'Enriches the wrapper function with inspectable accessor methods: .hasExecuted() for unit test assertion and .reset() for test fixture teardown.',
      pros: ['Enables easy unit testing and mock resets', 'Observable state without breaking callable interface'],
      cons: ['Exposes mutable reset method that could be abused in application code'],
      whenToUse: 'Ideal in test-driven development (TDD), mocking frameworks, and stateful lifecycle hooks.'
    },
    {
      id: 'fail-sol-5',
      rank: 5,
      title: 'Approach 5: WeakMap-Keyed Universal Registry',
      subtitle: 'Non-Invasive Singleton Invocation Engine',
      paradigm: 'Weak-Referenced Global Registry',
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(N) across multiple unique functions',
      code: `const onceRegistry = new WeakMap();

function runOnce(fn, context, ...args) {
  if (!onceRegistry.has(fn)) {
    const result = fn.apply(context, args);
    onceRegistry.set(fn, { result });
  }
  return onceRegistry.get(fn).result;
}`,
      explanation: 'Stores execution results in an external WeakMap keyed by the function object itself. Does not wrap or mutate the target function.',
      pros: ['Completely non-invasive—leaves function identity intact', 'Automatic garbage collection when function is discarded'],
      cons: ['Must pass the original function reference on each call site'],
      whenToUse: 'Great for distributed middleware pipelines and runtime patchers where wrapping functions is disallowed.'
    }
  ],
  aiRecommendation: 'Review function argument forwarding in closures before retrying.'
};
