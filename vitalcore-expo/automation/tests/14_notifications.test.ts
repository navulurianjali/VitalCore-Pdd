import { MODULE_SPECS } from '../data/testData';
import { Logger } from '../utils/logger';

export function runNotificationsSuite() {
  const spec = MODULE_SPECS.find(m => m.prefix === 'TC_NOTIF');
  Logger.info(`Executing Notifications Suite: ${spec?.count} test cases.`);
}
