import {json, type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData, useSearchParams} from '@remix-run/react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {inArray} from 'drizzle-orm'
import {ArrowUpDown, ArrowUpRight} from 'lucide-react'
import * as React from 'react'
import {Badge} from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {db} from '~/db'
import type {Dev} from '~/db/schema'
import {devs, expertise, type Expertise} from '~/db/schema'
import {classNames} from '~/utils/misc'

export const columns: Array<ColumnDef<Dev>> = [
  {accessorKey: 'name', size: 130, header: 'Name'},
  {
    accessorKey: 'from',
    size: 150,
    header({column}) {
      return (
        <button
          className="flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          From <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
  },
  {
    accessorKey: 'expertise',
    size: 130,
    header({column}) {
      return (
        <button
          className="flex items-center gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expertise <ArrowUpDown className="h-4 w-4" />
        </button>
      )
    },
    cell({getValue}) {
      const expertise = getValue<Expertise>()
      return <Badge variant={expertise}>• {expertise.toLowerCase()}</Badge>
    },
  },
  {
    accessorKey: 'link',
    header: '',
    size: 50,
    cell({row}) {
      return (
        <div className="flex justify-end">
          <a href={row.getValue('link')} target="_blank" rel="noreferrer">
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )
    },
  },
]

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.getAll('expertise') as Array<Expertise>
  const data = await db
    .select()
    .from(devs)
    .where(inArray(devs.expertise, query.length ? query : [...expertise]))
    .all()
  return json({data})
}

export default function Index() {
  const {data} = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const listHasItems = data.length > 0

  function handleSearchParams(expertise: Expertise[number]) {
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

  return (
    <section>
      {listHasItems ? (
        <div className="mb-4 inline-block md:float-right">
          <div className="flex flex-wrap items-center gap-1 rounded-md border border-border p-3 md:gap-2 md:p-4">
            {expertise.map(e => {
              const expertiseSearchParams = searchParams.getAll('expertise')
              const isActive =
                expertiseSearchParams.includes(e) ||
                !expertiseSearchParams.length

              return (
                <Badge
                  key={e}
                  variant={e}
                  className={classNames('cursor-pointer', {
                    'opacity-40': !isActive,
                  })}
                  onClick={() => handleSearchParams(e)}
                >
                  • {e.toLowerCase()}
                </Badge>
              )
            })}
          </div>
        </div>
      ) : null}
      <DataTable data={data} />
    </section>
  )
}

function DataTable({data}: {data: Array<Dev>}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {sorting},
  })

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{width: header.getSize()}}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
