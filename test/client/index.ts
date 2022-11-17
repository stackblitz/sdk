import sdk from '$src/index';

const baseConfig = {
  origin: import.meta.env.TEST_STACKBLITZ_ORIGIN,
};

sdk.embedProjectId('__TEST_CONTAINER__', 'js', baseConfig);
