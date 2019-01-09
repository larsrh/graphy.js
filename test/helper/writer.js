/* eslint indent: 0, padded-blocks: 0 */
const expect = require('chai').expect;

const stream = require('@graphy/core.iso.stream');
const dataset_tree = require('@graphy/util.dataset.tree');

const graphy_reader_interface = require('../interface/content-reader.js');
const util = require('./util.js');

class writer_suite {
	constructor(gc_suite, f_suite) {
		let s_prefix_string = '';
		if(gc_suite.prefixes) {
			let h_prefixes = gc_suite.prefixes;
			for(let [s_prefix_id, p_iri] of Object.entries(h_prefixes)) {
				s_prefix_string += `@prefix ${s_prefix_id}: <${p_iri}> .\n`;
			}
		}

		Object.assign(this, {
			...gc_suite,
			prefix_string: s_prefix_string,
			package: `content.${gc_suite.alias}.read`,
		});

		describe(this.package, () => {
			f_suite(this);
		});
	}

	normalize(st_doc) {
		return stream.source(st_doc)
			// read document
			.pipe(this.validator())

			// canonicalize in dataset
			.pipe(dataset_tree({
				canonicalize: true,
			}))

			// serialize output
			.pipe(this.writer({
				prefixes: this.prefixes,
			}))

			// return accumulated result
			.bucket();
	}

	validates(h_tree) {
		util.map_tree(h_tree, (s_label, f_leaf) => {
			let {
				write: hcn_write,
				config: w_config={},
				validate: st_validate,
			} = f_leaf();

			it(s_label, async() => {
				// take concise-triples hash
				let st_output = await stream.source({
					type: this.type,
					value: hcn_write,
				})
					// pipe it thru turtle writer
					.pipe(this.writer({
						prefixes: this.prefixes,
						...w_config,
					}))

					// accumulate its output
					.bucket();

				// canonicalize output
				let st_result = await this.normalize(st_output);

				// canonicalize expectation
				let st_expect = await this.normalize(`
					${this.prefix_string}
					${st_validate}
				`);

				// assertion
				expect(st_result).to.equal(st_expect);
			});
		});
	}

	outputs(h_tree) {
		describe('output string', () => {
			util.map_tree(h_tree, (s_label, f_leaf) => {
				let {
					write: hcn_write,
					config: w_config={},
					output: st_expect,
				} = f_leaf();

				it(s_label, async() => {
					// take concise-triples hash
					let st_output = await stream.source({
						type: this.type,
						value: hcn_write,
					})
						// pipe it thru turtle writer
						.pipe(this.writer({
							prefixes: this.prefixes,
							...w_config,
						}))

						// accumulate its output and trim
						.bucket();

					// gobble expectation
					st_expect = util.gobble(st_expect).trim();

					// remove trailing whitespace from each line
					st_expect = st_expect.split(/\n/g).map(s => s.trimRight()).join('\n');
					st_output = st_output.trim().split(/\n/g).map(s => s.trimRight()).join('\n');

					// assertion
					expect(st_output).to.equal(st_expect);
				});
			});
		});
	}

	events(h_tree) {
		describe('emits ordered events', () => {
			util.map_tree(h_tree, (s_label, f_leaf) => {
				let {
					writes: a_writes,
					writer: f_writer=null,
					events: a_events_expect,
				} = f_leaf();

				it(s_label, (fke_test) => {
					let a_events_actual = [];
					let fk_validate = null;

					// create writer
					let ds_writer = this.writer();

					// callback
					if(f_writer) {
						f_writer(ds_writer, (fk_validator) => {
							fk_validate = fk_validator;
						});
					}

					// end called?
					let b_ended = false;

					// create validator
					let ds_validator = this.validator({
						eof() {
							// run validator callback?
							if(fk_validate) fk_validate();

							// check validator events
							expect(a_events_actual).to.have.lengthOf(a_events_expect.length);

							for(let i_event=0; i_event<a_events_actual.length; i_event++) {
								let [s_event_actual, a_event_args] = a_events_actual[i_event];
								let [s_event_expect, f_event_validate] = a_events_expect[i_event];

								// expect same event name
								expect(s_event_actual).to.equal(s_event_expect);

								// validate arguments
								f_event_validate(...a_event_args);
							}

							// end of queue
							setTimeout(() => {
								// end was not called
								if(!b_ended) console.warn(`\t${s_label}: 'end' was not emitted`);

								// done
								fke_test();
							}, 0);
						},

						error(e_read) {
							fke_test(e_read);
						},

						// why is this not being called?
						end() {
							b_ended = true;
						},
					});

					// each expected event type
					let as_events_bind = new Set(a_events_expect.map(a => a[0]));
					for(let s_event of as_events_bind) {
						// bind listener
						ds_validator.on(s_event, (...a_args) => {
							// push to actual event list
							a_events_actual.push([s_event, a_args]);
						});
					}

					// pipe writer to validator
					ds_writer.pipe(ds_validator);

					// write each writable data event
					for(let w_write of a_writes) {
						ds_writer.write(w_write);
					}

					// end stream
					ds_writer.end();
				});
			});
		});
	}
}

module.exports = function(...a_args) {
	return new writer_suite(...a_args);
};