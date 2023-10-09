import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat } from 'graphql';
import EnergyTransactionType from './EnergyTransactionType';

const EnergyBlockType = new GraphQLObjectType({
  name: 'Block',
  fields: () => ({
    hash: { type: GraphQLString },
    block_index: { type: GraphQLString },
    energyInKwH:  { type: GraphQLFloat },
    tx: { type: new GraphQLList(EnergyTransactionType) }
  }),
});

export default EnergyBlockType;
