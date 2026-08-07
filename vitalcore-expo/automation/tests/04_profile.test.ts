import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runProfileSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_PROF');
  Logger.info(`Executing Profile Suite: ${spec?.count} test cases.`);
}
