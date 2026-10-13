---
name: dmd
description: Conventions for rendering data-model / entity-relationship diagrams (drawio). Use when creating, editing, reviewing, or interpreting a data-model diagram (.drawio, .drawio.png) so entities, fields, enums, relationships, and annotations follow the project's house style.
---

# Data-Model Diagram (DMD) conventions

House style for data-model / ER diagrams (drawio). Follow these rules when drawing a new
diagram, extending an existing one, or reading one back (e.g. to generate models from it).
Reference example: `example.drawio.png` in this skill's folder.

This skill holds conventions only. The workflow for generating a diagram from source
code is the `/dmd-gen` command (`.claude/commands/dmd-gen.md`), which applies these rules.

## Additional resources

- Drawio XML element styles and geometry values: see [reference.md](reference.md).
  It is the **single source of truth** for `style="..."` strings and fixed dimensions
  (`entity-header-style`, `field-style`, `field-geometry-height`, `legend-style`).
  This file only names those entries — it never restates or overrides their values.
  When a rule below needs a variation (bold, italic, sketch), **append** the extra
  properties to the referenced style; do not replace it.

## 1. Entity boxes

- Each entity is a UML-style class box: **centered entity name** in the header,
  one row per field in the body.
- In the drawio XML the entity is a swimlane `mxCell` using `entity-header-style` from
  reference.md, and each field is its **own `mxCell` child of that swimlane**
  (`vertex="1"`, `parent` = entity id) using `field-style` with an `mxGeometry` whose
  height is `field-geometry-height`. Never collapse the field list into a single
  multi-line/HTML text cell — one cell per row is what keeps rows individually
  styleable (bold/italic/sketch) and addressable.
- End the field list with a `...` row when the list is deliberately incomplete
  (more fields exist or are yet to be defined).
- **Mixin shorthand**: append the abstract traits an entity incorporates after its name,
  comma-separated — e.g. `TrackSegment : D, OU, TF`. The abbreviations are declared by the
  abstract boxes themselves (see §2), whose header doubles as the key.

## 2. Stereotypes

- `<<abstract>>` — abstract/mixin types contributing fields to concrete entities.
  Header pattern: `<<abstract>>` on the first line, `ABBR = FullName` on the second
  (e.g. `D = DatasetAware`, `OU = OrganisationAware`, `TF = TrackFeatures`).
  Concrete entities reference the ABBR in their title suffix.
- `<<choices>>` — enumerations. Header: `<<choices>>` + enum name. One row per value, using:
  - `Value # description` — e.g. `Junction # Track diverges/merges (points, crossovers, etc.)`
  - `Code "Label"` for stored-code/display-label pairs — e.g. `S "Standard"`, `N "Narrow"`.
- Custom stereotypes are allowed when a concept needs one (e.g. `<<hybrid dynamic>>`).

## 3. Field notation

- Fields are `name: type`, with Python-ish types: `str`, `int`, `float`, `bool`, `json`, `tz`.
- Arrays: `str[]`. Interval/range types: `dateInterval []`.
- Enum-typed fields wrap the enum name in angle brackets: `direction: <TrackDirection>`.
- Defaults with `=`, terse literals: booleans `= T` / `= F`, plus `= 0`, `= None`, `= DRAFT`.
- Unresolved/unknown types are flagged with `???` (`timingPointType: ???`, `Block: <???>`).
- Inline semantics/constraints after `#`: `lat/long # readonly for us`,
  `topologyCoords: Coords # x/y on topology`.
- Derived/computed values are methods with `()` in a **separate bottom compartment**:
  `trackType(): <TrackType>`.

## 4. Row styling

Fixed, colour-independent conventions:

| Style                                            | Meaning                                                                       | XML (appended to the reference style) |
|--------------------------------------------------|-------------------------------------------------------------------------------|---------------------------------------|
| Sketch style (drawio rough/hand-drawn rendering) | Uncertain / TBD — applies to any element: field row, entity, or relationship  | `sketch=1;`                           |
| Bold row                                         | Mandatory field                                                               | `fontStyle=1;`                        |
| Plain italic row                                 | Optional field                                                                | `fontStyle=2;`                        |

Colours carry no predefined meaning. Any colour-coding used in a diagram (fill or font
colour of rows, entities, or arrows) **must be elicited in a Legend box** on the canvas
(top-right), with one sample swatch per colour and its meaning. Do not use a colour that
is not declared in the Legend.

The Legend is built **exactly like an entity box**: a swimlane container `mxCell`
(`legend-style` from reference.md, `value="Legend"`, `vertex="1"`, `parent="1"`) whose
children are **one `mxCell` per swatch row** (`vertex="1"`, `parent` = legend id), using
`field-style` with the colour being declared appended (`fillColor=...;` for a fill
swatch, `fontColor=...;` for a font-colour swatch) and the meaning as the cell `value`.
Unlike entities, the Legend **does not auto-stack** (`legend-style` deliberately has no
`childLayout`), so each swatch row's `mxGeometry` must be positioned explicitly: height
`field-geometry-height`, `y` = legend header height + `field-geometry-height` × row
index, where the header height is drawio's default swimlane `startSize` because
`legend-style` sets none. Keep the container height tight to its rows. Never draw the
Legend as a free-floating group of rectangles and text labels, and never put all
swatches in a single HTML text cell.

