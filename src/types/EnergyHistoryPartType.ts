import { GraphQLObjectType, GraphQLInt, GraphQLList, GraphQLFloat } from 'graphql';
import EnergyBlockType from './EnergyBlockType';

const EnergyHistoryPartType = new GraphQLObjectType({
    name: 'HistoryPart',
    fields: () => ({
        day: { type: GraphQLInt },
        energyInKwH: { type: GraphQLFloat },
        blocks: { type: new GraphQLList(EnergyBlockType) },
    }),
});

export default EnergyHistoryPartType;
