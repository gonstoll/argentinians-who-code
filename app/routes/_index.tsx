import {ThemeSwitch} from './action.set-theme'

export function meta() {
  return [
    {title: 'New Remix App'},
    {name: 'description', content: 'Welcome to Remix!'},
  ]
}

export default function Index() {
  return (
    <div>
      <ThemeSwitch />
      <h1>Hello world!</h1>
    </div>
  )
}
