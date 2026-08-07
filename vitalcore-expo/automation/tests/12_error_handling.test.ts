import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runErrorHandlingSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_ERR');
  Logger.info(`Executing Error Handling Suite: ${spec?.count} test cases.`);
}
