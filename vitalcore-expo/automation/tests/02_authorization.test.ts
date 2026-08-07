import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runAuthorizationSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_AUTHZ');
  Logger.info(`Executing Authorization Suite: ${spec?.count} test cases.`);
}
