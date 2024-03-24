import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import {getZodConstraint, parseWithZod} from '@conform-to/zod'
import type {LoaderFunctionArgs} from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
} from '@remix-run/react'
import {eq} from 'drizzle-orm'
import {AlertCircle, AlignLeft, ArrowUpRight, Loader2} from 'lucide-react'
import {useSpinDelay} from 'spin-delay'
import {ErrorList} from '~/components/error-list'
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert'
import {Badge} from '~/components/ui/badge'
import {Button} from '~/components/ui/button'
import {Card, CardContent, CardFooter, CardHeader} from '~/components/ui/card'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {Textarea} from '~/components/ui/textarea'
import {db, rateLimit} from '~/db'
import {devs, expertise, nominees, provinces} from '~/db/schema'
import {schema} from './nominate'

export async function loader({params}: LoaderFunctionArgs) {
  const type = params.type
  const id = params.id

  switch (type) {
    case 'nominees': {
      // TODO: Figure out how to convert this array to a single object
      const nominee = await db
        .select()
        .from(nominees)
        .where(eq(nominees.id, Number(id)))
        .then(v => v[0])
      return json({type, data: nominee})
    }

    case 'devs': {
      const dev = await db
        .select()
        .from(devs)
        .where(eq(devs.id, Number(id)))
        .then(v => v[0])
      return json({type, data: dev})
    }

    default: {
      throw new Response('Invalid type', {status: 404})
    }
  }
}

export async function action({request, params}: LoaderFunctionArgs) {
  const type = params.type
  const id = params.id
  const formData = await request.formData()
  const result = parseWithZod(formData, {schema})

  if (result.status !== 'success') {
    return json(
      {
        status: 'error',
        result: result.reply(),
      } as const,
      {status: result.status === 'error' ? 400 : 200},
    )
  }

  // Rate limit
  const identifier = 'edit'
  const {success} = await rateLimit.limit(identifier)
  if (!success) throw new Response('Exceeded the rate limit', {status: 429})

  switch (type) {
    case 'nominees': {
      try {
        await db
          .update(nominees)
          .set(result.value)
          .where(eq(nominees.id, Number(id)))
        return redirect('/nominees')
      } catch (error) {
        return json(
          {
            status: 'error' as const,
            result: result.reply({
              formErrors: ['Something went wrong. Please try again later.'],
              resetForm: false,
            }),
          },
          {status: 400},
        )
      }
    }
    case 'devs': {
      try {
        await db
          .update(devs)
          .set(result.value)
          .where(eq(devs.id, Number(id)))
        return redirect('/devs')
      } catch (error) {
        return json(
          {
            status: 'error' as const,
            result: result.reply({
              formErrors: ['Something went wrong. Please try again later.'],
              resetForm: false,
            }),
          },
          {status: 400},
        )
      }
    }
    default: {
      throw new Response('Invalid type', {status: 404})
    }
  }
}

export default function EditPage() {
  const {data} = useLoaderData<typeof loader>()
  const params = useParams<{type: 'nominees' | 'devs'}>()
  const type = params.type === 'nominees' ? 'nominee' : 'dev'
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'
  const showSpinner = useSpinDelay(submitting, {minDuration: 400})
  const [form, fields] = useForm({
    id: 'edit-form',
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    onValidate({formData}) {
      return parseWithZod(formData, {schema})
    },
    defaultValue: {
      expertise: data.expertise,
      from: data.from,
      name: data.name,
      link: data.link,
      reason: data.reason,
    },
  })

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        Edit {type} {data.name}
      </h1>

      <Form method="post" {...getFormProps(form)}>
        {form.errors?.length ? (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                <ErrorList id={form.errorId} errors={form.errors} />
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
        <Card>
          <CardHeader className="space-y-3.5">
            <div className="flex flex-col gap-2">
              <Label htmlFor={fields.name.id}>Name</Label>
              <Input
                {...getInputProps(fields.name, {type: 'text'})}
                autoFocus
              />
              <ErrorList id={fields.name.id} errors={fields.name.errors} />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor={fields.from.id}>From</Label>
                <Select
                  {...getSelectProps(fields.from)}
                  defaultValue={fields.from.initialValue}
                >
                  <SelectTrigger id={fields.from.id} className="w-full">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map(p => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorList id={fields.from.id} errors={fields.from.errors} />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor={fields.expertise.id}>Expertise</Label>
                <Select
                  {...getSelectProps(fields.expertise)}
                  defaultValue={fields.expertise.initialValue}
                >
                  <SelectTrigger id={fields.expertise.id} className="w-full">
                    <SelectValue placeholder="Select an area of expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    {expertise.map(p => (
                      <SelectItem key={p} value={p}>
                        <Badge variant={p}>• {p}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorList
                  id={fields.expertise.id}
                  errors={fields.expertise.errors}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-2">
                <ArrowUpRight className="w-5" />
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor={fields.link.id}>Link</Label>
                  <Input {...getInputProps(fields.link, {type: 'text'})} />
                  <ErrorList id={fields.link.id} errors={fields.link.errors} />
                </div>
              </li>
              <li className="flex items-start gap-2">
                <AlignLeft className="w-5" />
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor={fields.reason.id}>
                    Why do you want to nominate them?
                  </Label>
                  <Textarea {...getTextareaProps(fields.reason)} />
                  <ErrorList
                    id={fields.reason.id}
                    errors={fields.reason.errors}
                  />
                </div>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <input type="hidden" name="nomineeId" value={data.id} />
            <Button type="submit" variant="default">
              {showSpinner ? <Loader2 className="mr-2 animate-spin" /> : null}
              Submit
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  )
}
