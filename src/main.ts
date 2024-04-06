import dotenv from 'dotenv';
import { MyClient } from './client';

dotenv.config({
	path: `.env.${process.env.NODE_ENV ?? 'production'}`,
});

const client = new MyClient();

const main = async () => {
	await client.init();
	await client.login(process.env.TOKEN);
};

main().catch((error) => {
	client.logger.error('An unexpected error occured: ', error);
});
