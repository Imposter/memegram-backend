import * as fs from "fs";
import * as os from "os";
import { getRandomInt } from "./utility/random";

const NameLengthLimit = 15;
const IgnoreWords = [ "list" ];

enum WordType {
	Noun,
	Adjective
}

interface Word {
	word: string;
	type: WordType;
}

function readFileWords(file: string, wordType: WordType): Word[] {
	// Create result
	var result: Word[] = [];

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

		result.push(<Word>{
			word: word,
			type: wordType
		});
	}

	return result;
}

(function() {
	console.log("Please be patient, this process can take up to several minutes...");

	// Read words
	var words = readFileWords("adjectives.txt", WordType.Adjective);
	words = words.concat(readFileWords("nouns.txt", WordType.Noun));

	// Generate names
	console.log("Generating names...");

	// Create write stream
	var file = fs.createWriteStream("names.txt");
	
	// Get adjectives and nouns
	var adjectives = words.filter(word => word.type == WordType.Adjective);
	var nouns = words.filter(word => word.type == WordType.Noun);

	for (let adjective of adjectives) {
		for (let noun of nouns) {
			// Clean words
			var p1 = adjective.word.replace(/[^a-zA-Z]/g, "");
			var p2 = noun.word.replace(/[^a-zA-Z]/g, "");

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