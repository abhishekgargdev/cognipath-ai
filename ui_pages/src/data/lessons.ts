import { Lesson } from '../types';

export const mockLessons: Record<string, Lesson> = {
  'js-closures': {
    id: 'lesson-js-closures',
    topicId: 'js-closures',
    title: 'JavaScript Closures & Lexical Scope',
    subtitle: 'Understand how functions retain access to outer lexical environments even after parent execution contexts complete.',
    estimatedMinutes: 20,
    difficulty: 'Intermediate',
    prerequisites: ['Functions & Scope Chain', 'Primitive vs Reference types'],
    masteryLevel: 78,
    whyYouAreLearningThis: 'Closures are the foundational mechanism behind React hooks (useState, useEffect, useMemo), module privacy patterns, event handlers, and functional currying. Mastering closures eliminates insidious state bugs and memory leaks.',
    sections: [
      {
        id: 'intro',
        title: 'Introduction: The Mystery of Retained State',
        content: `In JavaScript, functions aren't isolated blocks of logic—they are objects bundled together with references to their surrounding state. 
This combination of a function bundled together with references to its lexical environment is called a **closure**.

When a function executes in traditional stack-based architectures, its local variables are destroyed as soon as the stack frame pops. But in JavaScript, if an inner function outlives its parent, the engine preserves that variable scope in heap memory.`,
        highlightNote: 'A closure gives an inner function access to an outer function’s scope, even after the outer function has returned.'
      },
      {
        id: 'what-is-closure',
        title: 'What Exactly Is a Closure?',
        content: `Technically, **every function in JavaScript creates a closure at definition time**, because every function retains a hidden internal property \`[[Environment]]\` pointing to the lexical environment in which it was authored.

However, we practically notice and utilize closures when an inner function is passed around, returned from a parent function, or attached to an asynchronous event callback.`,
        codeSnippet: {
          language: 'javascript',
          caption: 'Basic Closure: Retaining the outer variable count',
          code: `function createCounter() {
  let count = 0; // Private variable enclosed in heap

  return {
    increment: () => {
      count += 1;
      return count;
    },
    getValue: () => count
  };
}

const counterA = createCounter();
console.log(counterA.increment()); // 1
console.log(counterA.increment()); // 2

// Notice: There is NO way to directly modify count from the outside:
// counterA.count is undefined!
console.log(counterA.count); // undefined`
        }
      },
      {
        id: 'how-it-works',
        title: 'Under the Hood: Lexical Environment & Heap Allocation',
        content: `How does JavaScript allow \`count\` to survive when \`createCounter()\` has already finished executing?

1. **Call Stack Execution**: When \`createCounter()\` is invoked, an Execution Context is pushed to the Call Stack.
2. **Lexical Environment Created**: An Environment Record storing \`count: 0\` is instantiated.
3. **Inner Functions Bound**: The returned object contains arrow functions whose internal \`[[Environment]]\` slot holds a direct reference to this Environment Record.
4. **Stack Cleanup & Heap Preservation**: The execution context pops off the Call Stack. But because \`counterA\` holds live references to the inner functions, JavaScript's Garbage Collector (Mark-and-Sweep) recognizes this environment as reachable and promotes it to heap memory.`,
        calloutType: 'info',
        highlightNote: 'Variables referenced by surviving inner functions are not garbage collected. Be cautious not to unintentionally capture massive objects in closures if they are not needed long-term.'
      },
      {
        id: 'real-world',
        title: 'Real-World Pattern: Factory Functions & Debounce',
        content: `A ubiquitous practical use case of closures is in utility functions like \`debounce\` and \`throttle\`, which are heavily used in search inputs, resize listeners, and auto-saving forms.`,
        codeSnippet: {
          language: 'javascript',
          caption: 'Debounce implementation powered by a closure over timerId',
          code: `function debounce(callback, delayMs) {
  let timerId = null; // Closed-over variable

  return function (...args) {
    // Clear previous pending execution
    if (timerId) clearTimeout(timerId);

    // Schedule new execution retaining latest arguments
    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, delayMs);
  };
}

const handleSearch = debounce((query) => {
  console.log("Searching backend for:", query);
}, 300);`
        }
      }
    ],
    commonMistakes: [
      {
        title: 'The Classic Loop Variable Trap (var vs let)',
        mistakeCode: `// ❌ Using var creates a single shared function scope
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Outputs: 3, 3, 3!
  }, 100);
}`,
        correctionCode: `// ✅ Using let creates a brand-new lexical binding per iteration
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i); // Outputs: 0, 1, 2
  }, 100);
}`,
        explanation: 'Because var is function-scoped, all three timer callbacks close over the exact same variable i. By the time the callbacks fire 100ms later, the loop has finished and i equals 3. Using let creates a fresh binding for each iteration, preserving 0, 1, and 2.'
      },
      {
        title: 'Accidental Memory Leak via Large Enclosing Scopes',
        mistakeCode: `function attachHandler() {
  const hugeDataPayload = new Array(1000000).fill("heavy");
  const el = document.getElementById("btn");
  
  // Handler only needs element title, but retains entire scope
  el.addEventListener("click", () => {
    console.log(hugeDataPayload[0]); // Keeps 1M items in memory
  });
}`,
        correctionCode: `function attachHandler() {
  const hugeDataPayload = new Array(1000000).fill("heavy");
  const firstItem = hugeDataPayload[0]; // Extract only what is required
  const el = document.getElementById("btn");

  el.addEventListener("click", () => {
    console.log(firstItem); // hugeDataPayload can now be garbage collected!
  });
}`,
        explanation: 'Closures capture references, not snapshots. If an event handler holds onto a variable from a scope that also holds massive data structures, those data structures cannot be garbage collected as long as the DOM event listener remains active.'
      }
    ],
    keyTakeaways: [
      'A closure is a function bundled with references to its surrounding lexical environment.',
      'Closures allow functions to maintain private state without global variables or class syntax.',
      'Variables enclosed by surviving functions move from the stack to the heap, preventing garbage collection until all references vanish.',
      'Always use block-scoped `let` or `const` inside loops to avoid sharing a single mutable loop counter.'
    ],
    knowledgeCheck: [
      {
        id: 'kc-1',
        question: 'When is a closure created in JavaScript?',
        options: [
          'Only when a function is returned from another function',
          'At function definition time, binding to its outer lexical scope',
          'Only when async callbacks like setTimeout or fetch are called',
          'When the garbage collector runs out of stack space'
        ],
        correctIndex: 1,
        explanation: 'Every JavaScript function creates a closure at definition time through its internal [[Environment]] reference to its lexical scope.'
      },
      {
        id: 'kc-2',
        question: 'What happens to local variables inside an outer function after it returns, if an inner function references them?',
        options: [
          'They are deleted immediately by the call stack',
          'They are converted into global window properties',
          'They are preserved in heap memory as long as the inner function is reachable',
          'They turn into undefined primitives'
        ],
        correctIndex: 2,
        explanation: 'The JavaScript engine identifies reachable references via garbage collection and retains the enclosing scope on the heap.'
      }
    ]
  },
  'async-event-loop': {
    id: 'lesson-async-event-loop',
    topicId: 'async-event-loop',
    title: 'Async JavaScript & The Event Loop',
    subtitle: 'Master the call stack, Web APIs, microtasks (Promises), macrotasks (Timers), and async/await scheduling order.',
    estimatedMinutes: 25,
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript Fundamentals', 'Closures & Scope Retention'],
    masteryLevel: 58,
    whyYouAreLearningThis: 'Node.js and browser UIs execute on a single thread. Understanding microtask priority versus macrotask queuing is essential to prevent UI stutter and unexpected race conditions.',
    sections: [
      {
        id: 'event-loop-basics',
        title: 'Single-Threaded Non-Blocking I/O',
        content: `JavaScript runs on a single main thread with one Call Stack. To handle network requests, file reading, and timers without freezing the entire browser window, the runtime relies on the **Event Loop** and concurrency queues.

The Call Stack executes synchronous code to completion (Run-to-completion model). When an asynchronous API like \`fetch\` or \`setTimeout\` is called, the heavy lifting is handed off to browser Web APIs (or Node.js libuv threads).`,
        highlightNote: 'The Event Loop checks: Is the Call Stack empty? If YES, it flushes the Microtask Queue first, then picks ONE task from the Macrotask Queue.'
      },
      {
        id: 'micro-vs-macro',
        title: 'Microtasks vs Macrotasks: The Golden Priority Rule',
        content: `The single biggest source of async bugs is confusing the execution priority between:

- **Microtasks**: \`Promise.then()\`, \`catch()\`, \`finally()\`, \`queueMicrotask()\`, \`MutationObserver\`
- **Macrotasks**: \`setTimeout()\`, \`setInterval()\`, \`setImmediate()\`, I/O callbacks, UI rendering events

**Rule:** Microtasks have absolute priority. The engine will NEVER process a new Macrotask or re-render the screen until the Microtask Queue is 100% empty!`,
        codeSnippet: {
          language: 'javascript',
          caption: 'Execution order prediction example',
          code: `console.log("1. Synchronous start");

setTimeout(() => {
  console.log("4. Macrotask (setTimeout)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Microtask (Promise)");
});

console.log("2. Synchronous end");

// Output Order:
// 1. Synchronous start
// 2. Synchronous end
// 3. Microtask (Promise)
// 4. Macrotask (setTimeout)`
        }
      }
    ],
    commonMistakes: [
      {
        title: 'Forgetting that async functions always return a Promise',
        mistakeCode: `async function getUserData() {
  return "Alex"; // Returns a Promise, not a string!
}

const user = getUserData();
console.log(user); // [object Promise]!`,
        correctionCode: `async function getUserData() {
  return "Alex";
}

// Either await inside an async function or use .then
const user = await getUserData();
console.log(user); // "Alex"`,
        explanation: 'Any function marked with the async keyword automatically wraps its return value in Promise.resolve().'
      }
    ],
    keyTakeaways: [
      'Synchronous code on the Call Stack always executes first.',
      'Microtasks (Promises) drain completely before any Macrotask (setTimeout) runs.',
      'A runaway microtask loop will freeze the browser and block UI rendering.'
    ],
    knowledgeCheck: [
      {
        id: 'kc-async-1',
        question: 'Which of the following will run first after synchronous code finishes?',
        options: [
          'setTimeout(fn, 0)',
          'Promise.resolve().then(fn)',
          'requestAnimationFrame(fn)',
          'setInterval(fn, 10)'
        ],
        correctIndex: 1,
        explanation: 'Promise callbacks are microtasks, which execute immediately upon call stack clearance before timers.'
      }
    ]
  }
};
