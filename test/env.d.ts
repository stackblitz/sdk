interface Window {
  StackBlitzSDK: typeof import('@stackblitz/sdk').default;
  testSDK: typeof import('./server/test-sdk').default
}

type StackBlitzSDK = typeof import('@stackblitz/sdk').default;
