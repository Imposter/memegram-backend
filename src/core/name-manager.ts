import * as fs from "fs";
import * as os from "os";
import * as log4js from "log4js";
import { getRandomInt } from "../utility/random";

const log = log4js.getLogger("NameManager");

export class NameManager {
	private static names: string[];

	public static initialize(file: string) {
		// Read file and words
		NameManager.names = fs.readFileSync(file).toString().split(os.EOL);
	}

	public static async getName(names?: string[]): Promise<string> {
		// Clone available names list
		var availableNames = NameManager.names.slice();

		// Create names list
		names = names || [];

		return new Promise<string>((resolve, reject) => {
			var name;
			while (availableNames.length > 0) {
				var currentName = availableNames[getRandomInt(0, availableNames.length - 1)];
				
				var index;
				if ((index = names.indexOf(currentName)) > -1) {
					availableNames = availableNames.splice(index, 1);
					continue;
				}

				name = currentName;
			}

			if (availableNames.length == 0) {
				reject(new Error("Unable to get available name"));
			} else {
				resolve(name);
			}
		});
	}
}