
const csv_parse = require('csv-parse');
const stream = require('@graphy/core.iso.stream');
const ttl_write = require('@graphy/content.ttl.write');

// a series of streams to pipe together (stream.pipeline is supported by node.js >= v10)
stream.pipeline(...[
	// read from standard input
	process.stdin,

	// parse string chunks from CSV into row objects
	csv_parse(),

	// transform each row
	new stream.Transform({
		// this transform both expects objects as input and outputs object
		objectMode: true,

		// each row
		transform(a_row, s_encoding, fk_transform) {
			// destructure row into cells
			let [s_id, s_name, s_likes] = a_row;

			// structure data into concise-triple hash
			fk_transform(null, {
				type: 'c3',
				value: {
					['demo:'+s_name]: {
						'foaf:name': '"'+s_name,
						'demo:id': parseInt(s_id),
						'demo:likes': s_likes.split(/\s+/g)
							.map(s => `demo:${s}`),
					},
				},
			});
		},
	}),

	// serialize each triple
	ttl_write({
		prefixes: {
			demo: 'http://ex.org/',
			foaf: 'http://xmlns.com/foaf/0.1/',
		},
	}),

	// write to standard output
	process.stdout,

	// listen for errors; throw them
	(e_stream) => {
		throw e_stream;
	},
]);
