

















# [« Home](https://graphy.link/) / Command Line Interface

<div class="larger">
  This document describes the command-line interface for the binary <code>graphy</code> available from npm.
</div>

### `npm i -g graphy`

<div class="larger">
  <a href="cli.examples">See some examples here.</a>
</div>

<br />
## Internal Pipeline
The `graphy` CLI works by pushing RDF data through a series of [internal transforms](#commands), starting with a single input on `stdin` (or instead, [multiple inputs](#inputs)) and ending with a single output on `stdout`. This internal pipeline feature allows for efficient, high-bandwidth transformations of RDF data.


### `Usage:  graphy [OPTIONS] COMMAND [ / COMMAND]* [--inputs FILE...]`

**Table of Contents:**
 - Input/Output Commands:
   - [`read`](#command_read) -- Deserialize RDF content in a single thread
   - [`scan`](#command_scan) -- Deserialize RDF content using multiple threads
   - [`scribe`](#command_scribe) -- Serialize RDF content fast
   - [`write`](#command_write) -- Serialize RDF content in style (pretty-printing)

 - Quad Manipulation Commands:
   - [`skip`](#command_skip) -- Skip over some amount of quads in the stream(s)
   - [`head`](#command_head) -- Limit number of quads from top of stream(s)
   - [`tail`](#command_tail) -- Limit number of quads from bottom of stream(s)
   - [`filter`](#command_filter) -- Filter quads in the stream(s) via expression
   - [`transform`](#command_transform) -- Apply a custom transform function to each quad in the stream(s)

 - Stream Control Commands:
   - [`concat`](#command_concat) -- Join stream data in order via concatentation
   - [`merge`](#command_merge) -- Join stream data on a 'first come, first serve' basis

 - Dataset Commands:
   - [`tree`](#command_tree) -- Put all quads into a tree data structure to remove duplicates
   - [`canonical`](#command_canonical) -- Canonicalize a set of quads using RDF Dataset Normalization Algorithm (URDNA2015) [alias: canonicalize]
   - [`union`](#command_union) -- Compute the set union of 1 or more inputs
   - [`intersect`](#command_intersect) -- Compute the set intersection of 1 or more inputs [alias: intersection]
   - [`diff`](#command_diff) -- Compute the set difference between 2 inputs [alias: difference]
   - [`minus`](#command_minus) -- Subtract the second input from the first: A - B [alias: subtraction]
   - [`equals`](#command_equals) -- Test if 2 inputs are equivalent [alias: equal]
   - [`disjoint`](#command_disjoint) -- Test if 2 inputs are completely disjoint from one another
   - [`contains`](#command_contains) -- Test if the first input completely contains the second [alias: contain]

 - Statistics Commands:
   - [`count`](#command_count) -- Count the number of events
   - [`distinct`](#command_distinct) -- Count the number of distinct things

 - Graphy Commands:
   - [`examples`](#command_examples) -- Alias for `$ graphy --examples`
   - [`help`](#command_help) -- Alias for `$graphy --help`
   - [`version`](#command_version) -- Alias for `$graphy --help`

 - [Options](#options):
   - `-e, --examples` -- Print some examples and exit
   - `-h, --help` -- Print a help message and exit
   - `-v, --version` -- Print the version info and exit

 - [More Options](#options):
   - `--show-stack-trace` -- Show the stack trace when printing error messages

<br />

## Commands

<a name="command_read" />

### [`read`](#command_read)` [OPTIONS]`
Read RDF content, i.e., deserialize it.

**Stream Multiplicity:**
 - `N-to-N<string, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of utf-8 encoded strings into 1 or more output streams of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - Content Selector Options:
   - `-c, --content-type` -- either an RDF Content-Type or format selector (defaults to 'trig').
 - `-b, --base, --base-uri` -- sets the starting base URI for the RDF document, [see more here](content.textual#config_read-no-input).
 - `-r, --relax` -- relax validation of tokens for trusted input sources to improve read speeds, [see more here](content.textual#config_read-no-input).

_Examples:_
   ```bash
   # validate an N-Triples document
   $ graphy read -c nt < input.nt > /dev/null

   # print line-delimited JSON of quads in N-Quads document
   $ graphy read -c nq < input.nq

   # validate a Turtle document
   $ graphy read -c ttl < input.ttl > /dev/null

   # print line-delimited JSON of quads in TriG document while validating it
   $ graphy read -c trig < input.trig
   ```

<a name="command_scan" />

### [`scan`](#command_scan)` [OPTIONS]`
Scan RDF content, i.e., deserialize it and do stuff using multiple threads.

> EXPERIMENTAL! The `scan` verb is currently experimental.

**Stream Multiplicity:**
 - `N-to-N<string, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of utf-8 encoded strings into 1 or more output streams of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - Content Selector Options:
   - `-c, --content-type` -- either an RDF Content-Type or format selector (defaults to 'trig').
 - Read Options:
   - `-r, --relax` -- relax validation of tokens for trusted input sources to improve read speeds, [see more here](content.textual#config_scan-no-input).
 - Scan Options:
   - `--threads` -- manually set the total number of threads to use (including the main thread).

_Examples:_
   ```bash
   # validate an N-Triples document
   $ graphy scan -c nt < input.nt > /dev/null

   # print line-delimited JSON of quads in N-Quads document
   $ graphy scan -c nq < input.nq

   # count the number of statements in an N-Triples document (bypass validation)
   $ graphy scan -c nt --realx / count < input.nt

   # convert an N-Triples document into Turtle
   $ graphy scan -c nt / scribe -c ttl < input.nt > output.ttl
   ```


<a name="command_scribe" />

### [`scribe`](#command_scribe)` [OPTIONS]`
Scribe RDF content, i.e., serialize it, fast (and possibly ugly).

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, string>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of utf-8 encoded strings.

**Options:**
 - Content Selector Options:
   - `-c, --content-type` -- either an RDF Content-Type or format selector (defaults to 'trig').

_Examples:_
   ```bash
   # convert a Turtle document into N-Triples
   $ cat input.ttl | graphy read -c ttl / scribe -c nt > output.nt

   # convert a TriG document into N-Quads
   $ cat input.trig | graphy read -c trig / scribe -c nq > output.nq

   # convert an N-Triples document into Turtle
   $ cat input.nt | graphy read -c nt / scribe -c ttl > output.ttl

   # convert an N-Quads document into TriG
   $ cat input.nq | graphy read -c nq / scribe -c trig > output.trig

   # convert an N-Triples document into RDF/XML
   $ cat input.nq | graphy read -c nt / scribe -c xml > output.rdf
   ```


<a name="command_write" />

### [`write`](#command_write)` [OPTIONS]`
Write RDF content, i.e., serialize it, in style (pretty-print).

> NOTE: If no serialization format is specified with the `-c` option, the output format will default to TriG with the simplified default graph option enabled, meaning that the output will also be Turtle-compatible if all quads written belong to the default graph.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, string>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of utf-8 encoded strings.

**Options:**
 - Content Selector Options:
   - `-c, --content-type` -- either an RDF Content-Type or format selector (defaults to 'trig').
 - Style Options:
   - `-i, --indent` -- sets the whitespace string to use for indentation. Writers use `'\t'` by default.
   - `-g, --graph-keyword` -- sets the string to use when serializing the optional `'GRAPH'` keyword in TriG. Writers omit this keyword by default. Using this flag as a boolean (i.e., by passing `'true'` or nothing) is shorthand for the all-caps `'GRAPH'` keyword.
   - `-s, --simplify-default-graph` --- if enabled, omits serializing the surrounding optional graph block for the default graph in TriG.
 - List Structure Options:
   - `-f, --first` -- c1 string: sets the predicate to use for the 'first' relation when serializing list structures.
   - `-r, --rest` -- c1 string: sets the predicate to use for the 'rest' relation when serializing list structures.
   - `-n, --nil` -- c1 string: sets the predicate to use for the 'nil' relation when serializing list structures.

_Examples:_
   ```bash
   # convert a Turtle document into N-Triples
   $ cat input.ttl | graphy read -c ttl / write -c nt > output.nt

   # convert a TriG document into N-Quads
   $ cat input.trig | graphy read -c trig / write -c nq > output.nq

   # convert an N-Triples document into Turtle
   $ cat input.nt | graphy read -c nt / write -c ttl > output.ttl

   # convert an N-Triples document into Turtle (equivalent to above)
   $ cat input.nt | graphy read -c nt / write > output.trig

   # convert an N-Quads document into TriG
   $ cat input.nq | graphy read -c nq / write -c trig > output.trig

   # convert an N-Quads document into TriG (equivalent to above)
   $ cat input.nq | graphy read -c nq / write > output.trig
   ```


<a name="command_skip" />

### [`skip`](#command_skip)` [size=1] [OPTIONS]`
Skip over some amount of data (quads by default) for each input stream before piping the remainder as usual.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

**Arguments:**
 - `size` -- the number of things to skip

**Options:**
 - `-q, --quads, -t, --triples` -- skip the given number of quads
 - `-s, --subjects` -- skip quads until the given number of distinct subjects have been encountered


_Examples:_
   ```bash
   # skip the first 1 million quads
   $ graphy read / skip 1e6 / write < in.ttl > out.ttl

   # skip the first 50 subjects
   $ graphy read / skip 50 --subjects / write < in.ttl > out.ttl
   ```


<a name="command_head" />

### [`head`](#command_head)` [size=1] [OPTIONS]`
Limit the number of quads that pass through by counting from the top of the stream.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

**Arguments:**
 - `size` -- the number of things to emit

**Options:**
 - `-q, --quads, -t, --triples` -- emit only the given number of quads from the top of a stream
 - `-s, --subjects` -- emit quads until the given number of distinct subjects have been encountered from the top of a stream


_Examples:_
   ```bash
   # skim the first 1 million quads from the top
   $ graphy read / head 1e6 / write < in.ttl > out.ttl

   # skim the first 50 subjects from the top
   $ graphy read / head 50 --subjects / write < in.ttl > out.ttl
   ```


<a name="command_tail" />

### [`tail`](#command_skip)` [size=1] [OPTIONS]`
Limit the number of quads that pass through by counting from the bottom of the stream.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

**Arguments:**
 - `size` -- the number of things to emit

**Options:**
 - `-q, --quads, -t, --triples` -- emit only the given number of quads from the bottom of a stream
 - `-s, --subjects` -- emit quads contained by the given number of distinct subjects from the bottom of a stream 


_Examples:_
   ```bash
   # tail the last 1 million quads
   $ graphy read / tail 1e6 / write < in.ttl > out.ttl

   # tail the last 50 subjects
   $ graphy read / tail 50 --subjects / write < in.ttl > out.ttl
   ```


<a name="command_filter" />

### [`filter`](#command_filter)` [OPTIONS]`
Filter quads using either a [Quad Filter Expression](quad-filter-expressions) or JavaScript expression.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

**Options:**
 - `-x, --expression` -- filter quads using the given [Quad Filter Expression](quad-filter-expressions)
 - `-j, --javascript` -- filter quads using the given JavaScript expression which will be evaluated as a callback function passed the quad and current prefix map as arguments


_Examples:_
   ```bash
   # filter by subject: 'dbr:Banana_split' using prefix mappings embedded in document
   $ curl http://dbpedia.org/data/Banana.ttl | graphy read / filter -x 'dbr:Banana_split'

   # filter by predicate: 'rdf:type' alias
   $ curl http://dbpedia.org/data/Banana.ttl | graphy read / filter -x '; a'

   # select quads that *do not have* the predicate: 'owl:sameAs' _nor_ `dbo:wikiPageRedirects`
   $ curl http://dbpedia.org/data/Banana.ttl | graphy read / filter -x '; !(owl:sameAs or dbo:wikiPageRedirects)'

   # filter by object: '"Banana"@en'
   $ curl http://dbpedia.org/data/Banana.ttl | graphy read / filter -x ';; "Banana"@en'

   # filter by graph using absolute IRI ref
   $ curl http://dbpedia.org/data/Banana.ttl | graphy read / filter -x ';;; <http://ex.org/some-absolute-graph-iri>'
   ```


<a name="command_transform" />

### [`transform`](#command_transform)` [OPTIONS]`
Apply a custom transform function to each quad in the stream(s). Notice that for each quad that the transform function is applied to, it may yield zero, one, or many quads as output (i.e., the function is one-to-many).

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

**Options:**
 - `-j, --javascript` -- transform quads using the given JavaScript expression which will be evaluated as a callback function passed the quad and current prefix map as arguments

The callback function has the signature: `callback(ConvenientQuad, hash<PrefixID, IriString>)`
Where `ConvenientQuad extends `[`Quad`](core.data.factory#class_quad) with the following properties:
 - `.s` -- shorthand for the `.subject` property
 - `.p` -- shorthand for the `.predicate` property
 - `.o` -- shorthand for the `.object` property
 - `.g` -- shorthand for the `.graph` property

The callback return value can be any of the following types:
 - `null`, `undefined`, `false` or otherwise falsy (e.g., `0`, empty string, etc.) -- ignore this quad
 - `Array<SomeTerm>` -- with the subject at position `[0]`, the predicate at position `[1]`, the object at position `[2]` and optionally the graph at position `[3]`.
    - Where `SomeTerm` is either an [`AnyTerm`](core.data.factory#interface_any-term) or a [`#string/c1`](concise#string_c1).
 - [`Quad`](core.data.factory#class_quad) -- simply a quad object
 - `WritableDataEvent<`[`#hash/c3`](https://graphy.link/concise#hash_c3)` | `[`#hash/c4>`](https://graphy.link/concise#hash_c4)`>` -- using the function identifier `c3()` or `c4()` (defined for you in the upper-scope) to wrap the return value
 - `#string/trig` -- return any valid TriG string (which is also a superset of N-Triples, N-Quads, and Turtle)

_Examples:_
   ```bash
   # materialize the inverse owl:sameAs relations
   $ graphy read / filter -x '; owl:sameAs' / transform -j 't => [t.o, t.p, t.s]'

   # reify all statements
   $ graphy read / transform -j 'triple => c3({
       [">http://demo.org/"+factory.hash(triple)]: {
           a: "rdf:Statement",
           "rdf:subject": triple.subject,
           "rdf:predicate": triple.predicate,
           "rdf:object": triple.object,
       },
     })' / write
   ```


<a name="command_concat" />

### [`concat`](#command_concat)
Concatenate quads from all input streams in order.

**Stream Multiplicity:**
 - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **reduces** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.


<a name="command_merge" />

### [`merge`](#command_merge)
Merge quads from all input streams without order.

**Stream Multiplicity:**
 - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **reduces** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.


<a name="command_tree" />

### [`tree`](#command_tree)
Puts all quads thru a tree data structure to remove duplicates.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).


<a name="command_canonical" />

### [`canonical`](#command_canonical)
Puts all quads thru a tree data structure to remove duplicates.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s).

_Example:_
   ```bash
   # canonicalize 
   $ graphy read -c ttl / canonical / write -c ttl   \
       < input.ttl                                   \
       > output.ttl
   ```




<a name="command_union" />

### [`union`](#command_union)` [OPTIONS]`
Compute the union of all inputs.

**Stream Multiplicity:**
 - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **reduces** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

 _Example:_
   ```bash
   # perform a union on all *.ttl files inside `data/` directory
   $ graphy read -c ttl / union / write -c ttl   \
       --inputs input/*.ttl                      \
       > union.ttl
   ```


<a name="command_intersect" />

### [`intersect`](#command_intersect)` [OPTIONS]`
Performs the intersection of all inputs.

> `intersection` is also an alias

**Stream Multiplicity:**
 - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **reduces** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

 _Example:_
   ```bash
   # perform an intersection on all *.ttl files inside `data/` directory
   $ graphy read -c ttl / intersect / write -c ttl   \
       --inputs input/*.ttl                          \
       > intersection.ttl
   ```


<a name="command_diff" />

### [`diff`](#command_diff)` [OPTIONS]`
Compute the difference between the two inputs.

> `difference` is also an alias

**Stream Multiplicity:**
 - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **joins** exactly 2 input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

_Example:_
   ```bash
   # compute the isomorphic difference between two files
   $ graphy read -c ttl / diff / write -c ttl   \
       --inputs a.ttl b.ttl                     \
       > canonical-difference.ttl
   ```


<a name="command_minus" />

### [`minus`](#command_minus)` [OPTIONS]`
Subtracts the second input from the first.

> `subtract` and `subtraction` are also aliases

**Stream Multiplicity:**
 - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`QuadStream`](#class_quad-stream)`>` -- **joins** exactly 2 input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of [Quad](core.data.factory#class_quad) objects.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

_Example:_
   ```bash
   # subtract `input/dead.ttl` from `union.ttl`
   $ graphy read -c ttl / minus / write -c ttl   \
       --inputs  union.ttl  input/dead.ttl       \
       > leftover.ttl
   ```


<a name="command_equals" />

### [`equals`](#command_equals)` [OPTIONS]`
Tests for equality between the two inputs.

> `equal` is also an alias

**Stream Multiplicity:**
 - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`ResultValueStream<Boolean>`](#class_result-value-stream)`>` -- **joins** exactly 2 input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of a single `boolean` value.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

_Example:_
   ```bash
   # test if `before.ttl` and `after.ttl` are strictly equal
   $ graphy read -c ttl / equals --strict   \
       --inputs before.ttl after.ttl

   # test if `before.ttl` and `after.ttl` are isomorphically equivalent
   $ graphy read -c ttl / equals   \
       --inputs before.ttl after.ttl
   ```


<a name="command_disjoint" />

### [`disjoint`](#command_disjoint)` [OPTIONS]`
Tests for disjointess between the two inputs.

**Stream Multiplicity:**
 - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`ResultValueStream<Boolean>`](#class_result-value-stream)`>` -- **joins** exactly 2 input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of a single `boolean` value.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

_Example:_
   ```bash
   # test if `apples.ttl` and `oranges.ttl` are strictly disjoint
   $ graphy read -c ttl / disjoint --strict   \
       --inputs apples.ttl oranges.ttl
   ```


<a name="command_contains" />

### [`contains`](#command_contains)` [OPTIONS]`
Tests if the first input contains the second.

**Stream Multiplicity:**
 - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`ResultValueStream<Boolean>`](#class_result-value-stream)`>` -- **joins** exactly 2 input streams of [Quad](core.data.factory#class_quad) objects into exactly 1 output stream of a single `boolean` value.

**Options:**
 - `--strict` -- if true, forgoes canonicalization before the set operation

_Example:_
   ```bash
   # test if `superset.ttl` strictly contains `subset.ttl`
   $ graphy read -c ttl / contains --strict   \
       --inputs superset.ttl subset.ttl
   ```


<a name="command_count" />

### [`count`](#command_count)
Count the number of events in each steam

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`ResultValueStream<Number>`](#class_result-value-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of `number` values.


<a name="command_distinct" />

### [`distinct`](#command_distinct)` [OPTIONS]`
Count the number of distinct things, such as quads, triples, subjects, etc.

**Stream Multiplicity:**
 - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`ResultValueStream<Number>`](#class_result-value-stream)`>` -- **maps** 1 or more input streams of [Quad](core.data.factory#class_quad) objects into 1 or more output streams of `number` values.

**Options:**
  - `-q, --quads` -- count the number of distinct quads (_default_)
  - `-t, --triples` -- count the number of distinct triples by ignoring the graph component
  - `-s, --subjects` -- count the number of distinct subjects
  - `-p, --predicates` -- count the number of distinct predicates
  - `-o, --objects` -- count the number of distinct objects
  - `-g, --graphs` -- count the number of distinct graphs


<a name="command_help" />

### [`help`](#command_help)
Alias for `$ graphy --help`. Print the help message and exit.


<a name="command_version" />

### [`version`](#command_version)
Alias for `$ graphy --version`. Print the version info and exit.

<a name="command_examples" />

### [`examples`](#command_examples)
Alias for `$ graphy --examples`. Print some examples and exit.


<br />



## Informational Options
Options you can pass to the main graphy command that print some information and exit:
   - `-e, --examples` -- Print some examples and exit
   - `-h, --help` -- Print the help message and exit
   - `-v, --version` -- Print the version info and exit

## Process Options
Configure certain options for the process:
   - `--show-stack-trace` -- Show the stack trace when printing error messages

<br />

## Inputs
By default, `graphy` expects a single input stream on `stdin`, which it will forward through the internal pipeline. Some commands may allow for or even expect multiple inputs (e.g., for computing the difference between two datasets).

### `--inputs FILE ...`
If you are simply piping in multiple input files, you can use the `--inputs` options like so:
```bash
$ graphy read -c ttl / diff / write -c ttl   \
    --inputs original.ttl modified.ttl       \
	  > difference.ttl
```

Keep in mind that each command has its own restrictions on the number of inputs it accepts, which may also depend on the operation being performed (e.g., `diff` expects exactly 2 input streams while `union` accepts 1 or more).


### Process Substitution
If you need to execute other commands before passing in multiple inputs, you can use [process substitution](http://www.tldp.org/LDP/abs/html/process-sub.html) (supported in bash) like so:
```bash
$ DBPEDIA_EN_URL="http://downloads.dbpedia.org/2016-10/core-i18n/en"
$ graphy read -c ttl / union / write -c ttl   \
    --inputs \
      <(curl "$DBPEDIA_EN_URL/topical_concepts_en.ttl.bz2" | bzip2 -d) \
      <(curl "$DBPEDIA_EN_URL/uri_same_as_iri_en.ttl.bz2" | bzip2 -d) \
    > union.ttl
```

<br />

<a name="classes" />

## Classes

<a name="class_string-stream" />

### class [**StringStream**](#class_string-stream)
A stream of utf8-encoded strings. This always applies to `stdin` and `stdout`.


<a name="class_quad-stream" />

### class [**QuadStream**](#class_quad-stream)
A stream of [Quad](core.data.factory#class_quad) objects.


<a name="class_writable-data-event-stream" />

### class [**WritableDataEventStream**](#class_writable-data-event-stream)
A stream of [WritableDataEvent](content.textual#interface_writable-data-event) objects.


<a name="class_any-destination" />

### class [**AnyDestination**](#class_any-destination) _adapts to_ [QuadStream](#class_quad-stream), [WritableDataEventStream](#class_writable-data-event-stream), [StringStream](#class_string-stream)
Automatically determines which mode is best suited for the destination stream. Compatible with [QuadStream](#class_quad-stream), [WritableDataEventStream](#class_writable-data-event-stream) and [StringStream](#class_string-stream). In the case of StringStream, each object is converted to its JSON equivalent on a single line, followed by a newline `'\n'` (i.e., [Line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON)). 

<a name="class_result-value" />

### class [**ResultValueStream**](#class_result-value) _adapts to_ [StringStream](#class_string-stream)
A stream that will emit a single `'data'` event which is the result of some test or computation (e.g., a single `boolean` or `number` value). Compatible with [StringStream](#class_string-stream), in which case the value will be converted to JSON and then terminated by a newline `'\n'`.

