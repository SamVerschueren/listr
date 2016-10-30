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
					})
				},
				{
					title: 'Checking remote history',
					task: () => execa.stdout('git', ['rev-list', '--count', '--left-only', '@{u}...HEAD']).then(result => {
						if (result !== '0') {
							throw new Error('Remote history differ. Please pull changes.');
						}
					})
				}
			], {concurrent: true});
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


## Task

A `task` can return different values. If a `task` returns, it means the task was completed successfully. If a task throws an error, the task failed.

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


### Promises

A `task` can also be async by returning a `Promise`. If the promise resolves, the task completed successfully, it it rejects, the task failed.

```js
const tasks = new Listr([
	{
		title: 'Success',
		task: () => Promise.resolve('Foo')
	},
	{
		title: 'Failure',
		task: () => Promise.reject('Bar')
	}
]);
```

### Observable

<img src="media/observable.gif" width="250" align="right">

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

### Streams

It's also possible to return a `stream`. The stream will be converted to an `Observable` and handled as such.


### Skipping tasks

<img src="media/skipped.png" width="250" align="right">

Optionally specify a `skip` function to determine whether a task can be skipped.

- If the `skip` function returns a truthy value or a `Promise` that resolves to a truthy value then the task will be skipped.
- If the returned value is a string it will be displayed as the reason for skipping the task.
- If the `skip` function returns a falsey value or a `Promise` that resolves to a falsey value then the task will be executed as normal.
- If the `skip` function throws or returns a `Promise` that rejects, the task (and the whole build) will fail.

```js
const tasks = new Listr([
	{
		title: 'Task 1',
		task: () => Promise.resolve('Foo')
	},
	{
		title: 'Can be skipped',
		skip: () => {
			if (Math.random() > 0.5) {
				return 'Reason for skipping';
			}
		},
		task: () => 'Bar'
	},
	{
		title: 'Task 3',
		task: () => Promise.resolve('Bar')
	}
]);
```


## Custom renderers

It's possible to write custom renderers for Listr. A renderer is an ES6 class that accepts the tasks that it should renderer, and the Listr options object. It has two methods, the `render` method which is called when it should start rendering, and the `end` method. The `end` method is called all the tasks are completed or if a task failed. If a task failed, the error object is passed in via an argument.

```js
class CustomRenderer {

	constructor(tasks, options) { }

	render() { }

	end(err) { }
}

module.exports = CustomRenderer;
```

> Note: A renderer is not passed through to the subtasks, only to the main task. It is up to you to handle that case.

### Observables

Every task is an observable. The task emits three different events and every event is an object with a `type` property.

1. The state of the task has changed (`STATE`).
2. The task outputted data (`DATA`).
3. The task returns a subtask list (`SUBTASKS`).

This allows you to flexibly build up your UI. Let's render every task that starts executing.

```js
class CustomRenderer {

	constructor(tasks, options) {
		this._tasks = tasks;
		this._options = Object.assign({}, options);
	}

	render() {
		for (const task of this._tasks) {
			task.subscribe(event => {
				if (event.type === 'STATE' && task.isPending()) {
					console.log(`${task.title} [started]`);
				}
			});
		}
	}

	end(err) { }
}

module.exports = CustomRenderer;
```

If you want more complex examples, take a look at the [update](https://github.com/SamVerschueren/listr-update-renderer) and [verbose](https://github.com/SamVerschueren/listr-verbose-renderer) renderers.


## API

### Listr([tasks], [options])

#### tasks

Type: `object[]`

List of tasks.

##### title

Type: `string`

Title of the task.

##### task

Type: `Function`

Task function.

##### skip

Type: `Function`

Skip function. Read more about [skipping tasks](#skipping-tasks).

#### options

Any renderer specific options.

##### concurrent

Type: `boolean`<br>
Default: `false`

Set to `true` if you want tasks to run concurrently.

##### renderer

Type: `string` `object`<br>
Default: `default`<br>
Options: `default` `verbose` `silent`

Renderer that should be used. You can either pass in the name of the known renderer, or a class of a custom renderer.

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
