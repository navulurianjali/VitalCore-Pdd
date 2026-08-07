import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runRegistrationSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_REG');
  Logger.info(`Executing Registration Suite: ${spec?.count} test cases.`);
}
