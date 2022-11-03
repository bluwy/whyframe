export default function Component(props) {
  return <iframe data-why>{props.children}</iframe>
}

export const Component2 = ({ children }) => {
  return <iframe data-why>{children}</iframe>
}

export const Component3 = ({ children }) => <iframe data-why>{children}</iframe>


export const Component4 = (props) => {
  return <iframe data-why>{props.children}</iframe>
}

export const Component5 = (...args) => {
  return <iframe data-why>{args[0].children}</iframe>
}
