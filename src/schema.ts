import { SchemaComposer } from 'graphql-compose'
import helloQuery from './queries/helloQuery'
import energyQueries from './queries/energyQueries'

const schemaComposer = new SchemaComposer()

schemaComposer.Query.addFields(helloQuery)
schemaComposer.Query.addFields(energyQueries)

export const schema = schemaComposer.buildSchema()
