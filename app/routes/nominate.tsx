import {
  getFormProps,
  getInputProps,
  getSelectProps,
  getTextareaProps,
  useForm,
} from '@conform-to/react'
import {getZodConstraint, parseWithZod} from '@conform-to/zod'
import {json, type LoaderFunctionArgs} from '@remix-run/node'
import {Form, useActionData, useNavigation} from '@remix-run/react'
import {AlertCircle, Loader2} from 'lucide-react'
import {Resend} from 'resend'
import {z} from 'zod'
import {GeneralErrorBoundary} from '~/components/error-boundary'
import {ErrorList} from '~/components/error-list'
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {Textarea} from '~/components/ui/textarea'
import {db, rateLimit} from '~/db'
import {expertise, nominees, provinces} from '~/db/schema'
import {useSpinDelay} from 'spin-delay'

const schema = z.object({
  name: z
    .string({required_error: 'Please provide the nominee’s name'})
    .min(1, {message: 'Name should have at least 2 (two) characters'})
    .max(100, {message: 'Name should have at most 100 (hundred) characters'}),
  from: z.enum(provinces, {
    required_error: 'Please select a province where the nominee is from',
  }),
  expertise: z.enum(expertise, {
    required_error: 'Please select an area of expertise',
  }),
  link: z
    .string({required_error: 'Please provide a link to their work'})
    .url({message: 'Invalid URL'})
    .max(200, {
      message: 'Link should have at most 200 (two hundred) characters',
    }),
  reason: z
    .string({
      required_error:
        'Please take a moment to explain why you are nominating this person',
    })
    .min(70, {
      message: 'Your explanation should have at least 70 (seventy) characters',
    })
    .max(300, {
      message:
        'Your explanation should have at most 300 (three hundred) characters',
    }),
})

export async function action({request}: LoaderFunctionArgs) {
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
  const identifier = 'nominate'
  const {success} = await rateLimit.limit(identifier)
  if (!success) throw new Response('Exceeded the rate limit', {status: 429})

  // Save to database
  await db.insert(nominees).values(result.value)

  // Send email
  const {name, from, expertise, link, reason} = result.value
  const resend = new Resend(process.env.RESEND_API_KEY)
  const {error} = await resend.emails.send({
    from: process.env.RESEND_ADDRESS_SENDER,
    to: process.env.RESEND_ADDRESS_RECEIVER,
    subject: 'There is a new dev nomination!',
    react: (
      <div>
        <p>
          <b>Name:</b> {name}
        </p>
        <p>
          <b>From:</b> {from}
        </p>
        <p>
          <b>Expertise:</b> {expertise}
        </p>
        <p>
          <b>Link:</b> {link}
        </p>
        <p>
          <b>Reason:</b> {reason}
        </p>
      </div>
    ),
  })

  if (error) {
    return json(
      {
        status: 'error',
        result: result.reply({formErrors: [error.message]}),
      } as const,
      {status: 400},
    )
  }

  return json(
    {status: 'success' as const, result: result.reply({resetForm: true})},
    {status: 200},
  )
}

export default function Nominate() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'
  const showSpinner = useSpinDelay(submitting, {minDuration: 400})
  const [form, fields] = useForm({
    id: 'nominate-form',
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    onValidate({formData}) {
      return parseWithZod(formData, {schema})
    },
  })

  return (
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

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.name.id}>Name</Label>
          <Input {...getInputProps(fields.name, {type: 'text'})} autoFocus />
          <ErrorList id={fields.name.id} errors={fields.name.errors} />
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.link.id}>Link</Label>
          <Input {...getInputProps(fields.link, {type: 'text'})} />
          <ErrorList id={fields.link.id} errors={fields.link.errors} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.from.id}>From</Label>
          <Select
            {...getSelectProps(fields.from)}
            defaultValue={fields.from.initialValue}
          >
            <SelectTrigger className="w-full">
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

        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.expertise.id}>Expertise</Label>
          <Select
            {...getSelectProps(fields.expertise)}
            defaultValue={fields.expertise.initialValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an area of expertise" />
            </SelectTrigger>
            <SelectContent>
              {expertise.map(p => (
                <SelectItem key={p} value={p}>
                  {p}
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

      <div className="mb-4">
        <Label htmlFor={fields.reason.id}>
          Why do you want to nominate them?
        </Label>
        <Textarea {...getTextareaProps(fields.reason)} />
        <p className="text-sm text-muted-foreground">
          Your message will be copied to the support team.
        </p>
        <ErrorList id={fields.reason.id} errors={fields.reason.errors} />
      </div>

      <Button
        className="w-full"
        variant="default"
        type="submit"
        disabled={submitting || showSpinner}
      >
        {showSpinner ? <Loader2 className="mr-2 animate-spin" /> : null}
        Submit
      </Button>
    </Form>
  )
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        429: () => <p>You made too many submissions. Try again later!</p>,
      }}
    />
  )
}
