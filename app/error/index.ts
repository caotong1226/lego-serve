import { userErrorMessages } from './user';
import { workErrorMessages } from './work';
import { utilsErrorMessages } from './utils';

export const globalErrorMessages = {
  ...userErrorMessages,
  ...workErrorMessages,
  ...utilsErrorMessages,
};

export type GlobalErrorTypes = keyof (typeof userErrorMessages & typeof workErrorMessages & typeof utilsErrorMessages);
