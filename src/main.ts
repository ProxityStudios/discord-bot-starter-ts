import { MyClient } from './client';
import config from '../config.json';

const main = async () => {
	const client = new MyClient();
	await client.init();
	await client.login(config.token);
};

main().catch((error) => {
	console.error('An unexecpeted error occured: ', error);
});
