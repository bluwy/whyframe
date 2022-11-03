export default function Component(props) {
  return <iframe src={arguments[0]._why?.src || "/__whyframe.html"} data-why-id={arguments[0]._why?.id} data-why-source={arguments[0]._why?.source} data-why></iframe>
}

export const Component2 = ($$props) => {const { children } = $$props;
  return <iframe src={$$props._why?.src || "/__whyframe.html"} data-why-id={$$props._why?.id} data-why-source={$$props._why?.source} data-why></iframe>
}

export const Component3 = ($$props) => {const { children } = $$props;return(<iframe src={$$props._why?.src || "/__whyframe.html"} data-why-id={$$props._why?.id} data-why-source={$$props._why?.source} data-why></iframe>)}


export const Component4 = (props) => {
  return <iframe src={props._why?.src || "/__whyframe.html"} data-why-id={props._why?.id} data-why-source={props._why?.source} data-why></iframe>
}

export const Component5 = (...args) => {
  return <iframe src={args[0]._why?.src || "/__whyframe.html"} data-why-id={args[0]._why?.id} data-why-source={args[0]._why?.source} data-why></iframe>
}
