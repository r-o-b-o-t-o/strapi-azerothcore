import fetch from "node-fetch";
import { XMLParser } from "fast-xml-parser";
import * as htmlEntities from "html-entities";

import { ISoapSetings } from "../settingsService";

interface ICommandResult {
	result?: string;
	faultcode?: string;
	faultstring?: string;
	detail?: string;
}

export class SoapError extends Error {
	public constructor(message?: string) {
		super(message);
		this.name = "SoapError";
	}
}

export class SoapService {
	private username: string;
	private password: string;
	private host: string;
	private port: number;

	public constructor(settings: ISoapSetings) {
		this.username = settings.username;
		this.password = settings.password;
		this.host = settings.host;
		this.port = settings.port;
	}

	private async send(method: string, contents: string) {
		const xml = `<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ac="urn:AC">
				<soap:Body>
					<ac:${method}>
						${contents}
					</ac:${method}>
				</soap:Body>
			</soap:Envelope>`;

		const response = await fetch(`http://${this.host}:${this.port}/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/xml",
				Authorization: `Basic ${btoa(`${this.username}:${this.password}`)}`,
			},
			body: xml,
		});

		const parser = new XMLParser();
		const result = parser.parse(await response.text());
		const body = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];
		const obj = Object.values(body)[0] as ICommandResult;

		const format = (s: string) => htmlEntities.decode(s).trim();

		if (obj.faultstring) {
			throw new SoapError(format(obj.faultstring));
		}
		return format(obj.result ?? "");
	}

	public async executeCommand(command: string) {
		await this.send("executeCommand", `<command>${command}</command>`);
	}

	public async testConnection() {
		await this.executeCommand("server info");
		return true;
	}
}

export class SoapServiceBase {
	public readonly soap: SoapService;

	public constructor(soap: SoapService) {
		this.soap = soap;
	}
}
