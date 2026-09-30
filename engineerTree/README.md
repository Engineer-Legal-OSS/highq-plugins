# EngineerTree Documentation

**EngineerTree** allows the presentation of tree diagrams, org charts, or other hierarchies directly within HighQ Home or Wiki pages.

---

## Table of Contents
- [Adding a Tree to a HighQ Site](#adding-a-tree-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Tree to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site

### Step-by-Step Setup

1. **Create an iSheet**:
   - **Column 1 (Single Line Text)**: Node name (e.g., Person or Company Name).
   - **Column 2 (Single Line Text)**: Parent node name (e.g., Manager or Parent Company).
   - **Optional Columns**: Status (Choice column), Holding %, etc.
2. **Create an iSheet View**:
   - Create a view called **"Home Page"**.
   - Ensure only the columns required for the tree are included in this view, then save.
3. **Populate Data**:
   - The **root node** (e.g., CEO or Ultimate Parent Company) must have a **blank** value in Column 2.
   - Every other row **must** have a value in Column 2 matching a valid Node Name in Column 1.

#### An Example iSheet Structure for EngineerTree

| Column 1 (Node Name) | Column 2 (Parent Node) | Column 3 (Status / Choice) |
| **Acme Holdings Ltd** | *(leave blank)* | Active |
| **Acme UK Ltd** | Acme Holdings Ltd | Active |
| **Acme US Inc** | Acme Holdings Ltd | Active |
| **SubCo Alpha** | Acme UK Ltd | Pending |

---

### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="treeContainer1">
  <script>
    engineerLegal({
      container: 'treeContainer1',
      plugin: 'tree',
    });
  </script>

  <!-- EngineerLegal-plugins -->
  <script src="./flag/flag_000000000000000000000.action"></script>

  <!-- EngineerCore -->
  <script src="./flag/flag_000000000000000000000.action"></script>
</div>
```

## Modifying Options

The code for each plugin can be modified by setting "options" - these are the lines of code ending in a comma (`,`) between the curly braces (`{}`) after `engineerLegal`. Each line changes or provides information to a different component of the plugin. Details of all the options available are listed in the Advanced Configuration section of this guide.

To add a new option, add a new line after the last comma and before the last curly brace and add your option line as below:

> **Warning:** HighQ does not keep a version history of your edits to code in Home pages, so it's good practice to save your code into another window (such as Notepad) before making changes in case you need to roll back.

```javascript
  engineerLegal({
  container: 'container1',
  // << ADD NEW LINE HERE >>
  });
```

For example, if you wanted to change the style of the lines connecting your nodes to steps instead of curves, you would use the lineStyle option.

We would add a new line to the code above, add our option, then a colon (:), then a single quote ('), then the word step, then another single quote and comma:
JavaScript

```javascript
  engineerLegal({
  container: 'container1',
  lineStyle: 'step',
  });
```

# Advanced Configuration

This section lists all the possible options that can be used to modify the standard behavior of the chart. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the tree to load.

### `container`
* **Example:** `container: 'treeContainer1',`

Tells the code where you want the chart to appear on your page. It requires a corresponding HTML element similar to `<div id="treeContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `plugin`
* **Example:** `plugin: 'tree',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the chart. They do not need to be set and can be removed to return them to their defaults.

### `nameColumn`
* **Default:** `'0'`
* **Example:** `nameColumn: '2',`

Tells EngineerTree which column number (starting from `0`) in your iSheet view contains the value used for the node name.

### `parentColumn`
* **Default:** `'1'`
* **Example:** `parentColumn: '2',`

Tells EngineerTree which column number (starting from `0`) in your iSheet view contains the value used to locate the parent node.

### `backgroundColorColumn`
* **Default:** `'false'`
* **Example:** `backgroundColorColumn: '3',`

Must be a HighQ choice column. Tells EngineerTree which column number (starting from `0`) in your iSheet view contains choice values with colors set that can be used to color each node.

### `labelColumn`
* **Default:** `'false'`
* **Example:** `labelColumn: '3',`

Tells EngineerTree which column (starting from `0`) in your iSheet view should be used to label the connection to the parent node.

### `statusColumn`
* **Default:** `'auto'`
* **Example:** `statusColumn: 'false',`

Must be a HighQ choice column. Tells EngineerTree which column number (starting from `0`) in your iSheet view contains choice values with colors set that can be used to add a "status" pill in the bottom right of each node. This will default to the first choice column from the left in your iSheet. To disable the pills, set `statusColumn: 'false'`.

### `holdingColumn`
* **Default:** `'false'`
* **Example:** `holdingColumn: '3',`

When set to a number corresponding to an iSheet number column in the iSheet view (starting from `0`), this allows hiding nodes if they have no children and are below a certain threshold—defined in the `minorityHoldingLevel` option below. The connection will be shown on the node with a hovering `?` symbol, but no line will be drawn. This can help keep complex charts cleaner.

### `minorityHoldingLevel`
* **Default:** `'false'`
* **Example:** `minorityHoldingLevel: '40',`

Any numeric value found in the `holdingColumn` above below this threshold will prevent connection lines from being drawn on the chart.

### `otherColumns`
* **Default:** `'false'`
* **Example:** `otherColumns: '3,4,11',`

Tells EngineerTree which other columns (starting from `0`) in your iSheet view should have their values and titles added to each node.

### `showOtherColumnHeaders`
* **Default:** `'true'`
* **Example:** `showOtherColumnHeaders: 'false',`

If `otherColumns` are set, this can be used to hide the column name from the node.

### `exportButton`
* **Default:** `'false'`
* **Example:** `exportButton: 'true',`

If you have HTML2Canvas in you plugins config file, or pre-loaded into the page this option will add a chart export button to the menu above the chart. *Please note, there are browser limits to what image size can be generated; for extremely large charts this button may show a warning that your chart is too large to export.*

### `fullscreenButton`
* **Default:** `'false'`
* **Example:** `fullscreenButton: 'true',`

Adds a full screen button to the menu above the chart.

### `manageTreeButton`
* **Default:** `'false'`
* **Example:**

```javascript
  manageTreeButton: 'true',
  eliminateColumnName: 'Status',
  eliminateStatus: 'Eliminated',
  allowDelete: 'true',
```

*Use with caution as this will modify the isheet.* Loads an application that allows quick updates to the underlying chart data such as reparenting and renaming entities. If your isheet is filtered to remove certain entity types by a status choice column, the elimination option can be by setting the `eliminateColumnName` and `eliminateStatus` values to match your column name and choice value.

```javascript
  engineerLegal({
  container: 'container1',
  lineStyle: 'step',
  });
```

### `enableZoomPan`
* **Default:** `'false'`
* **Example:** `enableZoomPan: 'true',`

Allows the chart to be navigated with the mousewheel and right-click and drag

### `enableSearch`
* **Default:** `'false'`
* **Example:** `enableSearch: 'true',`

Adds a suite of searching tools to the menu above the chart.

### `lineStyle`
* **Default:** `'curve'`
* **Example:** `lineStyle: 'straight',`

Defines the type of connection between nodes. Options are:
  * `curve`
  * `bCurve`
  * `straight`
  * `step`

### `lineColor`
* **Default:** `'#000'`
* **Example:** `lineColor: '#aceace',`

Defines the color of connections between nodes. *Note: Accepts hex values only.*

### `nodeWidth`
* **Default:** `'auto'`
* **Example:** `nodeWidth: '200',`

Fixes node width in pixels.

### `nodeHeight`
* **Default:** `'auto'`
* **Example:** `nodeHeight: '100',`

Fixes node height in pixels (can cause overflow if set too low).

### `nodeSeparation`
* **Default:** `'20'`
* **Example:** `nodeSeparation: '5',`

Sets the width of horizontal gaps between nodes.

### `levelSeparation`
* **Default:** `'40'`
* **Example:** `levelSeparation: '100',`

Sets the height of vertical gaps between node levels.

### `nodeBorderWidth`
* **Default:** `'1'`
* **Example:** `nodeBorderWidth: '3',`

Defines the node border width in pixels.

### `nodeBorderColor`
* **Default:** `'#000'`
* **Example:** `nodeBorderColor: 'navy',`

Defines the node border color. Accepts color names and hex values.

### `nodeTextColor`
* **Default:** `'#000'`
* **Example:** `nodeTextColor: 'white',`

Defines the node text color. Accepts color names and hex values.

### `labelColor`
* **Default:** `'#000'`
* **Example:** `labelColor: 'red',`

Defines the color of text labels on connections between nodes. Accepts color names and hex values.

### `labelFontSize`
* **Default:** `'#000'`
* **Example:** `labelFontSize: '1.5 em',`

Defines the font size of text labels on connections between nodes. Must include a measurement (e.g., `px` or `em`).

### `hoverColor`
* **Default:** `'#000'`
* **Example:** `hoverColor: 'orange',`

Defines the color of node borders and connections to parents on mouse hover. Accepts color names and hex values.

### `panelLinks`
* **Default:** `'false'`
* **Example:** `panelLinks: 'viewItem',`

Adds a click action to each node in the tree that can perform one of several actions depending on the configuration option:
  * `panelLinks: 'viewItem',` — Will open the HighQ view item modal window for the record selected.
  * `panelLinks: 'isheet',` — Will navigate to the iSheet view filtered to just show the record selected.
  * `panelLinks: 'default',` — Will navigate to the iSheet of the record selected, but using the default view instead of the view chosen for the tree.
