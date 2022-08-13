export function Story({ title, children }) {
  return (
    <div>
      <p>This is a story of {title}:</p>

      <iframe data-why title={title}>
        {children}
      </iframe>
    </div>
  )
}
