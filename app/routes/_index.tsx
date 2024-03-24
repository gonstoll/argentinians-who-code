import {json, type HeadersArgs, type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {desc, inArray} from 'drizzle-orm'
import {ArrowUpDown, ArrowUpRight} from 'lucide-react'
import {cacheHeader} from 'pretty-cache-header'
import * as React from 'react'
import {ExpertiseFilters} from '~/components/expertise-filters'
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
import {devs, type Expertise} from '~/db/schema'

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

export function headers({loaderHeaders}: HeadersArgs) {
  return {'Cache-Control': loaderHeaders.get('Cache-Control')}
}

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.getAll('expertise') as Array<Expertise>
  const data = await db
    .select()
    .from(devs)
    .where(query.length ? inArray(devs.expertise, query) : undefined)
    .orderBy(desc(devs.createdAt))
    .all()
  const headers = {
    'Cache-Control': cacheHeader({
      public: true,
      maxAge: '10mins',
      sMaxage: '3days',
      staleWhileRevalidate: '1year',
      staleIfError: '1year',
    }),
  }
  return json({data}, {headers})
}

export default function Index() {
  const {data} = useLoaderData<typeof loader>()
  const listHasItems = data.length > 0

  return (
    <section>
      {listHasItems ? (
        <div className="mb-4 inline-block md:float-right">
          <ExpertiseFilters />
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
