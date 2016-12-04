// deps
import { Base } from 'yeoman-generator';
import * as _ from 'lodash';
import * as chalk from 'chalk';
import * as path from 'path';
import * as proc from 'process';
import * as rimraf from 'rimraf';
import * as s from 'underscore.string';

const yosay = require('yosay');
const remote = require('yeoman-remote');

// config
import { yell } from './helpers';
import config from './config';

// yell('test');

class PrebootGenerator extends Base {

  constructor(args, options) {
    super(args, options);

    this.argument('appname', {
      desc: 'appname',
      type: 'String',
      defaults: path.basename(proc.cwd()),
    });

    // allow to cache
    this.option('cache');

  }

  // this is the initializer method of the generator
  get initializing() {

    return {

      cleaning() {
        // async
        const done = this.async();

        if (!this.options['cache']) {
          // new counter
          const counter = yell('Cleaning cache ...');
          counter.start();

          // we would the defaults here
          rimraf(remote.cacheRoot(), () => {
            counter.stop();
            done();
          });
        } else {
          done();
        }
      },

      hello() {
        // say yo!
        this.log(yosay(`Greetings! Preboot your next Angular 2 project`));
      },

    };

  }

  get prompting() {
    return {
      async appName() {
        try {
          const prompt = [{
            type: 'input',
            name: 'app',
            message: `What is the name of your fun new app?`,
            default: this.appname,
            store: true,
          }];
          const { app } = await this.prompt(prompt);
          this.options.appname = s.camelize(s.slugify(s.humanize(app)));
        } catch (err) {
          this.error(`Error: ${err.message}`);
        }
      },

      async gitUserName() {
        try {
          const prompt = [{
            type: 'input',
            name: 'name',
            message: `What is your name?`,
            default: this.user.git.name(),
            store: true,
          }];
          const { name } = await this.prompt(prompt);
          this.options.name = name;
        } catch (err) {
          this.error(`Error: ${err.message}`);
        }
      },

      async gitUserEmail() {
        try {
          const prompt = [{
            type: 'input',
            name: 'email',
            message: `What is your email?`,
            default: this.user.git.email(),
            store: true,
          }];
          const { email } = await this.prompt(prompt);
          this.options.email = email;
        } catch (err) {
          this.error(`Error: ${err.message}`);
        }
      },

      async yarn() {
        try {
          const prompt = [{
            type: 'confirm',
            name: 'yarn',
            message: 'Would you like to use yarn?',
            default: false,
            store: true,
          }];
          const { yarn } = await this.prompt(prompt);
          this.options.yarn = yarn;
        } catch (err) {
          this.error(`Error: ${err.message}`);
        }
      },
    };
  }

  get configuring() { return {}; };

  get writing() {
    return {
      staging() {
        const done = this.async();

        // new counter
        const counter = yell(`Staging Angular 2 Preboot ...`);
        counter.start();

        // download tarball
        remote(config.tar, (err, cached) => {

          if (err) {
            this.error(`Error ${err}`);
          }

          // we have a different root for the sources
          this.sourceRoot(path.join(cached));

          counter.stop();

          this.fs.copy(
            this.templatePath('**/*'),
            this.destinationPath(''),
            {
              globOptions: {
                dot: true,
              },
            },
          );

          this._writeFiles(() => {
            done();
          });
        });
      },

      npm() {
        let pkg = require(this.destinationPath('package.json'));
        pkg = _.merge(pkg, {
          author: {
            name: this.options.name,
            email: this.options.email,
          },
          bugs: {
            url: '',
          },
          description: this.options.description,
          homepage: '',
          repository: {
            type: 'git',
            url: '',
          },
          version: '0.0.1',
        });

        this.write(this.destinationPath('package.json'), JSON.stringify(pkg, null, 2));

        // npm
        if (!this.options['skip-install']) {
          // new counter
          const cl = console.log;
          console.log = () => {};

          const counter = yell(`Installing dependencies via ${(this.options.yarn ? 'yarn' : 'npm')} ...`);
          counter.start();

          if (this.options.yarn) {
            this.runInstall('yarn', '', {}, () => {
              console.log = cl;
              counter.stop();
            });
          } else  {
            this.npmInstall(undefined, config.npm, () => {
              console.log = cl;
              counter.stop();
            });
          }
        } else {
          this.log(`\nPlease run ${chalk.yellow.bold('npm install')}.
            \nAfterwards run ${chalk.yellow.bold('npm start')}`);
        }
      },
    };
  }
}

// exporting generator as CommonJS module
module.exports = PrebootGenerator;
