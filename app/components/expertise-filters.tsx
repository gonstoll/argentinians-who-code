import {useSearchParams} from '@remix-run/react'
import {ListFilter} from 'lucide-react'
import {expertises, type Expertise} from '~/db/schema'
import {cn} from '~/lib/utils'
import {Badge} from './ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function ExpertiseFilters({className}: {className?: string}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeExpertises = searchParams.getAll('expertise')

  function handleFilter(expertise: Expertise[number]) {
    setSearchParams(
      prev => {
        const expertiseParams = prev.getAll('expertise')
        if (expertiseParams.includes(expertise)) {
          prev.delete('expertise', expertise)
          return prev
        }
        prev.append('expertise', expertise)
        return prev
      },
      {preventScrollReset: true},
    )
  }

  function handleClear() {
    setSearchParams(
      prev => {
        prev.delete('expertise')
        return prev
      },
      {preventScrollReset: true},
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn('flex items-center gap-2', className)}>
        Expertise <ListFilter className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-normal">Filter by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {expertises.map(e => (
          <DropdownMenuCheckboxItem
            key={e}
            checked={activeExpertises.includes(e)}
            onCheckedChange={() => handleFilter(e)}
            className="cursor-pointer"
          >
            <Badge key={e} variant={e}>
              • {e.toLowerCase()}
            </Badge>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleClear}>
          Clear all
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
