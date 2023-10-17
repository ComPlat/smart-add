import { ReactNode } from 'react'

const Content = (props: { children: ReactNode }) => {
  return <div className="w-full">{props.children}</div>
}

export default Content
