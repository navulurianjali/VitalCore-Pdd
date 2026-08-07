import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runFormsSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_FORM');
  Logger.info(`Executing Forms Suite: ${spec?.count} test cases.`);
}
