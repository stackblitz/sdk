const originalConsole = globalThis.console;

const mockConsole: Partial<typeof originalConsole> = {
  log(...args) {},
  warn(...args) {},
  error(...args) {},
  table(...args) {},
};

export function useMockConsole() {
  globalThis.console = mockConsole as typeof originalConsole;
  return mockConsole;
}

export function restoreConsole() {
  globalThis.console = originalConsole;
}
