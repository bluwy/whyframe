export function Story({ title, src, children, _why }) {
  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe data-why title={title} src={src || _why?.src}>
        {children}
      </iframe>
    </div>
  )
}
