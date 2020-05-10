import * as fs from 'fs'
import * as path from 'path'

import split from 'split'

import Listr from '../src'

import SimpleRenderer from './SimpleRenderer'
import { makeTestOutput } from './utils'

test('output', async () => {
  const testOutput = makeTestOutput(
    'foo [started]',
    'bar [started]',
    '> foo',
    '> bar',
    'bar [completed]',
    'foo [completed]',
    'done'
  )

  await new Listr(
    [
      {
        title: 'foo',
        task: () => {
          return new Listr([
            {
              title: 'bar',
              task: () =>
                fs
                  .createReadStream(
                    path.join(__dirname, 'fixtures/data.txt'),
                    'utf8'
                  )
                  // Because of bad split typing
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .pipe(split(/\r?\n/, null, { trailing: false } as any)),
            },
          ])
        },
      },
    ],
    { renderer: SimpleRenderer }
  ).run()

  testOutput()
})
