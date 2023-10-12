import logger from "../helpers/logger";
import moment, { Moment } from 'moment-timezone'
import BlockMeta from "../types/BlockMeta";
import client from "../clients/http/httpClient";
import historyMappers from "../mappers/historyMappers";
import Block from "../types/Block";
import blockResolvers from "./blockResolvers";
import HistoryPart from "../types/HistoryPart";
import History from "../types/History";
import { AxiosResponse } from 'axios'

const TIMEZONE = process.env.timezone || 'Europe/Amsterdam'
const DAY_IN_MILIS = 24 * 60 * 60 * 1000
const MAX_CONCURENCY = parseInt(process.env.maxcuncurency || '10')

const getDayStartInMilis = (time: Moment): number => time.startOf('day').valueOf()
const getBlockMetasForDay = (dayMilis: number): Promise<AxiosResponse> => client.get(`/blocks/${dayMilis}?format=json`)

/**
 * This function creates and array of Block data based on time field.
 * The order of the array reveals the order of the days, 
 * index 0 is today, index 1 is yesterday and so on.
 * 
 * This information is used to bundle Blocks into calendar days logic.
 * 
 * @param days number of days
 * @param now timestamp of the request
 * @param blockDatas Data from API call using corresponding block Metadata
 * @returns Array of Block Data, ordered for calendar day logic
 */
const spreadBlockDataIntoCalendarDays = (days: number, now: Moment, blockDatas: Array<Block>): Array<Array<Block>> => {
    const now_in_milis: number = now.valueOf()
    const dayStart_in_milis: number = getDayStartInMilis(now)

    // using seconds to filter
    let till: number = Math.floor(now_in_milis / 1000)
    let from: number = Math.floor(dayStart_in_milis / 1000)

    const blockDataCalendarSpread: Array<Array<Block>> = []
    for (let i = 1; i <= days; i++) {
        blockDataCalendarSpread.push(blockDatas.filter((item: Block) => from <= item.time && item.time < till))
        till = from
        from = from - (DAY_IN_MILIS / 1000) // using seconds to filter
    }
    return blockDataCalendarSpread
}

const createHistoryParts = async (days: number, now: Moment, blockDatas: Array<Block>): Promise<Array<HistoryPart>> => {
    const blockDataSpread: Array<Array<Block>> = spreadBlockDataIntoCalendarDays(days, now, blockDatas)
    const historyParts: Array<HistoryPart> = []
    for (let i = 0; i < blockDataSpread.length; i++) {
        // already sorted
        historyParts.push(historyMappers.mapHistoryPart(blockDataSpread[i], i + 1))
    }
    return historyParts
}

const getBlockDataBatch = async (blockMetaBatch: Array<BlockMeta>): Promise<Array<Block>> => {
    const promises: Array<Promise<Block>> = []
    for (let i = 0; i < blockMetaBatch.length; i++) {
        promises.push(blockResolvers.getBlock(blockMetaBatch[i].hash, ""))
    }
    const batchResponses: Array<Block> = await Promise.all(promises)
    return batchResponses.flat()
}

const getBlockDataFromMetaInBatches = async (blockMetas: Array<BlockMeta>): Promise<Array<Block>> => {
    const numberOfBatches = Math.ceil(blockMetas.length / MAX_CONCURENCY)
    const blockDatas: Array<Array<Block>> = []
    for (let i = 0; i < numberOfBatches; i++) {
        const blockMetaBatch: Array<BlockMeta> = blockMetas.splice(0, MAX_CONCURENCY)
        const blockDataBatch: Array<Block> = await getBlockDataBatch(blockMetaBatch)
        logger.debug({ message: `Batch ${i + 1}/${numberOfBatches} done` })
        blockDatas.push(blockDataBatch)
    }
    return blockDatas.flat()
}

const getBlockMetaBatch = async (schedule: Array<number>): Promise<Array<BlockMeta>> => {
    const promises: Array<Promise<AxiosResponse>> = []
    for (let i = 0; i < schedule.length; i++) {
        promises.push(getBlockMetasForDay(schedule[i]))
    }
    const batchResponses: Array<AxiosResponse> = await Promise.all(promises)
    return batchResponses.flatMap(br => br.data)
}

/**
 * @param callSchedules list of dates in miliseconds to perform data calls
 * @param days Number of days to get data for
 * @returns Array of Block metadata
 */
const getBlockMetasInBatches = async (callSchedules: Array<number>, days: number): Promise<Array<BlockMeta>> => {
    const numberOfBatches = Math.ceil((days + 1) / MAX_CONCURENCY) // days + 1 is for calendar day logic
    const blockMetaBatches: Array<Array<BlockMeta>> = []

    // to ignore extra blocks - api calls
    const lastDayStart: number = getDayStartInMilis(moment(callSchedules[callSchedules.length-1]).tz(TIMEZONE))

    for (let i = 1; i <= numberOfBatches; i++) {
        const batchOfSchedule: Array<number> = callSchedules.splice(0, MAX_CONCURENCY)
        const blockMetaBatch: Array<BlockMeta> = await getBlockMetaBatch(batchOfSchedule)
        blockMetaBatches.push(blockMetaBatch)
    }

    // flat, map and filter out extra metas so no api call is made for them
    const blockMetaMapped: Array<BlockMeta> = (blockMetaBatches.flat().map((item) => historyMappers.mapBlockMeta(item))).filter(item => item.time > (lastDayStart / 1000))
    return blockMetaMapped;
}


/**
 * calendar day logic is used in this function.
 * 
 * The api for getting Block Metadata returns data for the last 24 hours based on the given date formatted as epoc miliseconds
 * This function gets +1 days so block data from yesterday before call time alse returned.
 * Additional data that goes further back in time is filtered out in the next steps of this process
 * 
 * example:
 * if the api is called with 14:00 (formatted as miliseconds) the results will be between 14:00 today and 14:00 yesterday
 * This function will create dates for 1 additional day to also get data for 14:00 yesterday and 14:00 the day before yesterday
 * When api for Block Metadata called with the times generated by this function,
 * the result set will have all the confirmed block metada from yesterday and today plus some additionals from the day before yesterday
 * other steps in this process will filter the extra data out.
 * 
 * @param days number of days to get data for
 * @param now timestamp created at the begining of the api call, to be used in later steps
 * @returns Array of miliseconds
 */
const createBlockMetaCallSchedule = (days: number, now: Moment): Array<number> => {
    const NOW_IN_MILIS = now.valueOf()
    const schedule: Array<number> = []
    // days + 1 for calendar day logic
    for (let i = 0; i < days + 1; i++) {
        schedule.push(NOW_IN_MILIS - (i * DAY_IN_MILIS))
    }
    return schedule
}

const historyResolvers = {
    getHistory: async (days: number): Promise<History> => {
        try {
            const NOW: Moment = moment.tz(TIMEZONE)
            const metaCallSchedules: Array<number> = createBlockMetaCallSchedule(days, NOW)

            const blockMetas: Array<BlockMeta> = await getBlockMetasInBatches(metaCallSchedules, days)
            logger.debug({message: `Number of BlockMeta ${blockMetas.length}`})

            const blockDatas: Array<Block> = await getBlockDataFromMetaInBatches(blockMetas)
            logger.debug({message: `Number of BlockData ${blockDatas.length}`})

            const historyParts: Array<HistoryPart> = await createHistoryParts(days, NOW, blockDatas)

            const history: History = historyMappers.mapHistory(historyParts, days)
            return history
        } catch (error) {
            logger.error({ error })
            throw error
        }
    }
};

export default historyResolvers
