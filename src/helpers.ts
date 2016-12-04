/* tslint:disable no-var-requires no-require-imports */
const clui = require('clui');
const Spinner = clui.Spinner;

export function yell(message) {
  return message ? new Spinner(message) : message;
}
