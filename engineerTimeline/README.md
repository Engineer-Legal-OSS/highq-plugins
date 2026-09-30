# EngineerTimeline Documentation

**EngineerTimeline** allows the presentation of timelines directly from HighQ iSheet and Task metadata in Home or Wiki pages. 

---

## Table of Contents
- [Adding a Timeline to a HighQ Site](#adding-a-timeline-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Timeline to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site

### Required iSheet Structure

1. **Create an iSheet**:
   - **Column 1 (Single line text)**: Called "Event name" or similar.
   - **Column 2 (Date and time)**: Called "Event Date" or similar.
   - **Optional Columns**: Status (Choice column), End Date (Date and time), etc.
2. **Create an iSheet View**:
   - Create a view called **"Timeline View"**.
   - Ensure only the columns required for the Gantt chart are included in this view, **ensure your view is sorted by Event Date**, then save.

### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="timelineContainer1">
  <script>
    engineerLegal({
      container: 'timelineContainer1',
      plugin: 'timeline',
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

For example, if you wanted to limit your timeline widget to only show the top 10 rows from your iSheet you could use the recordLimit option. 

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then the number of rows you want to limit the widget to, then another single quote and comma. 

```javascript
  engineerLegal({
  container: 'container1',
  recordLimit: ‘10’, 
  });
```

---

# Advanced Configuration

This section lists all the possible options that can be used to modify standard timeline behavior. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the timeline to load properly.

> **Note:** To display your timeline, you must include at least one column in either `section1Columns` or `section2Columns`.

### `container`

* **Example:** `container: 'timelineContainer1',`

Tells the code where you want the timeline to appear on your page. It requires a corresponding HTML element similar to `<div id="timelineContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `section1Columns`

* **Default:** `'false'`
* **Example:** `section1Columns: '0,1,2',`

A single column index or comma-separated list of column numbers (starting from `0` for the leftmost column) from your iSheet view. Displays the values from those columns vertically above each node in a horizontal layout (or to the left of each node in a vertical layout).

### `section2Columns`

* **Default:** `'false'`
* **Example:** `section2Columns: '3,4,5',`

A single column index or comma-separated list of column numbers (starting from `0` for the leftmost column) from your iSheet view. Displays the values from those columns vertically below each node in a horizontal layout (or to the right of each node in a vertical layout).

### `plugin`
* **Example:** `plugin: 'timeline',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the timeline. They do not need to be set and can be removed to return them to their defaults.

### `groupColumn`

* **Default:** `'false'`
* **Example:** `groupColumn: '3',`

Sets the column index (starting from `0`) used to group iSheet rows. Creates a dropdown menu above the timeline allowing users to switch the timeline view between different groups.

### `buttonText`

* **Default:** `'Select Item'`
* **Example:** `buttonText: 'Select Case',`

When `groupColumn` is enabled, this sets the label text on the group dropdown button. Emojis are supported.

### `statusColumn`

* **Default:** `'auto'`
* **Example:** `statusColumn: '3',`

Sets the column index (starting from `0`) of a Choice-type column whose choice colors will be used to style each timeline node.

### `timelineStyle`

* **Default:** `'2px solid #000'`
* **Example:** `timelineStyle: '4px double red',`

Sets the CSS border style for the connecting line between nodes on the timeline. Accepts any valid CSS border syntax.

### `nodeSize`

* **Default:** `'25'`
* **Example:** `nodeSize: '11',`

Sets the size of each node on the timeline in pixels.

### `defaultColor`

* **Default:** `'#0a1431'`
* **Example:** `defaultColor: 'green',`

Sets the fallback color for timeline nodes if a HighQ choice color column is not configured. Accepts HTML color names or HEX codes.

### `panelLinks`

* **Default:** `'false'`
* **Example:** `panelLinks: 'viewItem',`

Adds a click action to each timeline node that performs one of several actions depending on the configuration value:

* `'viewItem'` – Opens the HighQ view item modal window for the selected record.
* `'print'` – Opens the HighQ print preview pane for the selected record.
* `'isheet'` – Navigates to the iSheet view filtered to show only the selected record.
* `'default'` – Navigates to the selected record's iSheet under the default view instead of the view chosen for the timeline.

### `verticalLayout` & `maxHeight`

* **Default:** `'false'`
* **Example:**
```javascript
verticalLayout: 'true',
maxHeight: '600',
```

Transposes the timeline into a vertical layout instead of horizontal. In this mode, `section1Columns` appear to the left of the timeline line and `section2Columns` appear to the right. Set `maxHeight` (in pixels) to enable a vertical scroll bar when records exceed that height.

### `showLegend`

* **Default:** `'true'`
* **Example:** `showLegend: 'false',`

Shows or hides the status color legend on the timeline.