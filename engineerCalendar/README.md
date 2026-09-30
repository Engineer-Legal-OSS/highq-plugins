# EngineerCalendar Documentation

**EngineerCalendar** allows the presentation of calendars directly from HighQ iSheet and Task metadata in Home or Wiki pages without the use of the HighQ events module.

---

## Table of Contents
- [Adding a Calendar to a HighQ Site](#adding-a-calendar-to-a-highq-site)
- [Modifying Options](#modifying-options)
- [Advanced Configuration](#advanced-configuration)
  - [Required Options](#required-options)
  - [Configuration Options](#configuration-options)

---

## Adding a Calendar to a HighQ Site

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
   - Create a view called **"Calendar View"**.
   - Ensure only the columns required for the calendar are included in this view, then save.

### Add to Your Home/Wiki Page

1. Edit the target Home or Wiki panel and switch to **Source view**.
2. Add a link to your created iSheet view using the rich text editor link function.
3. In **Source view**, paste the following standard snippet **replacing the flag_ urls with your own EngineerLegal-plugins and EngineerCore urls**:

```html
<div id="calendarContainer1">
  <script>
    engineerLegal({
      container: 'calendarContainer1',
      plugin: 'calendar',
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

For example, if you wanted to hide the time of events from the calendar UI we can use the "showTime" option.

We would add a new line to the code above, add our option, then a colon (:) then a single quote (‘) then the word false, then another single quote and comma. The default is 'true' but if all our events are considered to be all day events then we can disable the times. This would look like:

```javascript
  engineerLegal({
  container: 'container1',
  showTime: 'false’, 
  });
```

# Advanced Configuration

This section lists all the possible options that can be used to modify the standard behavior. See the "Modifying Options" section for instructions on using these.

---

## Required Options

The options below **MUST** be included for the chart to load.

### `container`
* **Example:** `container: 'calendarContainer1',`

Tells the code where you want the chart to appear on your page. It requires a corresponding HTML element similar to `<div id="calendarContainer1">&nbsp;</div>` somewhere on the page. This `div` element can use any term between the quotes in the `id=` attribute as long as it corresponds exactly with the `container` option value.

### `plugin`
* **Example:** `plugin: 'calendar',`

Tells the code which plugin to launch

---

## Configuration Options

The options below can be used to modify the behavior or look and feel of the chart. They do not need to be set and can be removed to return them to their defaults.

### `nameColumn`
* **Default:** `'0'`
* **Example:** `nameColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column), the value in that column will be displayed in the event pills on the calendar.

### `otherColumns`
* **Default:** `'false'`
* **Example:** `otherColumns: '4,6,8',`

When set to a number or comma-separated list of numbers corresponding to columns in the iSheet view (starting from `0` for the leftmost column), those columns will also be displayed as new lines on the event pill.

### `statusColumn`
* **Default:** `'auto'`
* **Example:** `statusColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a choice column type, the colors from this column's selected choice will be used to color each event.

### `defaultEventColor`
* **Default:** `'#0a1431'`
* **Example:** `defaultEventColor: 'navy',`

If no status column is created, this determines the default color of each event in the calendar.

### `startDateColumn`
* **Default:** `'auto'`
* **Example:** `startDateColumn: '3',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a date column type, the value from this column will be used for the date of each event in the calendar. This is useful if your "Start Date" column in your iSheet must be called something else.

### `multiDayMode`
* **Default:** `'false'`
* **Example:** `multiDayMode: 'true',`

When set to `true` and your iSheet data contains both a Start Date and End Date column (i.e. a Task Metadata iSheet), then events will span multiple days on the calendar.

### `endDateColumn`
* **Default:** `'auto'`
* **Example:** `endDateColumn: '4',`

When set to a number corresponding to a column in the iSheet view (starting from `0` for the leftmost column) which **MUST** be a date column type AND multiDayMode above is set to `true`, the value from this column will be used for the end date of each event in the calendar. This is useful if your "End Date" column in your iSheet must be called something else.


### `taskSearch`
* **Default:** `'false'`
* **Example:** `taskSearch: '0',`

When set to a number corresponding to a column in the iSheet, clicking on a bar will open the HighQ site Tasks module and pre-filter the results based on the value in the column for this panel. If the column contains a task name, for example, then all tasks matching that name will be displayed.

### `eventLinks`
* **Default:** `'false'`
* **Example:** `eventLinks: 'isheet',`

Adds a click action to each event in the calendar that can perform one of several actions depending on the option:
  * `eventLinks: 'viewItem',` — Opens the HighQ view item modal window for the record selected.
  * `eventLinks: 'print',` — Opens the HighQ print preview pane for the iSheet record selected.
  * `eventLinks: 'isheet',` — Navigates to the iSheet view filtered to just show the record selected.
  * `eventLinks: 'default',` — Navigates to the iSheet of the record selected, but using the default view instead of the view chosen for the table.

### `linkTab`
* **Default:** `'blank'`
* **Example:** `linkTab: 'self',`

Determines if links from a clicked panel should open in the same tab (`'self'`) or a new tab (`'blank'`).

### `maxEventsPerDay`
* **Default:** `'0'`
* **Example:** `maxEventsPerDay: '5',`

For calendars with lots of events per day, use this option to display only the first *n* number of events. The rest will be accessible by clicking the expand button below the event list. Setting to the default of `0` will not hide any events.

### `weekStart`
* **Default:** `'0'`
* **Example:** `weekStart: '1',`

Determines which day of the week should be the leftmost on the calendar:
  * `0` = Sunday (US market)
  * `1` = Monday (European market)
  * `6` = Saturday (Middle East)

### `showTime`
* **Default:** `'true'`
* **Example:** `showTime: 'false',`

Determines if the events should show a time of the event or hide it.

### `use24hTime`
* **Default:** `'true'`
* **Example:** `use24hTime: 'false',`

If `showTime` above is set to `true`, determines if the time format should be 24h (`true`) or 12h (`false`).

### `showLegend`
* **Default:** `'true'`
* **Example:** `showLegend: 'false',`

If set to `false`, the legend describing the event colors will be hidden.

### `labelTooltips`
* **Default:** `'false'`
* **Example:** `labelTooltips: 'true',`

If set to `true`, the title of an event on the calendar will pop out above the event pill when the mouse hovers over it.

### `tooltipOtherColumns`
* **Default:** `'false'`
* **Example:** `tooltipOtherColumns: '1,4',`

Displays the values of other columns from your data on the event tooltip when `labelTooltips` is set to `true`. To display multiple column values, add their column position in your view as a comma-separated list. The first column is column `0`, the second is `1`, etc.

### `useAllDateColumns`
* **Default:** `'false'`
* **Example:** `useAllDateColumns: 'true',`

If set to `true`, the calendar will generate events for each date column in the iSheet view. The event names will be a concatenation of the row name from the `nameColumn` above and the iSheet column name (e.g., `Case 001 - Trial Date`).

### `eventNameHeaderPosition`
* **Default:** `'after'`
* **Example:** `eventNameHeaderPosition: 'none',`

If `useAllDateColumns` is set to `true`, this positions the date column name in the title of the event (`'before'` or `'after'`), or removes it when set to `'none'`.

### `eventColumnColors`
* **Default:** `'#0075c2', '#28a745', '#ffc107', '#dc3545'`
* **Example:** `eventColumnColors: '#ddd,#bbc,#eea,#ace',`

When `useAllDateColumns` is `true`, this option sets a color for the events from each date column as they appear from left to right in the iSheet view. By default 5 date columns will be handled, but an unlimited number can be handled. Ensure colors are comma-separated with no spaces.

### `titleSize`
* **Default:** `'1rem'`
* **Example:** `titleSize: '18px',`

Sets the font size of each event title.

### `otherColumnSize`
* **Default:** `'0.9rem'`
* **Example:** `otherColumnSize: '18px',`

Sets the font size of any values added using the `otherColumns` option.

### `hideEventsWithoutDates`
* **Default:** `'false'`
* **Example:** `hideEventsWithoutDates: 'true',`

By default, events with no value in the date column will be loaded on the calendar as appearing on the current date (this will update to the user's "today" each day) to prevent deadlines being missed. It is recommended to remove values where the date is blank from the iSheet view, but if that isn't possible, you can hide these events with this option.