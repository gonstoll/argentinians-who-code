import {getFormProps, getInputProps, useForm} from '@conform-to/react'
import {getZodConstraint, parseWithZod} from '@conform-to/zod'
import type {ActionFunctionArgs} from '@remix-run/node'
import {
  Form,
  json,
  redirect,
  useActionData,
  useNavigation,
  useSearchParams,
  type MetaDescriptor,
} from '@remix-run/react'
import bcrypt from 'bcryptjs'
import {eq} from 'drizzle-orm'
import {AlertCircle, Loader2} from 'lucide-react'
import {z} from 'zod'
import {ErrorList} from '~/components/error-list'
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {Input} from '~/components/ui/input'
import {Label} from '~/components/ui/label'
import {db} from '~/db'
import {users} from '~/db/schema'
import {commitSession, getSession} from '~/utils/session.server'

export function meta(): Array<MetaDescriptor> {
  return [{title: 'AWC | Login'}]
}

export const schema = z.object({
  redirectTo: z.string().optional(),
  email: z
    .string({required_error: 'Email is required'})
    .email({message: 'Incorrect mail format'})
    .trim()
    .min(1, {message: 'Email is required'}),
  password: z
    .string({required_error: 'Password is required'})
    .trim()
    .min(1, {message: 'Password is required'}),
})

export async function action({request}: ActionFunctionArgs) {
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

  const {redirectTo, email, password} = result.value
  const user = await db.select().from(users).where(eq(users.email, email))
  if (!user.length) {
    return json(
      {
        status: 'error',
        result: result.reply({
          formErrors: ['Email or password are incorrect'],
        }),
      } as const,
      {status: 400},
    )
  }

  const isCorrectPassword = await bcrypt.compare(password, user[0].password)
  if (!isCorrectPassword) {
    return json(
      {
        status: 'error',
        result: result.reply({
          formErrors: ['Email or password are incorrect'],
        }),
      } as const,
      {status: 400},
    )
  }

  const session = await getSession()
  session.set('userId', String(user[0].id))
  return redirect(redirectTo ?? '/', {
    headers: {
      'set-cookie': await commitSession(session, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      }),
    },
  })
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const submitting = navigation.state === 'submitting'
  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(schema),
    lastResult: actionData?.result,
    onValidate({formData}) {
      return parseWithZod(formData, {schema})
    },
  })

  return (
    <div className="mx-auto w-full max-w-96">
      <Form method="POST" {...getFormProps(form)}>
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

        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get('redirectTo') ?? undefined}
        />

        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.email.id}>Email</Label>
          <Input {...getInputProps(fields.email, {type: 'email'})} autoFocus />
          <ErrorList id={fields.email.id} errors={fields.email.errors} />
        </div>
        <div className="mb-4 flex flex-col gap-2">
          <Label htmlFor={fields.password.id}>Password</Label>
          <Input {...getInputProps(fields.password, {type: 'password'})} />
          <ErrorList id={fields.password.id} errors={fields.password.errors} />
        </div>

        <Button
          className="w-full"
          variant="default"
          type="submit"
          disabled={submitting}
        >
          {submitting ? <Loader2 className="mr-2 animate-spin" /> : null}
          Login
        </Button>
      </Form>
    </div>
  )
}
