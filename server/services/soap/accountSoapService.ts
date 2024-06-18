import { SoapServiceBase } from "./soapService";

export class AccountSoapService extends SoapServiceBase {
	public async createAccount(username: string, password: string) {
		await this.soap.executeCommand(`account create ${username} ${password}`);
	}

	public async deleteAccount(username: string) {
		await this.soap.executeCommand(`account delete ${username}`);
	}
}
