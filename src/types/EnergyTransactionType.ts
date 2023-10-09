import { GraphQLObjectType, GraphQLString, GraphQLFloat } from 'graphql';

const EnergyTransactionType = new GraphQLObjectType({
  name: 'Transaction',
  fields: () => ({
    hash: { type: GraphQLString },
    tx_index: { type: GraphQLString },
    energyInKwH:  { type: GraphQLFloat }
  }),
});

export default EnergyTransactionType;