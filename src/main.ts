import 'dotenv/config';
import { MyClient } from './client';

const client = new MyClient();

const main = async () => {
	await client.init();
	await client.login(process.env.TOKEN);
};

main().catch((error) => {
	client.logger.error('An unexpected error occured: ', error);
});
