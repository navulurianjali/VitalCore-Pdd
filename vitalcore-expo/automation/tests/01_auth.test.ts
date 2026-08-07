import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runAuthSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_AUTH');
  Logger.info(`Executing Authentication Suite: ${spec?.count} test cases.`);
}
