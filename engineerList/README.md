# EngineerList Documentation

**EngineerList** allows the presentation of iSheet data into an attractive panel layout in HighQ Home or Wiki pages.

---

## Table of Contents
- [Adding a list to a HighQ Site](#adding-a-list-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a List to a HighQ Site

### Requirements
- **Plugin installed**: The plugin files must be in your System File Library and correctly referenced in your Plugin Config File
- **iSheets** module enabled
- **Home** or **Wiki** module active on your site

### Required iSheet Structure

1. **Create an iSheet**:
   - **Column 1 (Single line text)**: This will be the title of each panel in the layout.
   - **Optional Columns**: Status (Choice column).
2. **Create an iSheet View**:
   - Create a view called **"List View"**.
   - Ensure only the columns required for the list are included in this view, then save.

### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="listContainer1">
  <script>
    engineerLegal({
      container: 'listContainer1',
      plugin: 'list',
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

For example, if you wanted to change the text on the button that switches between your choice columns we can use the buttonText option. 

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then your new button text then another single quote and comma. 

```javascript
  engineerLegal({
  container: 'container1',
  buttonText: 'Select Layer', 
  });
```

# Advanced Configuration

This section lists all the possible options that can be used to modify the standard behavior of the list. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the list to load.

### `container`
* **Example:** `container: 'listContainer1',`

Tells the code where you want the list to appear on your page. It requires a corresponding HTML element similar to `<div id="listContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `plugin`
* **Example:** `plugin: 'list',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the list. They do not need to be set and can be removed to return them to their defaults.

### `nameColumn`
* **Default:** `'0'`
* **Example:** `nameColumn: '2',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column), the value in that column will be displayed as the main title for each list item.

### `otherColumns`
* **Default:** `'false'`
* **Example:** `otherColumns: '3,4,5',`

When set to a number or comma-separated list of numbers corresponding to columns in the iSheet view (starting from `0` for the leftmost column), those column values will be displayed as additional details under each list item.

### `isChoropleth`
* **Default:** `'false'`
* **Example:** `isChoropleth: 'true',`

EngineerList can be used to show the number of times a State/Region/Entity occurs in your iSheet. It can then link through to a filtered view of the iSheet showing the matching rows when a panel is clicked. Create an iSheet and View with at only a ‘Choice” type column that will be show on your panels, the number of occurrences of this choice will be show on each panel. You can add any other columns you need after the choice column above; perhaps to show information about each case, property, or claimant in the portfolio. 

### `showOtherColumnHeaders`
* **Default:** `'true'`
* **Example:** `showOtherColumnHeaders: 'false',`

Controls whether the column header titles are shown alongside the extra field values defined in `otherColumns`.

### `statusColumn`
* **Default:** `'auto'`
* **Example:** `statusColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a choice column type, the choice colors will be used to display a status badge/pill on each list item.

### `backgroundColorColumn`
* **Default:** `'false'`
* **Example:** `backgroundColorColumn: '4',`

Must be a HighQ choice column. Sets the background color for each list card based on the color associated with the selected choice value.

### `groupColumn`
* **Default:** `'false'`
* **Example:** `groupColumn: '1',`

When set to a column number in the iSheet view, list items will be grouped into expandable/collapsible categories based on the values in this column.

### `enableSearch`
* **Default:** `'false'`
* **Example:** `enableSearch: 'true',`

Adds a search filter input box above the list to allow real-time filtering of items.

### `exportButton`
* **Default:** `'false'`
* **Example:** `exportButton: 'true',`

Displays an export button in the toolbar above the list.

### `fullscreenButton`
* **Default:** `'false'`
* **Example:** `fullscreenButton: 'true',`

Adds a button to expand the list view into full-screen mode.

### `panelLinks`
* **Default:** `'false'`
* **Example:** `panelLinks: 'viewItem',`

Adds a click action to each list item to perform one of several actions:
  * `panelLinks: 'viewItem',` — Opens the HighQ view item modal window for the selected record.
  * `panelLinks: 'isheet',` — Navigates to the iSheet view filtered to show only the selected record.
  * `panelLinks: 'default',` — Navigates to the iSheet default view for the selected record.

> Additional `panelLinks` options are available if EngineerTable is used (see the [Table Options] section).

### `linkTab`
* **Default:** `'blank'`
* **Example:** `linkTab: 'self',`

Determines whether links opened from clicked items open in the current tab (`'self'`) or a new tab (`'blank'`).

### `listStyle`
* **Default:** `'list'`
* **Example:** `listStyle: 'cards',`

Defines the layout format for displaying items. Options include:
  * `'list'` — Standard vertical list layout.
  * `'cards'` — Grid card layout.

### `titleSize`
* **Default:** `'1rem'`
* **Example:** `titleSize: '18px',`

Sets the font size of the main item titles.

### `otherColumnSize`
* **Default:** `'0.9rem'`
* **Example:** `otherColumnSize: '14px',`

Sets the font size for secondary detail values added via `otherColumns`.

### `showLegend`
* **Default:** `'true'`
* **Example:** `showLegend: 'false',`

Hides or shows the color legend bar when a status or background color column is active.

### `contactCards`
* **Default:** `'false'`
* **Example:** `contactCards: 'true',`

If your first column in your iSheet view is a user lookup type column, this will create a contact card for that user in each panel. Use this with care, as HighQ permissions can impact the ability for the code to display user contact data.


## Table Options

Using these options requires **EngineerTable** to be installed in your HighQ instance.

### `panelLinks`

* **Default:** `'false'`
* **Example:** `panelLinks: 'table',`

Adds a click action to each panel that performs an action in EngineerTable based on the value:

* `'table'` – Shows details for the clicked panel in EngineerTable.
* `'compare'` – Shows details for the clicked panel alongside any previously clicked panels (clicking again removes it).
* `'filter'` – Shows all panel details in EngineerTable, then acts like `'compare'` thereafter, removing rows when panels are clicked.
* `'tableAll'` – Shows all region details in EngineerTable, then acts like `'compare'` thereafter, first clearing the table.

### `showTableFilters`

* **Default:** `'false'`
* **Example:** `showTableFilters: 'true',`

Adds a collabsible column filter above the table allowing the user to select which columns they want to see.

### Configuring EngineerTable Below Your Map

By default, EngineerTable loads directly below EngineerMap in its default configuration. To modify the table, nest options within `tableOptions: { }`:

```javascript
mapLinks: 'table',  
tableOptions: {
    recordLinks: 'viewItem',
    transposeTable: 'true',
},

```
> **Note:** Any other EngineerTable options can also be added to your tableOptions. Review the EngineerTable documentation.