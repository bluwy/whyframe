export function Story({ title, src, children }) {
  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe data-why title={title} src={src}>
        {children}
      </iframe>
    </div>
  )
}
