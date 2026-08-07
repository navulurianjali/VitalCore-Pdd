import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runValidationSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_VAL');
  Logger.info(`Executing Input Validation Suite: ${spec?.count} test cases.`);
}
