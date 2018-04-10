import * as fs from "fs";
import * as os from "os";
import { getConfig, Config } from "./config";
import { getRandomInt } from "./utility/random";

const NameLengthLimit = 15;
const IgnoreWords = [ "list" ];
const Config = getConfig();

function readFileWords(file: string): string[] {
	// Create result
	var result: string[] = [];

	// Read file and words
	var words = fs.readFileSync(file).toString().split(os.EOL);

	for (var word of words) {
		// Ignore comments
		if (word.charAt(0) == '#')
			continue;

		// Clean word
		word = word.trim();
		word = word.replace(/\w\S*/g, function (word) {
			return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
		});

		if (word.indexOf("(") > -1) {
			console.log(`Invalid word, skipping ${word}...`);
			continue;
		}

		result.push(word);
	}

	return result;
}

(function() {
	// Read words
	var adjectives = readFileWords("adjectives.txt");
	var nouns = readFileWords("nouns.txt");

	// Generate names
	console.log("Generating names...");

	// Create write stream
	var file = fs.createWriteStream(Config.app.namesFile);

	for (let adjective of adjectives) {
		for (let noun of nouns) {
			// Clean words
			var p1 = adjective.replace(/[^a-zA-Z]/g, "");
			var p2 = noun.replace(/[^a-zA-Z]/g, "");

			if (IgnoreWords.indexOf(p1.toLowerCase()) > -1
				|| IgnoreWords.indexOf(p2.toLowerCase()) > -1) {
				continue;
			}

			// Make name
			var name = p1 + p2;

			if (name.length > NameLengthLimit) {
				continue;
			}

			// Store name
			file.write(name + os.EOL);
		}
	}

	// Close file stream
	file.end();

	console.log("All done!");
})();