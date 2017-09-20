/* eslint-disable */
const serializer = require('../main/serializer.js');



class null_serializer extends serializer.human {
	constructor(h_config) {
		super(h_config, serializer.triples);

		let k_serializer = this;
		Object.assign(this, {
			new_graph: true,
			new_subject: true,
			new_predicate: true,
			old_nested: 0,

			shortcuts: {
				get a() {
					let h_prefixes = k_serializer.prefixes;
					for (let s_prefix_id in h_prefixes) {
						let p_prefix_iri = h_prefixes[s_prefix_id];
						if ('http://www.w3.org/1999/02/22-rdf-syntax-ns#' === p_prefix_iri) {
							return s_prefix_id + ':type';
						}
					}
					return '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
				},
			},
			n3_node: this.n3_node_terse,
			nested_blank_nodes: true,
			nest_open: n => '[\n' + '\t'.repeat(n + 1),
			nest_close: (n) => {
				// reset nest tracker
				this.old_nested = this.old_nested & ~(1 << n);
				return '\n' + '\t'.repeat(n) + ']'
			},
			indent: '\t',
		});

		// open prefixes
		this.n3t_prefixes();
	}

	from_term(h_term) {
		return h_term.terse();
	}

	pair(s_predicate, s_object, x_mask, n_nest_level = 0) {
		// same predicate
		if (x_mask & 1) {
			return `, ${s_object}`;
		}
		// new/change of predicate
		else {
			if (n_nest_level) {
				let s_open = '';

				// reuse?
				if ((this.old_nested >>> (n_nest_level - 1)) & 1) {
					s_open = ` ;\n${this.indent}${'\t'.repeat(n_nest_level)}`;
				}

				this.old_nested = this.old_nested | (1 << (n_nest_level - 1));

				return s_open + `${s_predicate} ${s_object}`;
			} else {
				let s_pair = (this.new_predicate ? '' : ` ;\n${this.indent}`) + `${s_predicate} ${s_object}`;
				this.new_predicate = false;
				this.old_nested = 0;
				return s_pair;
			}
		}
	}

	data(k_leaf, s_object, x_mask) {
		let s_write = '';


		// same subject
		if (x_mask & 2) {
			// same predicate
			if (x_mask & 1) {
				s_write = `, ${s_object}`;
			}
			// new/change of predicate
			else {
				s_write = this.pair(k_leaf.term, s_object);
			}
		}
		// change of subject
		else {
			this.new_predicate = true;
			s_write = (this.new_subject ? '' : ' .\n\n') + `${k_leaf.parent.term} ` + this.pair(k_leaf.term, s_object);
			this.new_subject = false;
		}


		// write output
		this.push(s_write);
	}

	close() {
		this.push(' .\n');
		this.push(null);
	}
};

module.exports = function(h_config) {
	return new null_serializer(h_config);
};