
const factory = require('@graphy-dev/core.data.factory');
const ttl_write = require('@graphy-dev/content.ttl.write');

let y_writer = ttl_write({
	prefixes: {
		demo: 'http://ex.org/',
		dbo: 'http://dbpedia.org/ontology/',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	},
});

y_writer.pipe(process.stdout);

y_writer.write({
	type: 'c3',
	value: {
		[factory.comment()]: 'this is a comment',
		'demo:Banana': {
			a: 'dbo:Fruit',
			[factory.comment()]: 'so is this...',
			'rdfs:label': '@en"Banana',
		},
	},
});

y_writer.end();