export const makeTestOutput = (
  ...expected: string[]
): ((innerExpected?: string[]) => void) => {
  const log = jest.fn<void, string[]>()
  const originalLog = console.log
  console.log = log

  return (innerExpected?: string[]) => {
    ;(innerExpected ?? expected).forEach((line, index) => {
      expect(log).toHaveBeenNthCalledWith(index + 1, line)
    })

    console.log = originalLog
  }
}
