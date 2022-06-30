import nc from 'next-connect';
import database from './database';

const all = nc();

all.use(database);

export default all;