/**
 * @this {import('webpack').LoaderContext<{
 *   resolvedIdToCode: Map<string, string>
 * }>}
 */
module.exports = function virtualLoader() {
  const id = this.resourcePath
  const resolvedIdToCode = this.getOptions().resolvedIdToCode
  if (resolvedIdToCode.has(id)) {
    return resolvedIdToCode.get(id)
  }
}
