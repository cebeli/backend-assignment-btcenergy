import { GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLFloat } from 'graphql';
import EnergyHistoryPartType from './EnergyHistoryPartType';

const EnergyHistoryType = new GraphQLObjectType({
    name: 'History',
    fields: () => ({
        periodInDays: { type: GraphQLInt },
        energyInKwH: { type: GraphQLFloat },
        days: { type: new GraphQLList(EnergyHistoryPartType) },
    })
});

export default EnergyHistoryType
