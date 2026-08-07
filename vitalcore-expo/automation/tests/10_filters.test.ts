import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runFiltersSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_FLTR');
  Logger.info(`Executing Filters Suite: ${spec?.count} test cases.`);
}
