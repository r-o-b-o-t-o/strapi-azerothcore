import { SoapServiceBase } from "./soapService";

export class MailSoapService extends SoapServiceBase {
	public async sendMail(characterName: string, subject: string, text?: string) {
		await this.soap.executeCommand(
			`send mail ${characterName} \"${this.replaceQuotes(subject ?? "")}\" \"${this.replaceQuotes(text ?? "")}\"`
		);
	}
	public async sendMoney(characterName: string, amount: number, subject: string, text?: string) {
		if (typeof amount !== "number") {
			amount = parseInt(amount);
		}
		if (!amount) {
			return;
		}
		await this.soap.executeCommand(
			`send money ${characterName} \"${this.replaceQuotes(subject ?? "")}\" \"${this.replaceQuotes(text ?? "")}\" ${amount}`
		);
	}

	public async sendItems(
		characterName: string,
		items: { itemId: number; count?: number }[],
		subject: string,
		text?: string
	) {
		const itemsStr = items.map((obj) => `${obj.itemId}:${obj.count ?? 1}`).join(" ");
		await this.soap.executeCommand(
			`send items ${characterName} \"${this.replaceQuotes(subject ?? "")}\" \"${this.replaceQuotes(text ?? "")}\" ${itemsStr}`
		);
	}

	private replaceQuotes(text: string): string {
		return text.replace(/"/g, `\\"`);
	}
}
