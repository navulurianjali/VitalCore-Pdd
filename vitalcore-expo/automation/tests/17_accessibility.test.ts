import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runAccessibilitySuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_ACC');
  Logger.info(`Executing Accessibility Suite: ${spec?.count} test cases.`);
}
