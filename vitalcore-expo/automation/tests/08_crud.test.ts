import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runCrudSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_CRUD');
  Logger.info(`Executing CRUD Operations Suite: ${spec?.count} test cases.`);
}
