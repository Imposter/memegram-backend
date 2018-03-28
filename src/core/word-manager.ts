import * as fs from "fs";
import * as os from "os";
import * as log4js from "log4js";
import { getRandomInt } from "../utility/random";

const log = log4js.getLogger("WordManager");

export enum WordType {
	Noun,
	Adjective
}

export interface Word {
	word: string;
	type: WordType;
}

export class WordManager {
	private static words: Word[];

	public static initialize() {
		WordManager.words = [];
	}

	public static readFile(file: string, wordType: WordType) {
		// Create list
		WordManager.words = WordManager.words || [];

		// Read file and words
		var words = fs.readFileSync(file).toString().split(os.EOL);

		for (var word of words) {
			// Clean word
			word = word.trim();
			word = word.replace(/\w\S*/g, function (word) {
				return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
			});

			if (word.indexOf("(") > -1) {
				log.info(`Invalid word, skipping ${word}...`);
				continue;
			}

			WordManager.words.push(<Word>{
				word: word,
				type: wordType
			});
		}
	}

	public static getDescriptiveWordSequence(sequences?: string[]) {
		// Create sequence list
		sequences = sequences || [];

		var sequence;
		do {
			// Get random first word
			var adjectives = WordManager.words.filter(word => word.type == WordType.Adjective);
			var adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
			var p1 = adjective.word.replace(/\s/g, "");

			// Get random second word
			var nouns = WordManager.words.filter(word => word.type == WordType.Noun);
			var noun = nouns[getRandomInt(0, nouns.length - 1)];
			var p2 = noun.word.replace(/\s/g, "");

			// Make sequence
			sequence = p1 + p2;
		} while(!sequence || sequences.indexOf(sequence) > -1);

		return sequence;
	}
}