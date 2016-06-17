'use strict';
const Listr = require('./');

const tasks = new Listr([
	{
		message: 'Git',
		task: () => {
			return new Listr([
				{
					message: 'Checking git status',
					task: () => {
						return new Promise(resolve => {
							setTimeout(resolve, 2000);
						});
					}
				},
				{
					message: 'Checking remote history',
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
		message: 'Install npm dependencies',
		task: () => {
			return new Promise(resolve => {
				setTimeout(resolve, 2000);
			});
		}
	},
	{
		message: 'Run tests',
		task: () => {
			return new Promise(resolve => {
				setTimeout(resolve, 3000);
			});
		}
	},
	{
		message: 'Publish package',
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
