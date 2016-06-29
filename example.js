'use strict';
const Observable = require('rxjs/Observable').Observable;
const logSymbols = require('log-symbols');
const Listr = require('./');

const tasks = new Listr([
	{
		title: 'Git',
		task: () => {
			return new Listr([
				{
					title: 'Checking git status',
					task: () => {
						return new Observable(observer => {
							observer.next('foo');

							setTimeout(() => {
								observer.next('bar');
							}, 2000);

							setTimeout(() => {
								observer.next('bar');
								observer.complete();
							}, 4000);
						});
					}
				},
				{
					title: 'Checking remote history',
					task: () => {
						return new Promise(resolve => {
							setTimeout(resolve, 2000);
						});
					}
				}
			]);
		}
	},
	{
		title: 'Install npm dependencies',
		task: () => {
			return new Promise(resolve => {
				setTimeout(resolve, 2000);
			});
		}
	},
	{
		title: 'Run tests',
		task: () => {
			return new Observable(observer => {
				observer.next('clinton && xo && ava');

				setTimeout(() => {
					observer.next(`${logSymbols.success} 7 passed`);
				}, 2000);

				setTimeout(() => {
					observer.complete();
				}, 4000);
			});
		}
	},
	{
		title: 'Publish package',
		task: () => {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					reject(new Error('Package name already exists'));
				}, 1000);
			});
		}
	}
]);

tasks.run().catch(err => {
	console.error(err.message);
});
