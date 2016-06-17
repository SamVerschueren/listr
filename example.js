'use strict';
const Listr = require('./');

const tasks = new Listr([
	{
		title: 'Git',
		task: () => {
			return new Listr([
				{
					title: 'Checking git status',
					task: () => {
						return new Promise(resolve => {
							setTimeout(resolve, 2000);
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
			return new Promise(resolve => {
				setTimeout(resolve, 3000);
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
