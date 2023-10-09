import { GraphQLString } from 'graphql';
import EnergyTransactionType from '../types/EnergyTransactionType';
import transactionResolvers from '../resolvers/transactionResolvers';

const energyQueries = {
    transaction: {
        type: () => EnergyTransactionType,
        args: {
            hash: { type: GraphQLString },
            tx_index: { type: GraphQLString },
        },
        resolve: (
            _: unknown, 
            args: { 
                hash: string,
                tx_index: string
            }
        ) => transactionResolvers.getTransaction(args.hash, args.tx_index)
    }
};

export default energyQueries;