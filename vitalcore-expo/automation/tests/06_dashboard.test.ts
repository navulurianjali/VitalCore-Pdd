import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runDashboardSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_DASH');
  Logger.info(`Executing Dashboard Suite: ${spec?.count} test cases.`);
}
