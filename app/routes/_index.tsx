import {json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import {MoveRight} from 'lucide-react'
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
  {accessorKey: 'name', header: 'Name'},
  {accessorKey: 'from', header: 'From'},
  {
    accessorKey: 'expertise',
    header: 'Expertise',
    cell: ({getValue}) => {
      const expertise = getValue<Expertise>()
      const expertiseMap = {
        frontend: 'default',
        backend: 'secondary',
        fullstack: 'destructive',
        qa: 'outline',
      } as const
      return (
        <Badge variant={expertiseMap[expertise]}>
          • {expertise.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'link',
    header: '',
    cell: ({row}) => {
      return (
        <div className="flex justify-end">
          <a href={row.getValue('link')} target="_blank" rel="noreferrer">
            <MoveRight className="h-4 w-4" />
          </a>
        </div>
      )
    },
  },
]

export async function loader() {
  const data = await db.select().from(devs).all()
  return json({data})
}

export default function Index() {
  const {data} = useLoaderData<typeof loader>()
  return (
    <section className="font-mono">
      <DataTable data={data} />
    </section>
  )
}

function DataTable({data}: {data: Array<Dev>}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              return (
                <TableHead key={header.id}>
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
