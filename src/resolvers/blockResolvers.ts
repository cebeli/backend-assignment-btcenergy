import client from "../clients/http/httpClient"
import redis from '../clients/cache/redis'
import Block from "../types/Block";
import mapBlock from "../mappers/blockMapper";
import logger from "../helpers/logger"

const cacheTimeInSeconds = parseInt(process.env.cachetimeinseconds || '18000')

const blockResolvers = {
  getBlock: async (hash: string, block_index: string | null): Promise<Block> => {
    try {
      const cacheKey = `block:${hash || block_index}`;
      const cachedBlockData: string | null = await redis.get(cacheKey);

      if (cachedBlockData) {
        logger.debug({message : `CACHE HIT! -> ${hash}`})
        const block: Block = JSON.parse(cachedBlockData)
        return block;
      }

      logger.debug({message : `FETCH HIT! -> ${hash}`})
      const blockResponse = await client.get(`/rawblock/${hash || block_index}`)
      const block: Block = mapBlock(blockResponse.data);

      await redis.setex(cacheKey, cacheTimeInSeconds, JSON.stringify(block));
      return block

    } catch (error) {
      logger.error({error})
      throw error
    }
  }
};


export default blockResolvers;
