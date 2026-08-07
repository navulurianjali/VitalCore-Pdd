import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runNavigationSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_NAV');
  Logger.info(`Executing Navigation Suite: ${spec?.count} test cases.`);
}
