import configJSON from '../config.json';

//  TODO: use env
const config: {
	token: string;
	applicationID: string;
	guildID: string;
} = configJSON as any;
export default config;
