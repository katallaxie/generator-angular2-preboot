// deps
var clui = require('clui');
var Spinner = clui.Spinner;
var promise = require('promise');
module.exports = {
    ui: {
        progress: function (message) {
            return message ? new Spinner(message) : message;
        }
    },
    tools: {
        npm: function (command, npmArgs, options /*, npm*/) {
            var lib;
            if (arguments.length === 4) {
                lib = arguments[3];
            }
            else {
                lib = require('npm');
            }
            var load = promise.denodeify(lib.load);
            return load(options)
                .then(function () {
                // if install is denodeified outside load.then(),
                // it throws "Call npm.load(config, cb) before using this command."
                var operation = promise.denodeify(lib.commands[command]);
                return operation(npmArgs || []);
            });
        }
    }
};
//# sourceMappingURL=helpers.js.map