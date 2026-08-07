import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runFileUploadSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_UPLD');
  Logger.info(`Executing File Upload Suite: ${spec?.count} test cases.`);
}
