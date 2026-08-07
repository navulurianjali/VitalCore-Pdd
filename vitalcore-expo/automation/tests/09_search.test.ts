import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runSearchSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_SRCH');
  Logger.info(`Executing Search Suite: ${spec?.count} test cases.`);
}
