// deps
const clui = require('clui');
const Spinner = clui.Spinner;

export function yell(message) {
  return message ? new Spinner(message) : message;
}
