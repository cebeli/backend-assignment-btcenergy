import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.redishost,
  port: parseInt(process.env.redisport || '6379')
});

export default redis
