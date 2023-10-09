import { GraphQLString } from 'graphql';
import EnergyTransactionType from '../types/EnergyTransactionType';
import transactionResolvers from '../resolvers/transactionResolvers';
import EnergyBlockType from '../types/EnergyBlockType';
import blockResolvers from '../resolvers/blockResolvers';

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
    },
    block: {
        type: () => EnergyBlockType,
        args: {
            hash: { type: GraphQLString },
            block_index: { type: GraphQLString },
        },
        resolve: (
            _: unknown, 
            args: { 
                hash: string,
                block_index: string
            }
        ) => blockResolvers.getBlock(args.hash, args.block_index)
    },
};

export default energyQueries;