import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runSessionSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_SESS');
  Logger.info(`Executing Session Management Suite: ${spec?.count} test cases.`);
}
