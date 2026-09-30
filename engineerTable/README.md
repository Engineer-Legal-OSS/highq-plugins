# EngineerTable Documentation

**EngineerTable** allows the presentation of tables directly from HighQ iSheet and Task metadata in Home or Wiki pages. 

---

## Table of Contents
- [Adding a Table to a HighQ Site](#adding-a-table-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Table to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site


### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your an iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="tableContainer1">
  <script>
    engineerLegal({
      container: 'tableContainer1',
      plugin: 'table',
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

For example, if you wanted to limit your table widget to only show the top 10 rows from your iSheet you could use the recordLimit option. 

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then the number of rows you want to limit the widget to, then another single quote and comma. 

```javascript
  engineerLegal({
  container: 'container1',
  recordLimit: ‘10’, 
  });
```

# Advanced Configuration

This section lists all the possible options that can be used to modify the standard behavior. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the chart to load.

### `container`
* **Example:** `container: 'tableContainer1',`

Tells the code where you want the chart to appear on your page. It requires a corresponding HTML element similar to `<div id="tableContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `plugin`
* **Example:** `plugin: 'table',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the table. They do not need to be set and can be removed to return them to their defaults.

### `flexColumns`

* **Default:** `'true'`
* **Example:** `flexColumns: 'false',`

When set to `false`, the table widget will not attempt to resize columns to fit the width of the user interface and instead will fix the width of the column to those set in the HighQ iSheet column settings. It will generate horizontal scroll bars if this width exceeds the width of the viewable area of the page.

### `showHeaders`

* **Default:** `'true'`
* **Example:** `showHeaders: 'false',`

When set to `false`, the iSheet table header row will be hidden.

### `headerColor`

* **Default:** `'#ffffff'`
* **Example:** `headerColor: 'gray',`

Sets the background color of the header row of the table. Accepts HTML color names or HEX codes.

### `headerTextColor`

* **Default:** `'#343434'`
* **Example:** `headerTextColor: 'red',`

Sets the color of the header row text of the table. Accepts HTML color names or HEX codes.

### `stickyHeaders`

* **Default:** `'false'`
* **Example:** `stickyHeaders: 'true',`

When set to `true` and combined with the `tableHeight` option below, the table header will "stick" to the top of the page section as the user scrolls down through the rows of data.

> **Note:** If you have only one EngineerTable on your page and the table takes up the full width of the home page, you do not need to set `tableHeight`—the header row will stick to the top of the browser when scrolling down. However, this may hide HighQ's own sticky navigation header; set `tableHeight` to avoid this.

### `tableHeight`

* **Default:** `unlimited`
* **Example:** `tableHeight: '600px',`

Sets the maximum height that the table will take up on the page. If the number of records exceeds this height, the component will display a vertical scroll bar.

### `verticalAlign`

* **Default:** `'middle'`
* **Example:** `verticalAlign: 'top',`

Tells EngineerTable to vertically align each cell entry to `'top'`, `'middle'`, or `'bottom'`.

### `showLastModified`

* **Default:** `'false'`
* **Example:** `showLastModified: 'true',`

Displays the last modified date of your iSheet data above your table by finding the latest modified date across your rows. Your `iSheetViewLink` view must contain the HighQ "Modified Date" column.

### `recordLimit`

* **Default:** `'0'` (unlimited)
* **Example:** `recordLimit: '20',`

Limits the number of records displayed in your table to the first *x* number of rows in your iSheet view.

### `selectedColumns`

* **Default:** `all`
* **Example:** `selectedColumns: '2,4,5,7',`

A comma-separated list (with no spaces) of the column numbers (starting from `0`) from your data view that you want to display in your table. This is useful if you want to hide columns such as the Modified Date column from the visible table while still using options like `showLastModified`.

> **Note:** This option is automatically set by EngineerMap and EngineerList if EngineerTable is used in conjunction with them.

### `recordLinks`

* **Default:** `'false'`
* **Example:** `recordLinks: 'viewItem',`

Adds a button to the first column of your table that performs one of several actions depending on the configuration value:

* `'viewItem'` – Opens the HighQ view item modal window for the selected record.
* `'print'` – Opens the HighQ print preview pane for the selected record.
* `'isheet'` – Navigates to the iSheet view filtered to show only the selected record.
* `'default'` – Navigates to the selected record's iSheet under the default view instead of the view chosen for the table.
* `'edit'` – Navigates to the iSheet record in a modal window and opens the edit item modal allowing changes to be made. The table refreshes when the modal is closed.
* `'editInline'` – Enables inline editing for each row. All editable columns can be updated directly within the table.
* *Supported column types:* Single Line Text, Multi Line Text (non-HTML), Number, Date/Time, Choice, User Lookup, and Score.



### `editInlineHeight`

* **Default:** `'auto'`
* **Example:** `editInlineHeight: '150px',`

When `recordLinks` is set to `'editInline'`, this option expands the height of the active editable row to allow more space for large text or choice fields.

### `rowButtonText`

* **Default:** `'More Details'`
* **Example:** `rowButtonText: 'View',`

When `recordLinks` is enabled, this option customizes the label on the generated button. Emojis are supported.

### `rowButtonWidth`

* **Default:** `'100'`
* **Example:** `rowButtonWidth: '60',`

When `recordLinks` is enabled, this sets the width of the button column in pixels.

### `transposeTable`

* **Default:** `'false'`
* **Example:** `transposeTable: 'true',`

When set to `true`, the table builds with column headers down the left side and each iSheet row added as a column to the right, simplifying side-by-side data comparison.

### `sumColumns`

* **Default:** `'false'`
* **Example:** `sumColumns: '3,6',`

Accepts a comma-separated list of column numbers (starting from `0`) to add a total row at the bottom of the table for each listed column. *Applies only to iSheet Number and Calculation type columns.*

### `meanColumns` & `meanIgnoreBlanks`

* **Default:** `'false'`
* **Example:**
```javascript
meanColumns: '3,6',
meanIgnoreBlanks: 'true',

```

`meanColumns` accepts a comma-separated list of column numbers (starting from `0`) to add an average (mean) row to the bottom of the table for each listed column (*Number and Calculation columns only*). Setting `meanIgnoreBlanks` to `'true'` excludes blank rows from the calculation rather than treating them as zeros.

### `numberAlign`

* **Default:** `'right'`
* **Example:** `numberAlign: 'left',`

By default, Number and Calculation column values are right-aligned (similar to Excel). Setting this to `'left'` overrides that alignment.

### `quickFilter`

* **Default:** `'false'`
* **Example:**
```javascript
quickFilter: 'true',
quickFilterPlaceholder: 'Search Table',
quickFilterButtonText: 'Search',
quickFilterClearText: 'Reset',

```

Enables a search box above the table that queries across all rows and columns, hiding any rows that do not contain an exact match. You can customize the placeholder, search button text, and clear button text using the respective sub-options.

### `filterColumn` & `filterTerm`

* **Default:** `'false'`
* **Example:**
```javascript
filterColumn: '0',
filterTerm: 'Litigation',
filterTermFuzzy: 'true',

```

Used together to set a hard-coded filter on load. `filterColumn` specifies which column index (starting from `0`) to apply the filter to, and `filterTerm` searches for that exact value. Setting `filterTermFuzzy` to `'true'` enables substring matching rather than strict exact matching.

### `exportButton`

* **Default:** `'false'`
* **Example:** `exportButton: 'true',`

When set to `'true'`, displays a button above the table allowing users to export and download the displayed data as a CSV file.

### `collapse`

* **Default:** `'false'`
* **Example:** `collapse: 'row',`

When set to `'row'`, `'column'`, or `'both'`, automatically hides any row and/or column where all cells are completely blank.

### `truncateText`

* **Default:** `'false'`
* **Example:** `truncateText: '50',`

Truncates Single Line Text and Multi Line Text columns to the specified character limit (note: rich HTML content may visually appear shorter). Displays a "Show More" link to expand the cell text.

### `showMoreTitle` & `showLessTitle`

* **Default:** `'Show More'`
* **Example:**
```javascript
showMoreTitle: 'Expand',
showLessTitle: 'Collapse',

```

Customizes the label titles used next to truncated text cells when `truncateText` is active.

### `linkTab`

* **Default:** `'blank'`
* **Example:** `linkTab: 'self',`

Determines whether HighQ Hyperlink columns open in a new browser tab (`'blank'`) or the current tab (`'self'`).

### `progressColumns`

* **Default:** `'false'`
* **Example:**
```javascript
progressColumns: '1,5',
progressColorComplete: 'green',
progressColor: 'blue',
progressColorExceeded: 'red',
progress3d: 'true',

```

Converts target Number columns (representing percentages) into dynamic progress bars. Accepts a single column number or a comma-separated list of column numbers (starting from `0`). Colors and 3D rendering styles can be customized with the associated sub-options.

### `freezeColumns`

* **Default:** `'false'`
* **Example:** `freezeColumns: '2',`

Freezes the specified number of columns from the left side of your table and automatically sets `flexColumns` to `'false'`. As users scroll horizontally, the frozen left column(s) remain anchored in place while the rest of the table scrolls underneath.

### `clickHighlight`

* **Default:** `'false'`
* **Example:** `clickHighlight: 'true',`

When working with wider tables (`flexColumns: 'false'`), this option allows users to click on any row to highlight it, making horizontal scrolling easier to track across columns.

### `addItemButton`

* **Default:** `'false'`
* **Example:**
```javascript
addItemButton: 'true',
addItemTitle: 'New Matter',

```

Enables an "Add Record" button above the table allowing authorized users to create a new iSheet record. The table automatically refreshes once the new item modal is closed. `addItemTitle` customizes the label on the button.

### `choiceBadges`

* **Default:** `'true'`
* **Example:**
```javascript
choiceBadges: 'true',
showDefaultChoiceBadges: 'false',

```

HighQ Choice columns with custom colors configured in the iSheet settings automatically render as visual badges. Setting `showDefaultChoiceBadges` to `'true'` forces choices using HighQ's default black text color to display as styled badges as well.