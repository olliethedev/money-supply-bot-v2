import nc from 'next-connect';
import database from './database';

const handler = nc();

handler.use(database);

export default handler;
