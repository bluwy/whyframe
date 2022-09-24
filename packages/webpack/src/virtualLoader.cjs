/**
 * @this {import('webpack').LoaderContext<{
 *   wrappedIdToCode: Map<string, string>
 * }>}
 */
module.exports = function virtualLoader() {
  const id = this.resourcePath
  const wrappedIdToCode = this.getOptions().wrappedIdToCode
  if (wrappedIdToCode.has(id)) {
    return wrappedIdToCode.get(id)
  }
}
