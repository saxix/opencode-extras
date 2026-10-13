---
description: Generate a data-model diagram (editable drawio file with suffix .drawio.png) from the models in a source folder, following the dmd conventions
argument-hint: <source-folder> [output-path]
---

Generate a data-model / entity-relationship diagram from source code.

Arguments: $ARGUMENTS

Steps:

1. **Load the conventions**: invoke the `dmd` skill and follow every rule in it
   (entity boxes, stereotypes, field notation, row styling, relationships, geometry,
   A3 Landscape top-left alignment, editable-PNG file format, Legend, annotations).
2. **Resolve inputs**: the first argument is the source folder containing the code to
   inspect (e.g. a Django app or models package). If no source folder was provided,
   ask the user for it before doing anything else. The optional second argument is the
   output path for the diagram; default to `<source-folder>/models.drawio.png`.
3. **Inspect the code**: read the models in the source folder and derive entities,
   fields with types and defaults, optionality (null/blank), enums/choices, foreign
   keys, and inheritance/mixins. Do not invent fields; use `...` rows where the model
   list is deliberately trimmed.
4. **Author the diagram** as drawio XML per the dmd conventions, then **export it as an
   editable PNG** (embedded diagram XML) to the output path — on macOS via
   `/Applications/draw.io.app/Contents/MacOS/draw.io -x -f png --embed-diagram`.
   Verify the export round-trips back to XML.
5. **Report**: show the rendered diagram, list any modelling questions or assumptions
   you had to make, and put them on the canvas as `Q:` / `A1:` items per the conventions.

