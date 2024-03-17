import type {InferSelectModel} from 'drizzle-orm'
import {int, sqliteTable, text} from 'drizzle-orm/sqlite-core'

export const expertise = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'QA',
] as const

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
  id: int('id', {mode: 'number'}).primaryKey({autoIncrement: true}).notNull(),
  name: text('name').notNull(),
  from: text('from', {enum: provinces}).notNull(),
  expertise: text('expertise', {enum: expertise}).notNull(),
  link: text('link', {length: 200}).notNull(),
}

export const devs = sqliteTable('devs', commonColumns)
export const nominees = sqliteTable('nominees', commonColumns)
export const users = sqliteTable('users', {
  id: int('id', {mode: 'number'}).primaryKey({autoIncrement: true}).notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
})

export type DevTable = InferSelectModel<typeof devs>
