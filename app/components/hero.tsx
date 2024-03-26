import {Badge} from './ui/badge'

export function Hero() {
  return (
    <div className="py-40">
      <div className="relative flex items-center gap-2">
        <Badge variant="hero">• argentinians</Badge>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 h-[650px] max-h-screen w-[750px] max-w-[100vw] -translate-x-2/4 -translate-y-2/4 bg-gradient opacity-15 blur-[120px]" />
          <p className="text-sm">who code</p>
        </div>
      </div>
    </div>
  )
}
