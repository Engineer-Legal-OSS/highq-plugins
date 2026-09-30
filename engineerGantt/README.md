# EngineerGantt Documentation

**EngineerGantt** allows the presentation of project Gantt charts from iSheet data in HighQ Home or Wiki pages. 

---

## Table of Contents
- [Adding a Gantt chart to a HighQ Site](#adding-a-gantt-chart-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Gantt Chart to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site

### Required iSheet Structure

1. **Create an iSheet**:
   - **Column 1 (Single line text)**: Called "Event name" or similar.
   - **Column 2 (Date and time)**: Called "Start Date" or similar.
   - **Optional Columns**: Status (Choice column), End Date (Date and time), etc.
2. **Create an iSheet View**:
   - Create a view called **"Gantt View"**.
   - Ensure only the columns required for the Gantt chart are included in this view, then save.

### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="ganttContainer1">
  <script>
    engineerLegal({
      container: 'ganttContainer1',
      plugin: 'gantt',
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

For example, if you wanted to change the scale that chart loads with by default we can use the "scale" option.

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then the size in pixels of the node you would like, then another single quote and comma. The default is 'weeks' but if we had projects being completed over the next few days we could change it to:

```javascript
  engineerLegal({
  container: 'container1',
  scale: 'days’, 
  });
```

# Advanced Configuration

This section lists all the possible options that can be used to modify the standard behavior. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the chart to load.

### `container`
* **Example:** `container: 'ganttContainer1',`

Tells the code where you want the chart to appear on your page. It requires a corresponding HTML element similar to `<div id="ganttContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `plugin`
* **Example:** `plugin: 'gantt',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the chart. They do not need to be set and can be removed to return them to their defaults.

### `nameColumn`
* **Default:** `'0'`
* **Example:** `nameColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column), the value in that column will be displayed on the task bars in the Gantt chart.

### `startDateColumn`
* **Default:** `'auto'`
* **Example:** `startDateColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a date column type, the value from this column will be used as the start date for each task in the Gantt chart.

### `endDateColumn`
* **Default:** `'auto'`
* **Example:** `endDateColumn: '4',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a date column type, the value from this column will be used as the end/due date for each task in the Gantt chart.

### `durationColumn`
* **Default:** `'auto'`
* **Example:** `durationColumn: '4',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a number column type, the value from this column will be used to calculate the end/due date for each task in the Gantt chart as number of dates from the Start Date.

### `statusColumn`
* **Default:** `'auto'`
* **Example:** `statusColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a choice column type, the colors from this column's selected choice will be used to color each task bar on the Gantt chart.

### `progressColumn`
* **Default:** `'false'`
* **Example:** `progressColumn: '5',`

When set to a number corresponding to a number or choice column in the iSheet view (starting from `0` for the leftmost column), the percentage value will be rendered inside the task bar to show progress towards completion.

### `predecessorColumn`
* **Default:** `'false'`
* **Example:** `predecessorColumn: '6',`

When set to a column number containing predecessor task identifiers or names, dependency lines will be drawn between connected tasks in the chart.

### `groupColumn`
* **Default:** `'false'`
* **Example:** `groupColumn: '1',`

When set to a column number in the iSheet view, tasks will be grouped into collapsible sections based on the values in this column.

### `milestoneColumn`
* **Default:** `'false'`
* **Example:** `milestoneColumn: '7',`

When set to a choice/boolean column in the iSheet view, items flagged as milestones will be rendered as diamond markers on the timeline instead of standard horizontal bars.

### `otherColumns`
* **Default:** `'false'`
* **Example:** `otherColumns: '4,6,8',`

When set to a number or comma-separated list of numbers corresponding to columns in the iSheet view (starting from `0` for the leftmost column), those column values will be displayed as additional details on the task bar or list panel.

### `defaultBarColor`
* **Default:** `'#0a1431'`
* **Example:** `defaultBarColor: 'navy',`

If no status column is specified, this sets the default background color for all task bars in the Gantt chart.

### `taskSearch`
* **Default:** `'false'`
* **Example:** `taskSearch: '0',`

When set to a number corresponding to a column in the iSheet, clicking on a task bar will open the HighQ site Tasks module and pre-filter the results based on the value in the specified column.

### `ganttLinks`
* **Default:** `'false'`
* **Example:** `ganttLinks: 'isheet',`

Adds a click action to each task on the Gantt chart that performs one of several actions depending on the configuration:
  * `ganttLinks: 'viewItem',` — Opens the HighQ view item modal window for the selected record.
  * `ganttLinks: 'print',` — Opens the HighQ print preview pane for the iSheet record selected.
  * `ganttLinks: 'isheet',` — Navigates to the iSheet view filtered to show only the selected record.
  * `ganttLinks: 'default',` — Navigates to the iSheet default view for the selected record.

### `linkTab`
* **Default:** `'blank'`
* **Example:** `linkTab: 'self',`

Determines whether links opened from a clicked task bar open in the current tab (`'self'`) or a new tab (`'blank'`).

### `showLegend`
* **Default:** `'true'`
* **Example:** `showLegend: 'false',`

If set to `false`, the color legend explaining status values will be hidden.

### `labelTooltips`
* **Default:** `'false'`
* **Example:** `labelTooltips: 'true',`

If set to `true`, hovering over a task bar displays a pop-up tooltip showing the full task title and timeline details.

### `tooltipOtherColumns`
* **Default:** `'false'`
* **Example:** `tooltipOtherColumns: '1,4',`

Displays the values of specific additional columns in the tooltip when `labelTooltips` is enabled. Accepts zero-based column indices in a comma-separated list.

### `titleSize`
* **Default:** `'1rem'`
* **Example:** `titleSize: '18px',`

Sets the font size of task titles on the chart.

### `otherColumnSize`
* **Default:** `'0.9rem'`
* **Example:** `otherColumnSize: '18px',`

Sets the font size for secondary metadata displayed via the `otherColumns` option.

### `hideTasksWithoutDates`
* **Default:** `'false'`
* **Example:** `hideTasksWithoutDates: 'true',`

By default, tasks missing start or end dates are displayed as appearing on today's date to avoid missing deadlines. Setting this to `true` hides any tasks that lack date information from the Gantt chart view.