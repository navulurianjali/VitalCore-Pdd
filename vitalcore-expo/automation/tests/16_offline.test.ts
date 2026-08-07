import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runOfflineSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_OFF');
  Logger.info(`Executing Offline Handling Suite: ${spec?.count} test cases.`);
}
