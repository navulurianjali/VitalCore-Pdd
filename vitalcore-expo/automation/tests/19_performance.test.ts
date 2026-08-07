import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runPerformanceSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_PERF');
  Logger.info(`Executing Performance Smoke Suite: ${spec?.count} test cases.`);
}
