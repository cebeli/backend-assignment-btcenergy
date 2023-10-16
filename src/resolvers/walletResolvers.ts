import client from "../clients/http/httpClient"
import redis from '../clients/cache/redis'
import mapWallet from "../mappers/walletMapper";
import logger from "../helpers/logger";
import Wallet from "../types/Wallet";
import { AxiosResponse } from 'axios'
import utils from '../helpers/utils'

// wallet can be updated any moment so using a lot less cache time here.
const walletCache = 60
const defaultLimit = 20
const rateLimitInSeconds = 10

const callWalletApiWithPagination = (address:string, limit: number, offset: number): Promise<AxiosResponse>  => client.get(`/rawaddr/${address}?limit=${limit}&offset=${offset}`)

const collectWalletTxs = async (address:string, limit: number, offset: number, result: AxiosResponse): Promise<AxiosResponse> => {
    if(result.data.n_tx <= (offset + limit)) {
        return result
    }
    
    logger.debug({message: `Waiting ${rateLimitInSeconds} seconds for rate limit`})
    await utils.delay(rateLimitInSeconds * 1000)

    offset += limit
    logger.debug({message: `calling /rawaddr/${address}?limit=${limit}&offset=${offset}`})
    const response: AxiosResponse = await callWalletApiWithPagination(address, limit, offset)

    result.data.txs.push(...response.data.txs)

    return await collectWalletTxs(address, limit, offset, result)
}

const getWalletData = async (address: string, offset:number, limit:number): Promise<AxiosResponse> => {
    logger.debug({message: `calling /rawaddr/${address}?limit=${limit}&offset=${offset}`})
    const walletResponse: AxiosResponse = await callWalletApiWithPagination(address, limit, offset)
    return await collectWalletTxs(address, limit, offset, walletResponse)
}

// const getWalledDataWithPagination = async (address: string): Promise<AxiosResponse> => {
//     let offset: number = 0
//     const walletResponse: AxiosResponse = await client.get(`/rawaddr/${address}?limit=${defaultLimit}`)
//     const numberOfBatches: number = Math.ceil((walletResponse.data).n_tx / defaultLimit) - 1 // firs call already made above
//     const promises: Array<Promise<AxiosResponse>> = []
//     for(let i = 0; i < numberOfBatches; i++) {
//         offset += defaultLimit
//         logger.debug({message: `Waiting ${rateLimitInSeconds} seconds for rate limit`})
//         await utils.delay(rateLimitInSeconds * 1000)
//         logger.debug({message: `calling /rawaddr/${address}?limit=${defaultLimit}&offset=${offset}`})
//         promises.push(client.get(`/rawaddr/${address}?limit=${defaultLimit}&offset=${offset}`))
//         logger.debug({message: `Got wallet txs part ${i+1}/${numberOfBatches + 1}`})
//     }
//     const promiseResponses: Array<AxiosResponse> = await Promise.all(promises)
//     const walletResponseWithTxsPagination: AxiosResponse = walletResponse
//     promiseResponses.forEach((response):AxiosResponse => walletResponseWithTxsPagination.data.txs.push(...response.data.txs) )
//     return walletResponseWithTxsPagination
// }

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
            const walletResponse: AxiosResponse = await getWalletData(address, 0, defaultLimit)
            // const walletResponse: AxiosResponse = await getWalledDataWithPagination(address)
            
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
