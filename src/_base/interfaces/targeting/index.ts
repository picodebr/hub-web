export interface ITargetingData {
  browsers: BrowserType[];
}
export const browserTypes = <const>['Edge', 'Chrome', 'Opera', 'Safari', 'Firefox', 'Internet Explorer', 'Other'];
export type BrowserType = (typeof browserTypes)[number];
