import helpers from 'yeoman-test';
import path from 'path';

beforeEach(() => {
    jest.resetModules();
    // The object returned act like a promise, so return it to wait until the process is done
});

describe('run generator', () => {
    test('downloading & copying', async () => {
        try {
            await helpers.run(path.join(__dirname, '../app'))
                .withArguments([])
                .withPrompts({
                    "app": "test",
                    "name": "Sebastian Döll",
                    "email": "sebastian@pixelmilk.com",
                    "yarn": false
                });
        } catch (object) {
            expect(object.error).toEqual('');
        }
    });

})

