import {json, type LoaderFunctionArgs} from '@remix-run/node'
import {Form} from '@remix-run/react'
import {Resend} from 'resend'
import {z} from 'zod'
import {Button} from '~/components/ui/button'

const resend = new Resend(process.env.RESEND_API_KEY)
const expertise = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'QA',
] as const
const provinces = [
  'Buenos Aires',
  'Buenos Aires Capital Federal',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquen',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luís',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const
const schema = z.object({
  name: z
    .string({required_error: 'Name is required'})
    .min(1, {message: 'Name should have at least 2 (two) characters'})
    .max(100, {message: 'Name should have at most 100 (hundred) characters'}),
  from: z.enum(provinces, {required_error: 'Please select a province'}),
  expertise: z.enum(expertise, {
    required_error: 'Please select an area of expertise',
  }),
  link: z
    .string({required_error: 'Please provide a link'})
    .url({message: 'Invalid URL'}),
})

export async function action({request}: LoaderFunctionArgs) {
  // const formData = await request.formData()
  const {data, error} = await resend.emails.send({
    from: process.env.RESEND_ADDRESS_SENDER,
    to: process.env.RESEND_ADDRESS_RECEIVER,
    subject: 'New nomination!',
    react: <p>Hey!</p>,
  })
  if (error) {
    return json({error}, {status: 400})
  }
  return json({data})
}

export default function Nominate() {
  return (
    <Form method="POST">
      <p className="font-mono">Hello</p>
      <Button type="submit">Submit</Button>
    </Form>
  )
}
