import { GraphQLObjectType, GraphQLString, GraphQLList, GraphQLFloat } from 'graphql';
import EnergyTransactionType from './EnergyTransactionType';

const EnergyWalletType = new GraphQLObjectType({
    name: 'Wallet',
    fields: () => ({
        address: { type: GraphQLString },
        energyInKwH: { type: GraphQLFloat },
        tx: { type: new GraphQLList(EnergyTransactionType) }
    }),
});

export default EnergyWalletType;
