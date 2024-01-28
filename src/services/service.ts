import { CustomClient } from '../client';

export abstract class Service {
	protected client: CustomClient;

	constructor(client: CustomClient) {
		this.client = client;
	}

	public abstract init(): Promise<void>;

	public async onClientReady() {
		this.client.checkServices(this);
	}
}
