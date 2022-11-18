import StackBlitzSDK from '@stackblitz/sdk';

(window as any).TEST_STACKBLITZ_ORIGIN = import.meta.env.TEST_STACKBLITZ_ORIGIN || '/server/';
(window as any).StackBlitzSDK = StackBlitzSDK;
