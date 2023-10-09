import { SchemaComposer } from 'graphql-compose'
import helloQuery from './queries/helloQuery'

const schemaComposer = new SchemaComposer()

schemaComposer.Query.addFields(helloQuery)

export const schema = schemaComposer.buildSchema()
