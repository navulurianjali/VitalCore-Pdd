import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runRegressionSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_REGRESS');
  Logger.info(`Executing Full Regression Suite: ${spec?.count} test cases.`);
}
