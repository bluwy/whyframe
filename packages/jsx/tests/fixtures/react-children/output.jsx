export default function Component(props) {
  return <iframe src={arguments[0]._why?.src || "/__whyframe.html"} data-why-id={arguments[0]._why?.id} data-why-source={arguments[0]._why?.source} data-why></iframe>
}
