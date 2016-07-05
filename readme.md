# listr [![Build Status](https://travis-ci.org/SamVerschueren/listr.svg?branch=master)](https://travis-ci.org/SamVerschueren/listr)

> Terminal task list

<img src="media/screenshot.gif">

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
		title: 'Git',
		task: () => {
			return new Listr([
				{
					title: 'Checking git status',
					task: () => execa.stdout('git', ['status', '--porcelain']).then(result => {
						if (result !== '') {
							throw new Error('Unclean working tree. Commit or stash changes first.');
						}
					});
				},
				{
					title: 'Checking remote history',
					task: () => execa.stdout('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD']).then(result => {
						if (result !== '0') {
							throw new Error('Remote history differ. Please pull changes.');
						}
					});
				}
			]);
		}
	},
	{
		title: 'Install package dependencies',
		task: () => execa('npm', ['install'])
	},
	{
		title: 'Run tests',
		task: () => execa('npm', ['test'])
	},
	{
		title: 'Publish package',
		task: () => execa('npm', ['publish'])
	}
]);

tasks.run().catch(err => {
	console.error(err);
});
```


### Task

A `task` can return different values. If a `task` returns, it means the task was completed succesfully. If a task throws an error, the task failed.

```js
const tasks = new Listr([
	{
		title: 'Success',
		task: () => 'Foo'
	},
	{
		title: 'Failure',
		task: () => {
			throw new Error('Bar')
		}
	}
]);
```


#### Promises

A `task` can also be async by returning a `Promise`. If the promise resolves, the task completed sucessfully, it it rejects, the task failed.

```js
const tasks = new Listr([
	{
		title: 'Success',
		task: () => Promise.resolve('Foo');
	},
	{
		title: 'Failure',
		task: () => Promise.reject('Bar')
	}
]);
```

#### Observable

<img src="media/observable.gif" width="255" align="right">

A `task` can also return an `Observable`. The thing about observables is that it can emit multiple values and can be used to show the output of the
task. Please note that only the last line of the output is rendered.

```js
const tasks = new Listr([
	{
		title: 'Success',
		task: () => {
			return new Observable(observer => {
				observer.next('Foo');

				setTimeout(() => {
					observer.next('Bar');
				}, 2000);

				setTimeout(() => {
					observer.complete();
				}, 4000);
			});
		}
	},
	{
		title: 'Failure',
		task: () => Promise.reject(new Error('Bar'))
	}
]);
```

#### Streams

It's also possible to return a `stream`. The stream will be converted to an `Observable` and handled as such.


## API

### Listr([tasks])

#### tasks

Type: `object[]`

List of tasks.

##### title

Type: `string`

Title of the task.

##### task

Type: `Function`

Task function.

### Instance

#### add(task)

Returns the instance.

##### task

Type: `object` `object[]`

Task object or multiple task objects.

#### run()

Start executing the tasks.


## Related

- [ora](https://github.com/sindresorhus/ora) - Elegant terminal spinner
- [cli-spinners](https://github.com/sindresorhus/cli-spinners) - Spinners for use in the terminal


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
