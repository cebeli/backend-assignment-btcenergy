import client from "../clients/http/httpClient"
import redis from '../clients/cache/redis'
import Transaction from "../types/Transaction";
import mapTransaction from "../mappers/transactionMapper";
import logger from "../helpers/logger";

const cacheTimeInSeconds = parseInt(process.env.cachetimeinseconds || '18000')

const transactionResolvers = {
  getTransaction: async (hash: string, tx_index: string): Promise<Transaction> => {
    try {
      const cacheKey = `transaction:${hash || tx_index}`;
      const cachedTransactionData: string | null = await redis.get(cacheKey);

      if (cachedTransactionData) {
        logger.debug({message : `CACHE HIT! -> ${hash}`})
        const transaction: Transaction = JSON.parse(cachedTransactionData)
        return transaction
      }

      logger.debug({message : `FETCH HIT! -> ${hash}`})
      const transactionResponse = await client.get(`/rawtx/${hash || tx_index}`);
      const transaction: Transaction = mapTransaction(transactionResponse.data)

      await redis.setex(cacheKey, cacheTimeInSeconds, JSON.stringify(transaction));
      return transaction
    } catch (error) {
      logger.error({error})
      throw error
    }
  }
};

export default transactionResolvers;