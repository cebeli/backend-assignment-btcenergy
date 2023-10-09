import client from "../clients/http/httpClient"
import redis from '../clients/cache/redis'
import mapWallet from "../mappers/walletMapper";
import logger from "../helpers/logger";
import Wallet from "../types/Wallet";

// wallet can be updated any moment so using a lot less cache time here.
const walletCache = 300

const walletResolvers = {
    getWallet: async (address: string): Promise<Wallet> => {
        try {
            const cacheKey = `wallet:${address}`;
            const cachedBlockData: string | null = await redis.get(cacheKey);

            if (cachedBlockData) {
                logger.debug({ message: `CACHE HIT! -> ${address}` })
                const wallet: Wallet = JSON.parse(cachedBlockData)
                return wallet;
            }

            logger.debug({ message: `FETCH HIT! -> ${address}` })
            const walletResponse = await client.get(`/rawaddr/${address}`)
            const wallet: Wallet = mapWallet(walletResponse.data);

            await redis.setex(cacheKey, walletCache, JSON.stringify(wallet));
            return wallet

        } catch (error) {
            logger.error({ error })
            throw error
        }
    }
};

export default walletResolvers;
