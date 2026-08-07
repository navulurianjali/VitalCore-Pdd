declare var $: (selector: string) => any;
declare var $$: (selector: string) => any;
declare var driver: any;
declare var expect: any;
declare namespace WebdriverIO {
  interface Config {
    [key: string]: any;
  }
}
