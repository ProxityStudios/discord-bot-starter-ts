import type { MyClient } from '../client';

export abstract class Service {
	protected client: MyClient;

	constructor(client: MyClient) {
		this.client = client;
	}

	public abstract init(): Promise<true | Error>;
}
