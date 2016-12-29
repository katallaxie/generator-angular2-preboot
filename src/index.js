/* tslint:disable no-require-imports no-var-requires adjacent-overload-signatures max-line-length no-empty ordered-imports */
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import path from 'path';
import proc from 'process';
import rimraf from 'rimraf';
import s from 'underscore.string';
import yosay from 'yosay';

const remote = require('yeoman-remote');

// config
import { yell } from './helpers';
import config from './config';

// yell('test');

class PrebootGenerator extends Generator {

  constructor(args, options) {
    super(args, options);

    this.argument('appname', {
      desc: `The name of the application (e.g. 'example')`,
      type: String,
      optional: true,
      default: path.basename(proc.cwd()),
    });

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

          this.fs.extendJSON(
            this.destinationPath('package.json'),
            {
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
            },
          );

          done();
        });
      },

      npm() {

        // npm
        if (!this.options['skip-install']) {
          // new counter
          const cl = console.log;
          console.log = () => { };

          const counter = yell(`Installing dependencies via ${(this.options.yarn ? 'yarn' : 'npm')} ...`);
          counter.start();

          this.runInstall(this.options.yarn ? 'yarn' : 'npm', '', this.options.yarn ? {} : config.npm, () => {
            console.log = cl;
            counter.stop();
          });
        } else {
          this.log(`\nPlease run ${chalk.yellow.bold('npm install')}.
            \nAfterwards run ${chalk.yellow.bold('npm start')}`);
        }
      }

    };
  }

}

// exporting generator as CommonJS module
module.exports = PrebootGenerator;
