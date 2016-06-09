# listr [![Build Status](https://travis-ci.org/SamVerschueren/listr.svg?branch=master)](https://travis-ci.org/SamVerschueren/listr)

> Terminal task list

<img src="screenshot.gif" width="492">

## Install

```
$ npm install --save listr
```


## Usage

```js
const execa = require('execa');
const Listr = require('listr');

const tasks = new Listr([
	{
		message: 'Install package dependencies',
		task: () => execa('npm', ['install'])
	},
	{
		message: 'Run tests',
		task: () => execa('npm', ['test'])
	},
	{
		message: 'Publish package',
		task: () => execa('npm', ['publish'])
	}
]);

tasks.run().catch(err => {
	console.error(err);
});
```


## API

### Listr([tasks])

#### tasks

Type: `object[]`

List of tasks.

##### message

Type: `string`

Message of the task.

##### task

Type: `Function`

Task function.

### Instance

#### addTask(task)

##### task

Type: `object[]`

Task object.

#### run()

Start executing the tasks.


## Related

- [ora](https://github.com/sindresorhus/ora) - Elegant terminal spinner
- [cli-spinners](https://github.com/sindresorhus/cli-spinners) - Spinners for use in the terminal


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