```xml
<mxCell id="legend" value="Legend" style="{legend-style}" vertex="1" parent="1">
  <mxGeometry x="1400" y="20" width="220" height="{header + 2 × field-geometry-height}" as="geometry"/>
</mxCell>
<mxCell id="legend_r1" value="Imported from legacy system" style="{field-style}fillColor=#FFF2CC;" vertex="1" parent="legend">
  <mxGeometry y="{header}" width="220" height="{field-geometry-height}" as="geometry"/>
</mxCell>
<mxCell id="legend_r2" value="Computed downstream" style="{field-style}fontColor=#B85450;" vertex="1" parent="legend">
  <mxGeometry y="{header + field-geometry-height}" width="220" height="{field-geometry-height}" as="geometry"/>
</mxCell>
```

## 5. Relationships

- Every class **implicitly includes an `id` numeric autogenerated primary-key field** —
  never write it as a row in the class box.
- If the class has a non numeric primary key or a primary key named something other than `id`, write it as a row in the class box and **mark it bold** and add "PK" string after the datatype. 
- An association arrow **represents a Foreign Key**, which is therefore **not repeated as
  a row** in the class box. By convention the FK column is named after the target class
  with an `_id` suffix (arrow into `TrackSegment` → `tracksegment_id`). When the name
  diverges from the convention, or in case of ambuigty due to multiple FK to same target,it **must be specified as the arrow's label**
  (`from`, `to`, `parent_location`).
- FK arrows are solid and point at the referenced (target) entity.
- Inheritance/specialisation: hollow-triangle UML arrow into the parent.
- Multiplicity: an association is **1-to-many by default — do not write `*`**. Only when
  the cardinality of the child side is deterministic (e.g. 1-to-1, or 1-to-N where N is a
  fixed maximum) is it written, **on the source end** of the association (e.g. `1`, `4`).
  Cardinality subtleties (e.g. why a link is many-to-many) are explained in an attached
  note rather than crow's-feet notation.
- All relationship arrows (FK/role associations and inheritance) are rendered with the
  **rounded** edge style for better flow readability. The dashed connectors joining note
  elements to their subject must also use **rounded waypoints** (they stay dashed and
  arrowhead-free).
- All arrows use **Line Jumps = Arc** so crossing edges are visually disambiguated:
  drawio style `jumpStyle=arc;` (leave `jumpSize` at the drawio default unless a
  crowded area needs a larger arc). In the drawio UI this is Format → Style → Line Jumps
  → Arc. Applies to every edge, including the dashed note connectors.

## 6. Geometry

- To minimize class box dimensions, every field row is an `mxCell` whose `mxGeometry`
  height is `field-geometry-height` (from reference.md; width = the entity width,
  `y` = header `startSize` + `field-geometry-height` × row index). Keep the entity box
  height tight to its rows (no trailing empty space), i.e.
  `height = startSize + field-geometry-height × rows` (plus the `...` row and the
  methods compartment separator when present). Skeleton — `{...}` placeholders are the
  named entries in reference.md, copied verbatim:

  ```xml
  <mxCell id="ent1" value="TrackSegment : D, OU" style="{entity-header-style}" vertex="1" parent="1">
    <mxGeometry x="40" y="40" width="200" height="{startSize + 2 × field-geometry-height}" as="geometry"/>
  </mxCell>
  <!-- mandatory field: field-style + fontStyle=1; -->
  <mxCell id="ent1_f1" value="name: str" style="{field-style}fontStyle=1;" vertex="1" parent="ent1">
    <mxGeometry y="{startSize}" width="200" height="{field-geometry-height}" as="geometry"/>
  </mxCell>
  <!-- optional field: field-style + fontStyle=2; -->
  <mxCell id="ent1_f2" value="length: float" style="{field-style}fontStyle=2;" vertex="1" parent="ent1">
    <mxGeometry y="{startSize + field-geometry-height}" width="200" height="{field-geometry-height}" as="geometry"/>
  </mxCell>
  ```
- Foreign-key association arrows encode optionality by stroke thickness:
  **mandatory FK = 2px**, **optional FK = 1px**.
- Standard entity box width is **200px**; widen only as needed to fit the longest
  field row on one line (do not wrap field text). Keep width consistent within a
  cluster of related entities.
- Snap to the drawio **10px grid**. Leave at least **20px** between entity boxes
  (more where an arrow label like `from`/`to` needs room to stay legible).
- Place enums (`<<choices>>`) and abstract/mixin boxes in the margins (right or below),
  away from the main entity flow; the Legend goes top-right.
- Paper size is **A3 Landscape** (drawio page setup: 1654 x 1169). The rendering area
  must be **aligned with the top-left corner** of the first A3 page (content starts at
  the page origin, small margin aside) and may extend onto **additional pages to the
  right and/or bottom** when the model does not fit on one page. Never let content
  drift into negative coordinates or start mid-page.

## 7. File format

- The diagram **must be saved as an editable PNG** (drawio's "Editable Bitmap Image"
  format, `.drawio.png` extension): a PNG with the drawio XML embedded, so the same
  file both renders as an image (in wikis, READMEs, IDEs) and reopens fully editable
  in drawio.
- Do not save as plain `.drawio` XML or export a flat PNG — either loses one of the
  two capabilities. When exporting from drawio, tick **"Include a copy of my diagram"**.

## 8. Canvas annotations

- Free-text explanations go in folded-corner sticky notes, linked to their subject with
  **dashed** lines.
- Open items live directly on the canvas as plain-text blocks:
  - a **Questions** section with `Q:`-prefixed items;
  - an **Assumption** section with numbered `A1:`, `A2:` items.
- The diagram is a working/decision document, not just a finished ERD — keep questions,
  assumptions, and TBD markers on it until resolved, then update the styling accordingly.
