import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runResponsiveSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_RESP');
  Logger.info(`Executing Responsive UI Suite: ${spec?.count} test cases.`);
}
