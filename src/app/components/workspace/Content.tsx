import { ReactNode } from 'react'

const Content = (props: { children: ReactNode }) => (
  <div className="w-full">{props.children}</div>
)

export default Content
