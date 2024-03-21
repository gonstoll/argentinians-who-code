import {sql, type InferSelectModel} from 'drizzle-orm'
import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core'

export const expertise = ['frontend', 'backend', 'fullstack', 'qa'] as const
export const provinces = [
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

const commonColumns = {
  id: integer('id', {mode: 'number'})
    .primaryKey({autoIncrement: true})
    .notNull(),
  name: text('name').notNull(),
  from: text('from', {enum: provinces}).notNull(),
  expertise: text('expertise', {enum: expertise}).notNull(),
  link: text('link', {length: 200}).notNull(),
  reason: text('reason', {length: 300}).notNull(),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
}

export const devs = sqliteTable('devs', commonColumns)
export const nominees = sqliteTable('nominees', commonColumns)
export const users = sqliteTable('users', {
  id: integer('id', {mode: 'number'})
    .primaryKey({autoIncrement: true})
    .notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
})

export type Dev = InferSelectModel<typeof devs>
export type Nominee = InferSelectModel<typeof nominees>
export type Expertise = (typeof expertise)[number]
