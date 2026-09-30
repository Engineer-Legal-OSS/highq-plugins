/* EngineerGantt - a HighQ plugin

Copyright (c) 2026 Engineer-Legal-OSS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

This plugin features portions of code under MIT license from http://taitems.github.io/jQuery.Gantt/ 
*/

var engineerGanttVersion = '5.0.0';

function engineerGantt(userOptions) {
    if ($e('#engineerganttstyles').length == 0) {
        $e('<style id=engineerganttstyles>.fn-gantt { width: 100% } .fn-gantt .legend-item{display: inline-block; margin-right: 5px;}  .fn-gantt .fn-content { overflow: hidden; position: relative; width: 100% } .fn-gantt .row { float: left; height: 24px; line-height: 24px; margin: 0 } .fn-gantt .leftPanel { float: left; overflow: hidden; border-right: 1px solid #ddd; position: relative; z-index: 3 } .fn-gantt .leftPanel .fn-label { margin: 0 0 0 5px; color: #484a4d; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; display: block; } .fn-gantt .leftPanel .row { border-bottom: 1px solid #ddd } .fn-gantt .leftPanel .header { font-weight: 700; text-decoration: underline } .fn-gantt .leftPanel .desc { float: left; height: 24px; width: 100px; background-color: #f6f6f6 } .fn-gantt .leftPanel .name { height: 24px; width: 100px; background-color: #f6f6f6; font-weight: 700; display: block; clear: left } .fn-gantt .leftPanel .fn-wide, .fn-gantt .leftPanel .fn-wide .fn-label { width: 100px } .fn-gantt .leftPanel .spacer { background-color: #f6f6f6; width: 100% } .fn-gantt .rightPanel { overflow: hidden } .fn-gantt .dataPanel { margin-left: 0; outline: 1px solid #ddd; background-size: 24px 24px; background-image: linear-gradient(to left, rgba(221, 221, 221, .7) 1px, transparent 1px), linear-gradient(to top, rgba(221, 221, 221, .7) 1px, transparent 1px); background-repeat: repeat; position: relative } .fn-gantt .day, .fn-gantt .date { overflow: visible; width: 24px; line-height: 24px; text-align: center; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; font-size: 11px; color: #484a4d; text-align: center } .fn-gantt .sa, .fn-gantt .sn, .fn-gantt .wd { height: 24px; text-align: center } .fn-gantt .sa, .fn-gantt .sn { color: #939496; background-color: #f5f5f5; text-align: center } .fn-gantt .wd { background-color: #f6f6f6; text-align: center } .fn-gantt .holiday { background-color: #ffd263; height: 24px } .fn-gantt .today { background-color: #fff8da; height: 24px; font-weight: 700; text-align: center } .fn-gantt .rightPanel .month, .fn-gantt .rightPanel .year { float: left; overflow: hidden; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; height: 24px; background-color: #f6f6f6; font-weight: 700; font-size: 11px; color: #484a4d; text-align: center } .fn-gantt-hint { border: 5px solid #edc332; background-color: #fff5d4; padding: 10px; position: absolute; display: none; z-index: 3; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px } .fn-gantt .bar { height: 18px; margin: 0 3px 3px 0; position: absolute; z-index: 2; text-align: center; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px } .fn-gantt .bar.subtask::before { content: "└"; position: absolute; left: -11px; display: block; } .fn-gantt .bar .fn-label { line-height: 18px; font-weight: 700; white-space: nowrap; width: 100%; text-overflow: ellipsis; overflow: hidden; text-align: center; font-size: 11px } .fn-gantt .ganttGreen { background-color: #d8eda3 } .fn-gantt .ganttGreen .fn-label { color: #778461 !important } .fn-gantt .navcontainer { clear: both; background-color: #fff; width: 100% } .fn-gantt .navigate { border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; min-height: 37px } .fn-gantt .navigate .page-group { display: inline-block; margin-right: 10px } .fn-gantt .navigate .scroll-group { display: inline-block; margin-right: 10px } .fn-gantt .navigate .nav-now { margin-right: 10px } .fn-gantt .navigate .nav-subtasks { margin-left: 10px } .fn-gantt .navigate .nav-export { margin-left: 10px } .fn-gantt .navigate .nav-slider { height: 20px; display: inline-block } .fn-gantt .navigate .nav-slider-left, .fn-gantt .navigate .nav-slider-right { text-align: center; height: 20px; display: inline-block } .fn-gantt .navigate .nav-slider-left { float: left } .fn-gantt .navigate .nav-slider-right { float: right } .fn-gantt .navigate .nav-slider-content { text-align: left; width: 160px; height: 10px; display: inline-block; margin: 7px 10px } .fn-gantt .navigate .nav-slider-bar, .fn-gantt .navigate .nav-slider-button { position: absolute; display: block; color: #fff } .fn-gantt .navigate .nav-slider-bar { width: 155px; height: 6px; background-color: #838688; margin: 10px 0 0; -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, .6) inset; -moz-box-shadow: 0 1px 3px rgba(0, 0, 0, .6) inset; box-shadow: 0 1px 3px rgba(0, 0, 0, .6) inset; border-radius: 3px } .fn-gantt .navigate .nav-slider-button { width: 27px; height: 21px; background-color: #aaa; border-radius: 10px; border: #000 solid 1px; margin: -7px 0 0; cursor: pointer; text-align: center; text-decoration: none; font-weight: 700; letter-spacing: .1ch; line-height: 18px } .fn-gantt .navigate .nav-slider-button-text { margin-top: auto; margin-bottom: auto } .fn-gantt .navigate .page-number { display: inline-block; font-size: 10px; height: 20px } .fn-gantt .navigate .page-number span { color: #666; margin: 0 6px; height: 20px; line-height: 20px; display: inline-block } .fn-gantt-loader { position: absolute; width: 100%; height: 100%; left: 0; top: 0; background: rgba(0, 0, 0, .75); cursor: wait; z-index: 4 } .fn-gantt-loader-spinner span { position: absolute; margin: auto; top: 0; right: 0; bottom: 0; left: 0; width: 100%; text-align: center; height: 1em; line-height: 1em; color: #fff; font-size: 1em; font-weight: 700 } .row:after { clear: both } .fn-gantt h6.popover-title { margin: 0px; } .fn-gantt .bar.critical { box-shadow: inset 0 0 0 2px rgba(255,0,0,0.12); border: 2px solid #c00 } .fn-gantt .leftPanel .fn-label.critical { color: #c00; font-weight: 800 }</style>').appendTo('head');
    }
    const UTC_DAY_IN_MS = 24 * 60 * 60 * 1000;
    const scales = ['hours', 'days', 'weeks', 'months'];
    let rawXmlData;
    let hasSubTasks;

    let options = new GanttOptions(userOptions);
    window.engineerLegalPlugins.gantt[options.container] = options;

    function GanttOptions(customOptions) {
        // src to always get the latest version of the script
        this.engineerGanttSrc = window.engineerGanttSrc;
        //this.holidays = [],
        // paging
        this.itemsPerPage = customOptions.itemsPerPage ? Number.parseInt(customOptions.itemsPerPage) : '100';
        // localisation
        this.dow = customOptions.dow ? customOptions.dow : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        this.months = customOptions.months ? customOptions.months : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.waitText = customOptions.waitText ? customOptions.waitText : 'Loading...';
        // navigation - buttons or scroll
        this.navigate = customOptions.navigate ? customOptions.navigate : 'scroll';
        this.scrollToToday = customOptions.scrollToToday ? customOptions.scrollToToday : 'false';
        this.scrollWheelNavigation = customOptions.scrollWheelNavigation ? customOptions.scrollWheelNavigation : 'true';
        this.exportButton = customOptions.exportButton ? customOptions.exportButton : 'false';
        // scale parameters
        this.scale = customOptions.scale ? customOptions.scale : 'weeks';
        this.maxScale = customOptions.maxScale ? customOptions.maxScale : 'months';
        this.minScale = customOptions.minScale ? customOptions.minScale : 'days';
        this.monthView = customOptions.monthView ? customOptions.monthView : 'initial'; //initial - number - short
        // callbacks
        this.onItemClick = function (data) { return; };
        //this.onAddClick = function (dt, rowId) { return; };
        this.onRender = $e.noop;
        // page and data
        this.container = customOptions.container ? customOptions.container : null;
        if (!this.container) {
            throw new Error('Option `container` is requred.');
        }
        this.iSheetViewLink = customOptions.listViewLink ? customOptions.listViewLink : null;
        if (!this.iSheetViewLink) {
            this.iSheetViewLink = customOptions.iSheetViewLink ? customOptions.iSheetViewLink : null;
        }
        if (!this.iSheetViewLink) {
            try {
                this.iSheetViewLink = engineercore_getLink(this.container);
            } catch (error) {
                console.log('Cannot use getLink, requires engineerCore version 1.2.1');
            }
        }
        this.iSheetViewUrl = new URL(this.iSheetViewLink);
        this.siteID = this.iSheetViewUrl.searchParams.get('metaData.siteID');
        this.sheetID = this.iSheetViewUrl.searchParams.get('metaData.sheetId');
        this.sheetViewID = this.iSheetViewUrl.searchParams.get('metaData.sheetViewID');
        this.nameColumn = customOptions.nameColumn ? customOptions.nameColumn : '0';
        this.labelColumn = customOptions.labelColumn ? customOptions.labelColumn : this.nameColumn;
        this.statusColumn = customOptions.statusColumn ? customOptions.statusColumn : 'auto';
        this.showLegend = customOptions.showLegend ? customOptions.showLegend : 'auto';
        this.criticalPath = customOptions.criticalPath ? customOptions.criticalPath : 'false';
        this.defaultBarColor = customOptions.defaultBarColor ? customOptions.defaultBarColor : '#0a1431';
        this.groupBarColor = customOptions.groupBarColor ? customOptions.groupBarColor : '#000000';
        this.listBarColor = customOptions.listBarColor ? customOptions.listBarColor : '#dcdcdc';
        this.defaultTitle = customOptions.defaultTitle ? customOptions.defaultTitle : 'No Status';
        this.labelTooltips = customOptions.labelTooltips ? customOptions.labelTooltips : 'false';

        this.startDateColumn = customOptions.startDateColumn ? customOptions.startDateColumn : 'auto';
        this.dueDateColumn = customOptions.dueDateColumn ? customOptions.dueDateColumn : 'auto';
        this.otherColumns = customOptions.otherColumns ? customOptions.otherColumns : 'false';
        this.durationColumn = customOptions.durationColumn ? customOptions.durationColumn : 'auto';

        this.listColumn = customOptions.listColumn ? customOptions.listColumn : 'auto';
        this.groupColumn = customOptions.groupColumn ? customOptions.groupColumn : 'false';
        this.groupType = customOptions.groupType ? customOptions.groupType : 'nested';
        if (this.groupType == 'line') {
            this.listColumn = 'false';
        }
        this.showSubtasks = customOptions.showSubtasks ? customOptions.showSubtasks : 'true';
        this.parentTaskColumn = customOptions.parentTaskColumn ? customOptions.parentTaskColumn : 'auto';
        this.dependentColumn = customOptions.dependentColumn ? customOptions.dependentColumn : 'false';
        this.subtaskType = customOptions.subtaskType ? customOptions.subtaskType : 'auto'; //choice OR taskid
        this.customLeftPanel = customOptions.customLeftPanel ? customOptions.customLeftPanel : 'false';

        // ISO week starts with Monday (1); use Sunday (0) for, e.g., North America
        this.firstDay = customOptions.firstDay ? customOptions.firstDay : '1';
        // ISO week one always contains 4 Jan; use 1 Jan for, e.g., North America
        this.weekOneDate = customOptions.weekOneDate ? customOptions.weekOneDate : '4';

        this.chartLinks = customOptions.chartLinks ? customOptions.chartLinks : 'false';
        this.taskSearch = customOptions.taskSearch ? customOptions.taskSearch : 'false';
        // Possible values are blank or self
        this.linkTab = customOptions.linkTab ? customOptions.linkTab : 'blank';
    }

    // custom selector `:findday` used to match on specified day in ms.
    //
    // The selector is passed a date in ms and elements are added to the
    // selection filter if the element date matches, as determined by the
    // id attribute containing a parsable date in ms.
    function findDay(elt, text) {
        let cd = new Date(Number.parseInt(text, 10));
        cd.setHours(0, 0, 0, 0);
        let id = $e(elt).attr('id') || '';
        let si = id.indexOf('-') + 1;
        let ed = new Date(Number.parseInt(id.substring(si, id.length), 10));
        ed.setHours(0, 0, 0, 0);
        return cd.getTime() === ed.getTime();
    }
    $e.expr.pseudos.findday = $e.expr.createPseudo ?
        $e.expr.createPseudo(function (text) {
            return function (elt) {
                return findDay(elt, text);
            };
        }) :
        function (elt, i, match) {
            return findDay(elt, match[3]);
        };

    // custom selector `:findweek` used to match on specified week in ms.
    function findWeek(elt, text) {
        let cd = new Date(Number.parseInt(text, 10));
        let y = cd.getFullYear();
        let w = cd.getWeekOfYear();
        let m = cd.getMonth();
        if (m === 11 && w === 1) {
            y++;
        } else if (!m && w > 51) {
            y--;
        }
        cd = y + '-' + w;
        let id = $e(elt).attr('id') || '';
        let si = id.indexOf('-') + 1;
        let ed = id.substring(si, id.length);
        return cd === ed;
    }
    $e.expr.pseudos.findweek = $e.expr.createPseudo ?
        $e.expr.createPseudo(function (text) {
            return function (elt) {
                return findWeek(elt, text);
            };
        }) :
        function (elt, i, match) {
            return findWeek(elt, match[3]);
        };

    // custom selector `:findmonth` used to match on specified month in ms.
    function findMonth(elt, text) {
        let cd = new Date(Number.parseInt(text, 10));
        cd = cd.getFullYear() + '-' + cd.getMonth();
        let id = $e(elt).attr('id') || '';
        let si = id.indexOf('-') + 1;
        let ed = id.substring(si, id.length);
        return cd === ed;
    }
    $e.expr[':'].findmonth = $e.expr.createPseudo ?
        $e.expr.createPseudo(function (text) {
            return function (elt) {
                return findMonth(elt, text);
            };
        }) :
        function (elt, i, match) {
            return findMonth(elt, match[3]);
        };

    // Date prototype helpers
    // ======================
    // `getWeekId` returns a string in the form of 'dh-YYYY-WW', where WW is
    // the week # for the year.
    // It is used to add an id to the week divs
    Date.prototype.getWeekId = function () {
        let y = this.getFullYear();
        let w = this.getWeekOfYear();
        let m = this.getMonth();
        if (m === 11 && w === 1) {
            y++;
        } else if (!m && w > 51) {
            y--;
        }
        return 'dh-' + y + '-' + w;
    };

    // `getRepDate` returns the milliseconds since the epoch for a given date
    // depending on the active scale
    Date.prototype.getRepDate = function (scale) {
        switch (scale) {
            case 'weeks':
                return this.getDayForWeek().getTime();
            case 'months':
                return new Date(this.getFullYear(), this.getMonth(), 1).getTime();
            case 'days':
            case 'hours':
            default:
                return this.getTime();
        }
    };

    // `getDayOfYear` returns the day number for the year
    Date.prototype.getDayOfYear = function () {
        let year = this.getFullYear();
        return (Date.UTC(year, this.getMonth(), this.getDate()) -
            Date.UTC(year, 0, 0)) / UTC_DAY_IN_MS;
    };

    // `getWeekOfYear` returns the week number for the year
    Date.prototype.getWeekOfYear = function () {
        let year = this.getFullYear(),
            month = this.getMonth(),
            date = this.getDate(),
            day = this.getDay();
        let diff = options.weekOneDate - day;
        if (day < options.firstDay) {
            diff -= 7;
        }
        if (diff + 7 < options.weekOneDate - options.firstDay) {
            diff += 7;
        }
        return Math.ceil(new Date(year, month, date + diff).getDayOfYear() / 7);
    };

    // `getDayForWeek` returns the first day of this Date's week
    Date.prototype.getDayForWeek = function () {
        let day = this.getDay();
        let diff = (day < options.firstDay ? -7 : 0) + options.firstDay - day;
        return new Date(this.getFullYear(), this.getMonth(), this.getDate() + diff);
    };


    //Creates a new iSheet URL with the specified parameters. 
    function buildISheetUrl(basePath, itemId, removeSheetId, extraParams) {
        const url = new URL(options.iSheetViewLink.replace('sheetViewExportXML', basePath));
        url.searchParams.delete('metaData.isheetExportType');
        url.searchParams.set('metaData.itemId', itemId);
        if (removeSheetId) {
            url.searchParams.delete('metaData.sheetViewID');
        }
        if (extraParams) {
            for (let extraParam in extraParams) {
                if (extraParams[extraParam]) {
                    url.searchParams.set(extraParam, extraParams[extraParam]);
                }
            }
        }
        return url.toString();
    }

    //Query a choice column style with back-compatiblity between engineerCore versions
    function getChoiceTypeColumnStyle(rawData) {
        let style = '';
        if (rawData.choice) {
            if (rawData.choice[0]) {
                style = rawData.choice[0].style.substr(-7);
            } else {
                style = rawData.choice.style.substr(-7);
            }
        }
        return style;
    }

    function locateParentTask(taskTitle) {
        for (const element of rawXmlData.view.data.item) {
            let item = element;
            if (item.column[options.nameColumn].displayData.cdata == taskTitle) {
                return item.itemID.cdata;
            }
        }
    }

    // Core object is responsible for navigation and rendering
    let core = {
        create: function (element) {
            engineercore_loadDoc(options.iSheetViewLink, parseData);
            function parseData(xmlDoc) {
                rawXmlData = xmlToObj(xmlDoc);
                let listData = [];
                let listMap = new Map();
                let groupMap = new Map();
                let firstDateColumn;
                let secondDateColumn;
                if (options.parentTaskColumn != 'auto' && options.subtaskType == 'auto') {
                    options.subtaskType = 'choice';
                }
                if (rawXmlData.view.head?.headColumn) {
                    for (let i = 0; i < rawXmlData.view.head.headColumn.length; i++) {
                        let header = rawXmlData.view.head.headColumn[i];
                        if (header.columnValue.cdata.toUpperCase() === 'START DATE' && options.startDateColumn == 'auto') {
                            options.startDateColumn = i.toString();
                        }
                        if (header.columnValue.cdata.toUpperCase() === 'DUE DATE' && options.dueDateColumn == 'auto') {
                            options.dueDateColumn = i.toString();
                        }
                        if (header.columnValue.cdata.toUpperCase() === 'LIST' && options.listColumn == 'auto') {
                            options.listColumn = i.toString();
                        }
                        if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_CHOICE' && options.statusColumn == 'auto' && header.columnValue.cdata != 'Priority' && header.columnValue.cdata != 'List') {
                            options.statusColumn = i;
                        }
                        if (!firstDateColumn && header.columnTypeAlias === 'SHEET_COLUMN_TYPE_DATE_AND_TIME') {
                            firstDateColumn = i;
                        }
                        if (firstDateColumn && header.columnTypeAlias === 'SHEET_COLUMN_TYPE_DATE_AND_TIME') {
                            secondDateColumn = i;
                        }
                        // AUTO SET PARENT TASK COLUMN IF HIGHQ ADDS TASK ID DATA TO ISHEET
                        if (header.columnValue.cdata.toUpperCase() === 'PARENT TASK ID' && options.parentTaskColumn == 'auto') {
                            options.parentTaskColumn = i.toString();
                            options.subtaskType = 'taskid';
                        }
                        if (header.columnValue.cdata.toUpperCase() === 'DURATION' && options.durationColumn == 'auto') {
                            options.durationColumn = i.toString();
                        }
                    }
                }
                if (options.startDateColumn == 'auto') {
                    if (firstDateColumn >= 0) {
                        options.startDateColumn = firstDateColumn.toString();
                        console.log('Using auto start date column: ' + firstDateColumn);
                    } else {
                        throw Error('Unable to locate a task start date, please include a date column in your iSheet view');
                    }
                }
                if (options.dueDateColumn == 'auto') {
                    if (secondDateColumn >= 0) {
                        options.dueDateColumn = secondDateColumn.toString();
                        console.log('Using auto due date column: ' + secondDateColumn);
                    } else {
                        options.dueDateColumn = firstDateColumn.toString();
                    }
                }
                if (rawXmlData.view.data?.item) {
                    let iDColumn;
                    if (options.nameColumn == 'false') {
                        iDColumn = '0';
                    } else {
                        iDColumn = options.nameColumn;
                    }
                    let ganttPos = 0;

                    // Run date resolution so subsequent lookups find computed values
                    resolveDerivedDates(rawXmlData.view.data.item, iDColumn);
                    console.log('Resolved derived dates based on duration and dependencies:', rawXmlData.view.data.item);

                    for (const element of rawXmlData.view.data.item) {
                        let row = element;
                        let parentTask;
                        let isSubTask;
                        let rowColor;
                        if (options.statusColumn == 'auto') {
                            rowColor = options.defaultBarColor;
                        } else {
                            rowColor = getChoiceTypeColumnStyle(row.column[options.statusColumn].rawData);
                            if (!rowColor) {
                                rowColor = options.defaultBarColor;
                            }
                        }
                        if (options.parentTaskColumn != 'auto') {
                            if (options.subtaskType == 'choice') {
                                if (row.column[options.parentTaskColumn]?.displayData.cdata) {
                                    parentTask = locateParentTask(row.column[options.parentTaskColumn].displayData.cdata);
                                    if (parentTask) {
                                        hasSubTasks = true;
                                        isSubTask = true;
                                    }
                                }
                            } else if (options.subtaskType == 'taskid') {
                                if (row.column[options.parentTaskColumn]?.displayData.cdata) {
                                    if (Number.parseInt(row.column[options.parentTaskColumn].displayData.cdata, 10) > 0) {
                                        hasSubTasks = true;
                                        isSubTask = true;
                                    }
                                }
                            }
                        }

                        if (options.showSubtasks != 'true' && isSubTask) {
                            //skip
                        } else {
                            let inset = 0;
                            if (options.groupType == 'nested') {
                                if (options.groupColumn != 'false') {
                                    inset += 5;
                                }
                                if (options.listColumn != 'auto') {
                                    inset += 5;
                                }
                                if (isSubTask) {
                                    inset += 5;
                                }
                            }
                            // duration (days) from configured duration column (optional)
                            let durationDays = 0;
                            if (options.durationColumn != 'auto' && row.column[options.durationColumn]?.rawData?.cdata) {
                                durationDays = Number.parseInt(row.column[options.durationColumn].rawData.cdata, 10) || 0;
                            }

                            // resolve 'to' (due date) and compute 'from' using duration when available
                            let rawTo = (options.dueDateColumn != 'auto' && row.column[options.dueDateColumn]?.rawData) ? row.column[options.dueDateColumn].rawData.cdata : '';
                            let computedTo = rawTo || '';
                            // If to is blank, first attempt to calculate due date based on duration and start date, then attempt to resolve from dependent task due date
                            if (!computedTo && durationDays > 0 && options.startDateColumn != 'auto' && row.column[options.startDateColumn]?.rawData?.cdata) {
                                try {
                                    // inclusive duration: duration=1 => to==from
                                    const addDays = Math.max(0, durationDays - 1);
                                    computedTo = moment(row.column[options.startDateColumn].rawData.cdata).add(addDays, 'days').startOf('day').toISOString();
                                } catch (e) {
                                    // fallback to provided to date if parsing fails
                                }
                            }

                            if (!computedTo && options.dependentColumn != 'false' && row.column[options.dependentColumn]?.displayData?.cdata) {
                                let depName = row.column[options.dependentColumn].displayData.cdata;
                                for (const cand of rawXmlData.view.data.item) {
                                    if (cand.column[options.nameColumn]?.displayData && cand.column[options.nameColumn].displayData.cdata === depName) {
                                        if (options.dueDateColumn != 'auto' && cand.column[options.dueDateColumn]?.rawData?.cdata) {
                                            computedTo = cand.column[options.dueDateColumn].rawData.cdata;
                                        }
                                        break;
                                    }
                                }
                                if (!computedTo) {
                                    console.warn('Unable to resolve dependent to-date for "' + row.column[options.nameColumn].displayData.cdata + '" dependent="' + row.column[options.dependentColumn].displayData.cdata + '"');
                                }
                            }

                            // default from value (cell value) - may be overridden by duration+to
                            let computedFrom = (row.column[options.startDateColumn]?.rawData?.cdata) ? row.column[options.startDateColumn].rawData.cdata : '';
                            if (durationDays > 0 && computedTo) {
                                // durations are whole days and treated as inclusive (duration=1 => from==to)
                                let subtractDays = Math.max(0, durationDays - 1);
                                try {
                                    computedFrom = moment(computedTo).subtract(subtractDays, 'days').startOf('day').toISOString();
                                } catch (e) {
                                    // fallback to provided start date if parsing fails
                                }
                            }

                            let rowObj = {
                                id: ganttPos,
                                name: row.column[iDColumn].displayData.cdata,
                                leftColumns: [],
                                parentTask: parentTask,
                                itemId: row.itemID.cdata,
                                taskSearch: options.taskSearch == 'false' ? '' : row.column[options.taskSearch].displayData.cdata,
                                from: computedFrom || '',
                                to: computedTo || '',
                                duration: durationDays,
                                label: options.labelColumn != 'false' ? row.column[options.labelColumn].displayData.cdata : row.column[iDColumn].displayData.cdata,
                                dependent: options.dependentColumn != 'false' ? row.column[options.dependentColumn].displayData.cdata : '',
                                color: rowColor,
                                customClass: (isSubTask) ? 'subtask' : 'task',
                                leftPad: inset,
                            };

                            if (options.groupColumn != 'false') {
                                if (row.column[options.groupColumn]?.displayData.cdata) {
                                    if (!groupMap.has(row.column[options.groupColumn].displayData.cdata)) {
                                        groupMap.set(row.column[options.groupColumn].displayData.cdata, ganttPos);
                                        let groupFrom = computedFrom;
                                        let groupTo = computedTo || '';
                                        let rowObj = {
                                            id: ganttPos,
                                            name: row.column[options.groupColumn].displayData.cdata,
                                            leftColumns: [],
                                            parentTask: parentTask,
                                            itemId: '',
                                            taskSearch: options.taskSearch == '',
                                            from: groupFrom,
                                            to: groupTo,
                                            label: row.column[options.groupColumn].displayData.cdata,
                                            color: options.groupBarColor,
                                            customClass: 'taskgroup',
                                            leftPad: 0,
                                        };
                                        listData.push(rowObj);
                                        ganttPos++;
                                    } else {
                                        let idx = groupMap.get(row.column[options.groupColumn].displayData.cdata);
                                        let rowObjMoment = moment(listData[idx].from);
                                        let thisRecordStartDate = moment(computedFrom);
                                        if (thisRecordStartDate.isBefore(rowObjMoment)) {
                                            listData[idx].from = computedFrom;
                                        }
                                        if (computedTo) {
                                            rowObjMoment = moment(listData[idx].to);
                                            let thisRecordEndDate = moment(computedTo);
                                            if (thisRecordEndDate.isAfter(rowObjMoment)) {
                                                listData[idx].to = computedTo;
                                            }
                                        }
                                    }
                                }
                            }

                            if (options.listColumn != 'auto') {
                                if (isSubTask) {
                                    inset -= 5;
                                }
                                if (row.column[options.listColumn]?.displayData.cdata) {
                                    if (options.groupColumn == 'false' || row.column[options.groupColumn].displayData.cdata != row.column[options.listColumn].displayData.cdata) {
                                        if (!listMap.has(row.column[options.listColumn].displayData.cdata)) {
                                            listMap.set(row.column[options.listColumn].displayData.cdata, ganttPos);
                                            let listFrom = computedFrom;
                                            let listTo = computedTo || '';
                                            let rowObj = {
                                                id: ganttPos,
                                                name: row.column[options.listColumn].displayData.cdata,
                                                leftColumns: [],
                                                parentTask: parentTask,
                                                itemId: '',
                                                taskSearch: options.taskSearch == '',
                                                from: listFrom,
                                                to: listTo,
                                                label: row.column[options.listColumn].displayData.cdata,
                                                color: options.listBarColor, //progress bar gradient???
                                                customClass: 'tasklist',
                                                leftPad: inset - 5,
                                            };
                                            listData.push(rowObj);
                                            ganttPos++;
                                        } else {
                                            let idx = listMap.get(row.column[options.listColumn].displayData.cdata);
                                            let rowObjMoment = moment(listData[idx].from);
                                            let thisRecordStartDate = moment(computedFrom);
                                            if (thisRecordStartDate.isBefore(rowObjMoment)) {
                                                listData[idx].from = computedFrom;
                                            }
                                            if (computedTo) {
                                                rowObjMoment = moment(listData[idx].to);
                                                let thisRecordEndDate = moment(computedTo);
                                                if (thisRecordEndDate.isAfter(rowObjMoment)) {
                                                    listData[idx].to = computedTo;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (options.otherColumns != 'false') {
                                let additionalColumns = options.otherColumns.split(',');
                                additionalColumns.forEach(function (otherCol) {
                                    let columnType = rawXmlData.view.head.headColumn[otherCol].columnTypeAlias;
                                    switch (columnType) {
                                        case 'SHEET_COLUMN_TYPE_CHOICE': {
                                            let choiceContent = '';
                                            if (Array.isArray(row.column[otherCol].rawData.choice)) {
                                                row.column[otherCol].rawData.choice.forEach(choice => {
                                                    choiceContent += '<span style="' + choice.style + '">' + choice.cdata + '</span>';
                                                });
                                            } else {
                                                choiceContent += '<span style="' + (row.column[otherCol].rawData.length ? row.column[otherCol].rawData.choice.style : 'color:#000') + '">' + (row.column[otherCol].rawData.length ? row.column[otherCol].rawData.choice.cdata : ' ') + '</span>';
                                            }
                                            //build this object properly to use column ID to get column width
                                            rowObj.leftColumns.push({ [otherCol]: choiceContent });
                                            break;
                                        }
                                        case 'SHEET_COLUMN_TYPE_LOOKUP': {
                                            let userMulti = false;
                                            let userContent = '';
                                            if (row.column[otherCol].displayData.lookupuser !== undefined) {
                                                if (row.column[otherCol].displayData.lookupuser.userDisplayName !== undefined) {
                                                    userContent += row.column[otherCol].displayData.lookupuser.userDisplayName.cdata;
                                                } else {
                                                    row.column[otherCol].displayData.lookupuser.forEach(user => {
                                                        if (userMulti) {
                                                            userContent += ', ';
                                                        }
                                                        userContent += user.userDisplayName.cdata;
                                                        userMulti = true;
                                                    });
                                                }
                                            }
                                            rowObj.leftColumns.push({ [otherCol]: userContent });
                                            break;
                                        }
                                        default:
                                            rowObj.leftColumns.push({ [otherCol]: row.column[otherCol].displayData.cdata });
                                    }
                                });
                            }
                            listData.push(rowObj);
                            ganttPos++;
                        }
                    }

                    if (hasSubTasks && options.subtaskType == 'choice') {
                        let newArray = [];
                        for (const element of listData) {
                            if (!element.parentTask) {
                                newArray.push(element);
                            }
                        }
                        for (let i = listData.length - 1; i > 0; i--) {
                            if (listData[i].parentTask) {
                                for (let j = 0; j < newArray.length; j++) {
                                    if (newArray[j].itemId == listData[i].parentTask) {
                                        newArray.splice(j + 1, 0, listData[i]);
                                        break;
                                    }
                                }
                            }
                        }
                        rawData = newArray;
                    } else {
                        rawData = listData;
                    }
                    // compute critical path on finalized data
                    if (options.criticalPath == 'true') {
                        try {
                            computeCriticalPath(rawData);
                        } catch (e) {
                            console.warn('Critical path computation failed: ' + e);
                        }
                    }
                    core.init(element);
                }

                // Resolve derived dates (duration/dependency based) iteratively so
                // computed values are written back to rawXmlData for later lookups.
                function resolveDerivedDates(items, iDColumn) {
                    if (!Array.isArray(items) || items.length === 0) return;
                    const nameCol = iDColumn;
                    const startCol = options.startDateColumn;
                    const dueCol = options.dueDateColumn;
                    const durationCol = options.durationColumn;
                    const depCol = options.dependentColumn;
                    let changed = true;
                    let iter = 0;
                    const maxIter = Math.max(10, items.length + 5);
                    while (changed && iter < maxIter) {
                        changed = false;
                        iter++;
                        for (const row of items) {
                            try {
                                const startVal = row.column[startCol]?.rawData?.cdata || '';
                                const dueVal = row.column[dueCol]?.rawData?.cdata || '';
                                let dur = 0;
                                if (durationCol != 'auto' && row.column[durationCol]?.rawData?.cdata) {
                                    dur = Number.parseInt(row.column[durationCol].rawData.cdata, 10) || 0;
                                }

                                let newStart = startVal;
                                let newDue = dueVal;

                                // If missing start, try dependent task's due date
                                if (!newStart && depCol != 'false' && row.column[depCol]?.displayData?.cdata) {
                                    const depName = row.column[depCol].displayData.cdata;
                                    for (const cand of items) {
                                        if (cand.column[nameCol]?.displayData?.cdata === depName) {
                                            const candDue = cand.column[dueCol]?.rawData?.cdata || '';
                                            if (candDue) {
                                                newStart = candDue;
                                            }
                                            break;
                                        }
                                    }
                                }

                                // If we have a start+duration, compute inclusive due date
                                if (!newDue && newStart && dur > 0) {
                                    newDue = moment(newStart).add(Math.max(0, dur), 'days').startOf('day').toISOString();
                                }

                                // If we have due+duration, compute inclusive start date
                                if (!newStart && newDue && dur > 0) {
                                    newStart = moment(newDue).subtract(Math.max(0, dur), 'days').startOf('day').toISOString();
                                }

                                if (newStart && (!row.column[startCol]?.rawData || row.column[startCol].rawData.cdata !== newStart)) {
                                    if (!row.column[startCol]) row.column[startCol] = { rawData: {} };
                                    row.column[startCol].rawData.cdata = newStart;
                                    changed = true;
                                }
                                if (newDue && (!row.column[dueCol]?.rawData || row.column[dueCol].rawData.cdata !== newDue)) {
                                    if (!row.column[dueCol]) row.column[dueCol] = { rawData: {} };
                                    row.column[dueCol].rawData.cdata = newDue;
                                    changed = true;
                                }
                            } catch (e) {
                                // don't let one bad row stop resolution
                            }
                        }
                    }
                }
            }
            // compute critical path helper (operates on rendered raw data array)
            function computeCriticalPath(data) {
                if (!Array.isArray(data) || data.length === 0) {
                    return;
                }
                // build task list (exclude group/list rows without itemId)
                let tasks = [];
                let nameMap = new Map();
                for (const element of data) {
                    const d = element;
                    if (d?.itemId) {
                        tasks.push(d);
                        nameMap.set(d.name, d);
                    }
                }
                // enrich tasks with durations and succ list
                tasks.forEach(function (t) {
                    let dur = Number.parseInt(t.duration || 0, 10) || 0;
                    if (!dur && t.from && t.to) {
                        try {
                            dur = Math.round(moment(t.to).diff(moment(t.from), 'days')) + 1;
                        } catch (e) {
                            dur = 0;
                        }
                    }
                    t._dur = dur;
                    t._ES = 0;
                    t._EF = dur;
                    t._LS = 0;
                    t._LF = 0;
                    t._succ = [];
                });
                // build successor lists from dependent (predecessor name on each task)
                tasks.forEach(function (t) {
                    if (t.dependent) {
                        const depName = t.dependent.trim();
                        const pred = nameMap.get(depName);
                        if (pred) {
                            pred._succ.push(t);
                        } else {
                            console.warn('Dependent not found for CP: ' + depName + ' referenced by ' + t.name);
                        }
                    }
                });
                // forward pass (iterative relaxation)
                let changed = true;
                let iter = 0;
                while (changed && iter < 1000) {
                    changed = false;
                    iter++;
                    tasks.forEach(function (t) {
                        const predName = (t.dependent || '').trim();
                        let newES = 0;
                        if (predName) {
                            const pred = nameMap.get(predName);
                            if (pred) {
                                newES = pred._EF;
                            }
                        }
                        const newEF = newES + t._dur;
                        if (newES !== t._ES || newEF !== t._EF) {
                            t._ES = newES;
                            t._EF = newEF;
                            changed = true;
                        }
                    });
                }
                // project finish
                let projectEnd = 0;
                tasks.forEach(function (t) { if (t._EF > projectEnd) projectEnd = t._EF; });
                // initialize backward values
                tasks.forEach(function (t) { t._LF = projectEnd; t._LS = t._LF - t._dur; });
                // backward pass
                changed = true; iter = 0;
                while (changed && iter < 1000) {
                    changed = false; iter++;
                    tasks.forEach(function (t) {
                        if (t._succ?.length) {
                            let minLS = Infinity;
                            t._succ.forEach(function (s) { if (s._LS < minLS) minLS = s._LS; });
                            if (minLS !== Infinity) {
                                const newLF = minLS;
                                const newLS = newLF - t._dur;
                                if (newLF !== t._LF || newLS !== t._LS) {
                                    t._LF = newLF; t._LS = newLS; changed = true;
                                }
                            }
                        }
                    });
                }
                // mark critical (slack <= 0)
                tasks.forEach(function (t) {
                    const slack = t._LS - t._ES;
                    if (slack <= 0) {
                        if (!(t.customClass || '').includes('critical')) {
                            t.customClass = (t.customClass ? t.customClass + ' ' : '') + 'critical';
                        }
                    }
                });
            }
        },

        init: function (element) {
            rowsNum = rawData.length;
            pageCount = Math.ceil(rowsNum / options.itemsPerPage);
            rowsOnLastPage = rowsNum - (Math.floor(rowsNum / options.itemsPerPage) * options.itemsPerPage);

            dateStart = tools.getMinDate(element);
            dateEnd = tools.getMaxDate(element);

            core.waitToggle(element, function () { core.render(element); });
        },

        render: function (element) {
            let content = $e('<div class="fn-content"/>');
            if (options.customLeftPanel != 'false') {
                let filterColumns = new Map();
                let filterColumnsCounter = 1;
                let buttonContainer = document.createElement('div');
                let checkboxCount = 0;
                buttonContainer.id = 'tableColumnFiltersContainer';
                if (rawXmlData.view.head?.headColumn) {
                    for (let i = 0; i < rawXmlData.view.head.headColumn.length; i++) {
                        if (i != options.nameColumn) {
                            let columnFilterObject = {
                                columnName: rawXmlData.view.head.headColumn[i].columnValue.cdata,
                                columnIndex: i,
                                columnId: rawXmlData.view.head.headColumn[i].columnid,
                            };
                            if (filterColumns.has(filterColumnsCounter)) {
                                filterColumns.get(filterColumnsCounter).push(columnFilterObject);
                            } else {
                                filterColumns.set(filterColumnsCounter, [columnFilterObject]);
                            }
                        }
                    }
                }
                buttonContainer.className = 'dropdown';
                content.append(buttonContainer);
                let selectedColumns = options.otherColumns.split(',');
                // Add filters for each column
                for (let filterColumn of filterColumns.entries()) {
                    for (let item of filterColumn[1]) {
                        checkboxCount++;
                        let checkbox = document.createElement('div');
                        let input = document.createElement('input');
                        let label = document.createElement('label');
                        checkbox.className = 'form-check filter-checkbox';
                        checkbox.style.display = 'inline-block';
                        checkbox.style.marginRight = '1em';
                        input.id = 'filterCheckbox' + checkboxCount;
                        input.className = 'form-check-input table-column-filter-checkbox';
                        input.type = 'checkbox';
                        input.dataset.columnIndex = item.columnIndex;
                        input.checked = (selectedColumns.includes(item.columnIndex.toString()));
                        $e(input).css('margin-right', '0.2em');
                        $e(input).css('display', 'inline-block');
                        label.textContent = item.columnName;
                        label.className = 'form-check-label';
                        label.setAttribute('for', 'filterCheckbox' + checkboxCount);
                        $e(label).css('display', 'inline-block');
                        $e(label).css('vertical-align', 'middle');
                        $e(input).change(function () {
                            if (this.checked) {
                                if (selectedColumns == 'false') {
                                    selectedColumns = [];
                                }
                                selectedColumns.push($e(this).data('columnIndex'));
                                selectedColumns.sort();
                            } else {
                                let colIndex = $e(this).data('columnIndex');
                                selectedColumns = $e.grep(selectedColumns, function (a) { return a !== colIndex.toString(); });
                            }
                            userOptions.otherColumns = selectedColumns.join(',');
                            engineerGantt(userOptions);
                        });
                        checkbox.append(input);
                        checkbox.append(label);
                        buttonContainer.append(checkbox);
                    }
                }
            }
            content.append(core.navigation(element));
            let chartBody = $e('<div class="fn-chartbody"/>');
            if (options.showLegend != 'false' && options.statusColumn != 'auto') {
                chartBody.append(core.legend(element));
            }
            let $leftPanel = core.leftPanel(element);
            chartBody.append($leftPanel);
            let $rightPanel = core.rightPanel(element, $leftPanel);
            let pLeft, hPos;

            chartBody.append($rightPanel);
            let $dataPanel = $rightPanel.find('.dataPanel');
            content.append(chartBody);
            gantt = $e('<div class="fn-gantt" />').append(content);
            $e(element).empty().append(gantt);

            if ($e.inArray(options.scale, scales) <= $e.inArray(options.minScale, scales)) {
                $e('.nav-zoomIn').prop('disabled', true);
            } else {
                $e('.nav-zoomIn').prop('disabled', false);
            }

            if ($e.inArray(options.scale, scales) >= $e.inArray(options.maxScale, scales)) {
                $e('.nav-zoomOut').prop('disabled', true);
            } else {
                $e('.nav-zoomOut').prop('disabled', false);
            }

            scrollNavigation.panelMargin = Number.parseInt($dataPanel.css('left').replace('px', ''), 10);
            scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());

            scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());

            core.markNow(element);
            core.fillData(element, $dataPanel, $leftPanel);
            core.drawDependencies($dataPanel);

            if ($e('#' + options.container).find('.today').length < 1) {
                $e('#' + options.container + ' .nav-now').hide();
            }
            // Scroll the grid to today's date
            if (options.scrollToToday == 'true') {
                core.navigateTo(element, 'now');
                core.scrollPanel(element, 0);
                // or, scroll the grid to the left most date in the panel
            } else if (hPosition !== 0) {
                    if (scaleOldWidth) {
                        pLeft = ($dataPanel.width() - $rightPanel.width());
                        hPos = pLeft * hPosition / scaleOldWidth;
                        hPosition = Math.min(hPos, 0);
                        scaleOldWidth = null;
                    }
                    $dataPanel.css({ 'left': hPosition });
                    scrollNavigation.panelMargin = hPosition;
                }
            $dataPanel.css({ height: $leftPanel.height() });
            core.waitToggle(element);
            if (options.labelTooltips != 'false') {
                $dataPanel.popover({
                    selector: '.bar',
                    title: function _getItemText() {
                        return this.textContent;
                    },
                    container: '#' + options.container + ' .fn-gantt',
                    content: false,
                    trigger: 'hover',
                    placement: 'auto top',
                    // popover-title changes to popover-header in Bootstrap 4.0+
                    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h6 class="popover-title"></h6><div class="popover-body"></div></div>',
                });
            }
            //options.onRender();
        },

        legend: function (element) {
            let legendContainer = $e('<div class="legendPanel"/>');
            legendContainer.css('text-align', 'right');
            legendContainer.prepend($e('<span class="legendTitle" style="font-weight:600">Legend : </span>'));
            let legendArr = [];
            let titles = [];

            if (options.statusColumn != 'auto' && rawXmlData.view.data.item) {
                rawXmlData.view.data.item.forEach(calcLegend);
            }

            legendArr.forEach(function (item) {
                buildLegendItem(item);
            });

            return (legendContainer);

            function calcLegend(item) {
                let column = options.statusColumn;
                let itemColor;
                let itemTitle;
                let sortIndex;
                if (item.column[column].rawData?.choice) {
                    let styleColor;
                    if (item.column[column].rawData.choice[0]?.style) {
                        styleColor = item.column[column].rawData.choice[0].style;
                        styleColor = styleColor.substr(styleColor.indexOf('#'));
                        itemColor = styleColor;
                        itemTitle = item.column[column].rawData.choice[0].cdata;
                    }
                } else {
                    itemTitle = options.defaultTitle;
                    itemColor = options.defaultBarColor;
                }
                if (itemTitle && !titles.includes(itemTitle)) {
                    sortIndex = Number.parseInt(itemTitle.match(/^\d*/), 10);
                    let itemTitleStrip;
                    if (!sortIndex) {
                        sortIndex = rawXmlData.view.data.item.length;
                    }
                    if (options.sortLegend == 'true') {
                        itemTitleStrip = itemTitle.replace(/^\d*\S\s/, '');
                    } else {
                        itemTitleStrip = itemTitle;
                    }
                    let legendItem = { color: itemColor, title: itemTitleStrip, sort: sortIndex };
                    titles.push(itemTitle);
                    legendArr.push(legendItem);
                }
            }

            function buildLegendItem(item) {
                let classId = engineercore_safeCSS(item.title);
                let legendElement = $e('<div>')
                    .css('background', item.color)
                    .addClass('legend-item badge legend-item-' + classId)
                    .text(item.title);
                //.on('click', function() {
                //    $e(this).toggleClass('dimmed');
                //    $e('#'+options.container+' .eng-event-container.'+classId).toggleClass('fade');
                //});
                legendContainer.append(legendElement);
            }
        },

        // Create and return the left panel with labels
        leftPanel: function () {
            let ganttLeftPanel = $e('<div class="leftPanel"/>')
                .append($e('<div class="row spacer"/>')
                    .css('height', tools.getCellSize() * headerRows));
            let entries = [];
            entries.push(
                '<div class="row name header namecolumn' + options.nameColumn + '" style="width:' + (rawXmlData.view.head.headColumn[options.nameColumn].properties.property['0'].cdata || 120) + 'px">' +
                '<span class="fn-label">' +
                (rawXmlData.view.head.headColumn[options.nameColumn].columnValue.cdata || '') +
                '</span>' +
                '</div>');
            if (options.otherColumns != 'false') {
                let additionalColumns = options.otherColumns.split(',');
                additionalColumns.forEach(function (colValue) {
                    entries.push(
                        '<div class="row header desc othercolumn' + colValue + '" style="width:' + (rawXmlData.view.head.headColumn[colValue].properties.property['0'].cdata || 120) + 'px">' +
                        '<div class="fn-label' + '">' +
                        (rawXmlData.view.head.headColumn[colValue].columnValue.cdata || '') +
                        '</div>' +
                        '</div>');
                });
            }
            $e.each(rawData, function (i, entry) {
                if (i >= pageNum * options.itemsPerPage &&
                    i < ((pageNum * options.itemsPerPage) + options.itemsPerPage)) {
                    let dataId = ('id' in entry) ? entry.id : '';
                    entries.push(
                        '<div class="row name row' + i +
                        '" id="rowheader' + i + '" style="width:' + (rawXmlData.view.head.headColumn[options.nameColumn].properties.property['0'].cdata || 120) + 'px; padding-left:' + entry.leftPad + 'px"' +
                        '" data-offset="' + i % options.itemsPerPage * tools.getCellSize() + '">' +
                        '<div class="fn-label' +
                        (entry.customClass ? ' ' + entry.customClass : '') + '" title="' +
                        (entry.name || '') + '">' +
                        (entry.name || '') +
                        '</div>' +
                        '</div>');
                    entry.leftColumns.forEach(function (colValue, otherCol) {
                        entries.push(
                            '<div class="row desc row' + i + '" style="width:' + (rawXmlData.view.head.headColumn[Object.keys(colValue)].properties.property['0'].cdata || 120) + 'px"' +
                            ' " id="RowdId_' + dataId + '_' + otherCol + '">' +
                            '<span class="fn-label' +
                            (entry.customClass ? ' ' + entry.customClass : '') + '">' +
                            Object.values(colValue) +
                            '</span>' +
                            '</div>');
                    });
                }
            });
            return ganttLeftPanel.append(entries.join(''));
        },

        // Create and return the data panel element
        dataPanel: function (element, width) {
            let dataPanel = $e('<div class="dataPanel" style="width: ' + width + 'px;"/>');
            // Handle mousewheel events for scrolling the data panel
            if (options.scrollWheelNavigation == 'true') {
                let wheel = 'onwheel' in element ?
                    'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
                dataPanel.on(wheel, function (e) { core.wheelScroll(element, e); });
            }
            return dataPanel;
        },

        // Creates and return the right panel containing the year/week/day header
        rightPanel: function (element) {
            let range = null;
            // Days of the week have a class of one of
            // `sn` (Sunday), `sa` (Saturday), or `wd` (Weekday)
            const dowClass = ['sn', 'wd', 'wd', 'wd', 'wd', 'wd', 'sa'];
            //could stretch weekend class to the bottom of the chart?
            //let gridDowClass = [" sn", "", "", "", "", "", " sa"];

            let yearArr = [];
            let scaleUnitsThisYear = 0;

            let monthArr = [];
            let scaleUnitsThisMonth = 0;

            let dayArr = [];
            let hoursInDay = 0;

            let dowArr = [];
            let horArr = [];

            let today = new Date();
            today.setHours(0, 0, 0, 0);

            // reused letiables
            let $row = $e('<div class="row header"></div>');
            let i, len;
            let year, month, week, day;
            let rday, dayClass;
            let dataPanel, dataPanelWidth;

            // Setup the headings based on the chosen `options.scale`
            switch (options.scale) {
                case 'hours':
                    range = tools.parseTimeRange(dateStart, dateEnd, scaleStep);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();
                    day = range[0];

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        let rfy = rday.getFullYear();
                        if (rfy !== year) {
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');

                            year = rfy;
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;

                        // Fill months
                        let rm = rday.getMonth();
                        if (rm !== month) {
                            monthArr.push(
                                '<div class="row month" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                                options.months[month] +
                                '</div></div>');

                            month = rm;
                            scaleUnitsThisMonth = 0;
                        }
                        scaleUnitsThisMonth++;

                        // Fill days & hours
                        let rgetDay = rday.getDay();
                        let getDay = day.getDay();
                        if (rgetDay !== getDay) {
                            dayClass = (today - day === 0) ?
                                'today' : tools.isHoliday(day.getTime()) ? 'holiday' : dowClass[getDay];
                            dayArr.push(
                                '<div class="row date ' + dayClass + '" ' +
                                'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                                '<div class="fn-label">' + day.getDate() + '</div></div>');
                            dowArr.push(
                                '<div class="row day ' + dayClass + '" ' +
                                'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                                '<div class="fn-label">' + options.dow[getDay] + '</div></div>');
                            day = rday;
                            hoursInDay = 0;
                        }
                        hoursInDay++;

                        dayClass = dowClass[rgetDay];
                        if (tools.isHoliday(rday)) {
                            dayClass = 'holiday';
                        }
                        horArr.push(
                            '<div class="row day ' +
                            dayClass +
                            '" id="dh-' +
                            rday.getTime() +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(options.scale) +
                            '"><div class="fn-label">' +
                            rday.getHours() +
                            '</div></div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        options.months[month] +
                        '</div></div>');

                    dayClass = dowClass[day.getDay()];

                    if (tools.isHoliday(day)) {
                        dayClass = 'holiday';
                    }

                    dayArr.push(
                        '<div class="row date ' + dayClass + '" ' +
                        'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                        '<div class="fn-label">' + day.getDate() + '</div></div>');

                    dowArr.push(
                        '<div class="row day ' + dayClass + '" ' +
                        'style="width: ' + tools.getCellSize() * hoursInDay + 'px;">' +
                        '<div class="fn-label">' + options.dow[day.getDay()] + '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join('')),
                        $row.clone().html(monthArr.join('')),
                        $row.clone().html(dayArr.join('')),
                        $row.clone().html(dowArr.join('')),
                        $row.clone().html(horArr.join(''))
                    );
                    break;

                case 'weeks': {
                    let diff;
                    range = tools.parseWeeksRange(dateStart, dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();
                    week = range[0].getWeekOfYear();
                    
                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (week > (week = rday.getWeekOfYear())) {
                            // partial weeks to subtract from year header
                            diff = rday.getDate() - 1;
                            // offset one month (December) if week starts in last year
                            diff -= !rday.getMonth() ? 0 : 31;
                            diff /= 7;
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * (scaleUnitsThisYear - diff) +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year++;
                            scaleUnitsThisYear = diff;
                        }
                        scaleUnitsThisYear++;

                        // Fill months
                        if (rday.getMonth() !== month) {
                            // partial weeks to subtract from month header
                            diff = rday.getDate() - 1;
                            // offset one week if week starts in last month
                            //diff -= (diff <= 6) ? 0 : 7;
                            diff /= 7;
                            monthArr.push(
                                '<div class="row month" style="width:' +
                                tools.getCellSize() * (scaleUnitsThisMonth - diff) +
                                'px;"><div class="fn-label">' +
                                options.months[month] +
                                '</div></div>');
                            month = rday.getMonth();
                            scaleUnitsThisMonth = diff;
                        }
                        scaleUnitsThisMonth++;

                        // Fill weeks
                        dayArr.push(
                            '<div class="row day wd"' +
                            ' id="' + rday.getWeekId() +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(options.scale) + '">' +
                            '<div class="fn-label">' + week + '</div></div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        options.months[month] +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join('')),
                        $row.clone().html(monthArr.join('')),
                        $row.clone().html(dayArr.join(''))
                    );
                    break;
                }
                case 'months':
                    range = tools.parseMonthsRange(dateStart, dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (rday.getFullYear() !== year) {
                            yearArr.push(
                                '<div class="row year" style="width: ' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year = rday.getFullYear();
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;
                        let monthNo = (1 + rday.getMonth());
                        let monthVal;
                        if (options.monthView == 'number') {
                            monthVal = monthNo;
                        } else {
                            let monthName = options.months[monthNo - 1];
                            if (options.monthView == 'short') {
                                monthVal = monthName.substring(0, 3);
                            } else {
                                monthVal = monthName.substring(0, 1);
                            }
                        }

                        monthArr.push(
                            '<div class="row day wd" id="dh-' + tools.genId(rday) +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(options.scale) + '">' +
                            monthVal + '</div>');
                    }

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join('')),
                        $row.clone().html(monthArr.join(''))
                    );
                    break;

                // **Days (default)**
                default:
                    range = tools.parseDateRange(dateStart, dateEnd);
                    dataPanelWidth = range.length * tools.getCellSize();

                    year = range[0].getFullYear();
                    month = range[0].getMonth();

                    for (i = 0, len = range.length; i < len; i++) {
                        rday = range[i];

                        // Fill years
                        if (rday.getFullYear() !== year) {
                            yearArr.push(
                                '<div class="row year" style="width:' +
                                tools.getCellSize() * scaleUnitsThisYear +
                                'px;"><div class="fn-label">' +
                                year +
                                '</div></div>');
                            year = rday.getFullYear();
                            scaleUnitsThisYear = 0;
                        }
                        scaleUnitsThisYear++;

                        // Fill months
                        if (rday.getMonth() !== month) {
                            monthArr.push(
                                '<div class="row month" style="width:' +
                                tools.getCellSize() * scaleUnitsThisMonth +
                                'px;"><div class="fn-label">' +
                                options.months[month] +
                                '</div></div>');
                            month = rday.getMonth();
                            scaleUnitsThisMonth = 0;
                        }
                        scaleUnitsThisMonth++;

                        day = rday.getDay();
                        dayClass = dowClass[day];
                        if (tools.isHoliday(rday)) {
                            dayClass = 'holiday';
                        }

                        dayArr.push(
                            '<div class="row date ' + dayClass + '"' +
                            ' id="dh-' + tools.genId(rday) +
                            '" data-offset="' + i * tools.getCellSize() +
                            '" data-repdate="' + rday.getRepDate(options.scale) + '">' +
                            '<div class="fn-label">' + rday.getDate() + '</div></div>');
                        dowArr.push(
                            '<div class="row day ' + dayClass + '"' +
                            ' id="dw-' + tools.genId(rday) +
                            '" data-repdate="' + rday.getRepDate(options.scale) + '">' +
                            '<div class="fn-label">' + options.dow[day] + '</div></div>');
                    } //for

                    // Last year
                    yearArr.push(
                        '<div class="row year" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisYear + 'px;"><div class="fn-label">' +
                        year +
                        '</div></div>');

                    // Last month
                    monthArr.push(
                        '<div class="row month" style="width: ' +
                        tools.getCellSize() * scaleUnitsThisMonth + 'px"><div class="fn-label">' +
                        options.months[month] +
                        '</div></div>');

                    dataPanel = core.dataPanel(element, dataPanelWidth);

                    // Append panel elements
                    dataPanel.append(
                        $row.clone().html(yearArr.join('')),
                        $row.clone().html(monthArr.join('')),
                        $row.clone().html(dayArr.join('')),
                        $row.clone().html(dowArr.join(''))
                    );
            }
            return $e('<div class="rightPanel"></div>').append(dataPanel);
        },

        navigation: function (element) {
            let ganttNavigate = $e('<div class="navigate" />');
            if (pageCount > 1) {
                ganttNavigate.append($e('<div class="page-group" />')
                    .append($e('<button type="button" class="nav-link btn btn-default nav-page-back"/>')
                        .html('&uarr;')
                        .click(function () {
                            core.navigatePage(element, -1);
                        }))
                    .append($e('<div class="page-number"/>')
                        .append($e('<span/>')
                            .html(pageNum + 1 + ' / ' + pageCount)))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-page-next"/>')
                        .html('&darr;')
                        .click(function () {
                            core.navigatePage(element, 1);
                        }))
                );
            }
            if (options.navigate === 'scroll') {
                let ganttScroll = $e('<div class="nav-slider" />')
                    .append($e('<div class="nav-slider-content" />')
                        .append($e('<div class="nav-slider-bar" />')
                            .append($e('<a class="nav-slider-button" />')
                                .append($e('<span class="nav-slider-button-text" />')
                                    .html('&lt;&gt;'))
                            )
                            .mousedown(function (e) {
                                e.preventDefault();
                                scrollNavigation.scrollerMouseDown = true;
                                core.sliderScroll(element, e);
                            })
                            .mousemove(function (e) {
                                if (scrollNavigation.scrollerMouseDown) {
                                    core.sliderScroll(element, e);
                                }
                            })
                        )
                    );
                ganttNavigate.append(ganttScroll);
            }
            ganttNavigate.append($e('<button type="button" class="nav-link btn btn-default nav-now"/>')
                .html('Today')
                .click(function () {
                    core.navigateTo(element, 'now');
                    core.scrollPanel(element, 0);
                }));
            if (options.navigate === 'buttons') {
                ganttNavigate.append($e('<div class="scroll-group" />')
                    .append($e('<button type="button" class="nav-link btn btn-default nav-begin"/>')
                        .html('Scroll First')
                        .click(function () {
                            core.navigateTo(element, 'begin');
                        }))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-prev-week"/>')
                        .html('Scroll --')
                        .click(function () {
                            if (options.scale === 'hours') {
                                core.navigateTo(element, tools.getCellSize() * 8);
                            } else if (options.scale === 'days') {
                                core.navigateTo(element, tools.getCellSize() * 30);
                            } else if (options.scale === 'weeks') {
                                core.navigateTo(element, tools.getCellSize() * 12);
                            } else if (options.scale === 'months') {
                                core.navigateTo(element, tools.getCellSize() * 6);
                            }
                        }))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-prev-day"/>')
                        .html('Scroll -')
                        .click(function () {
                            if (options.scale === 'hours') {
                                core.navigateTo(element, tools.getCellSize() * 4);
                            } else if (options.scale === 'days') {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            } else if (options.scale === 'weeks') {
                                core.navigateTo(element, tools.getCellSize() * 4);
                            } else if (options.scale === 'months') {
                                core.navigateTo(element, tools.getCellSize() * 3);
                            }
                        }))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-next-day"/>')
                        .html('Scroll +')
                        .click(function () {
                            if (options.scale === 'hours') {
                                core.navigateTo(element, tools.getCellSize() * -4);
                            } else if (options.scale === 'days') {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            } else if (options.scale === 'weeks') {
                                core.navigateTo(element, tools.getCellSize() * -4);
                            } else if (options.scale === 'months') {
                                core.navigateTo(element, tools.getCellSize() * -3);
                            }
                        }))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-next-week"/>')
                        .html('Scroll ++')
                        .click(function () {
                            if (options.scale === 'hours') {
                                core.navigateTo(element, tools.getCellSize() * -8);
                            } else if (options.scale === 'days') {
                                core.navigateTo(element, tools.getCellSize() * -30);
                            } else if (options.scale === 'weeks') {
                                core.navigateTo(element, tools.getCellSize() * -12);
                            } else if (options.scale === 'months') {
                                core.navigateTo(element, tools.getCellSize() * -6);
                            }
                        }))
                    .append($e('<button type="button" class="nav-link btn btn-default nav-end"/>')
                        .html('Scroll Last')
                        .click(function () {
                            core.navigateTo(element, 'end');
                        }))
                );
            }
            ganttNavigate.append($e('<button type="button" class="nav-link btn btn-default nav-zoomIn"/>')
                .html('Zoom In')
                .click(function () {
                    core.zoomInOut(element, -1);
                }));
            ganttNavigate.append($e('<button type="button" class="nav-link btn btn-default nav-zoomOut"/>')
                .html('Zoom Out')
                .click(function () {
                    core.zoomInOut(element, 1);
                }));
            if (hasSubTasks) {
                ganttNavigate.append($e('<button type="button" class="nav-link btn btn-default nav-subtasks"/>')
                    .html((options.showSubtasks == 'true') ? 'Hide Subtasks' : 'Show Subtasks')
                    .click(function () {
                        core.toggleSubTasks(element);
                    }));
            }
            if (options.exportButton == 'true') {
                try {
                    if (typeof (window['html2canvas']()) == 'function') {
                        console.log('html2canvas already loaded - initializing...');
                        addExportButton();
                    }
                } catch (error) {
                    engineercore_load('html2canvas').then(function () {
                        console.log('html2canvas imported successfully');
                        addExportButton();
                    });
                }
            }

            function addExportButton() {
                ganttNavigate.append($e('<button type="button" class="nav-link btn btn-default nav-export"/>')
                    .html('Export Chart')
                    .click(function () {
                        engineercore_modal('Screenshot');
                        let ganttWidth = $e('#' + options.container + ' .fn-content .leftPanel').width()
                            + $e('#' + options.container + ' .fn-content .dataPanel').width()
                            + Number.parseInt($e('#' + options.container + ' .fn-content .dataPanel').css('left').split('px')[0]);
                        $e('#engineerModal .modal-dialog').width('99%');
                        $e('#' + options.container + ' .legendPanel').css('text-align', 'left');
                        document.querySelector('#' + options.container + ' .fn-chartbody').style.width = ganttWidth + 'px';
                        html2canvas(document.querySelector('#' + options.container + ' .fn-chartbody'), { windowWidth: ganttWidth })
                            .then(canvas => {
                                document.querySelector('#engineerModal .modal-body').innerHTML = '';
                                document.querySelector('#engineerModal .modal-body').append(canvas);
                            })
                            .catch(error => {
                                alert('Unable to export at this time - ' + error);
                            });
                        $e('#' + options.container + ' .legendPanel').css('text-align', 'right');
                        $e('#engineerModal').modal();
                    })
                );
            }

            $e(document).mouseup(function () {
                scrollNavigation.scrollerMouseDown = false;
            });
            return $e('<div class="navcontainer"></div>').append(ganttNavigate);
        },
        // Create an element bar shape to represent a task duration
        createDurationBar: function (label, desc, classNames, dataObj, color) {
            label = label || '';
            let hex = Number.parseInt(color.substring(1), 16);
            let r = (hex & 0xff0000) >> 16;
            let g = (hex & 0x00ff00) >> 8;
            let b = hex & 0x0000ff;
            let rgbValue = [r, g, b];
            let colorVal = Math.round(((Number.parseInt(rgbValue[0]) * 299) +
                (Number.parseInt(rgbValue[1]) * 587) +
                (Number.parseInt(rgbValue[2]) * 114)) / 1000);
            let textColor = (colorVal > 125) ? 'black' : 'white';
            let bar = $e('<div class="bar"></div>')
                .data('dataObj', dataObj);
            bar.css('background-color', color);
            let barLabel = $e('<div class="fn-label" style="color:' + textColor + '">' + label + '</div>');
            if (options.labelColumn == 'false') {
                barLabel.css('display', 'none');
            }
            barLabel.appendTo(bar);
            if (options.chartLinks != 'false' || options.taskSearch != 'false') {
                bar.css('cursor', 'pointer');
            }
            if (desc) {
                bar.mouseenter(function (e) {
                    let hint = $e('<div class="fn-gantt-hint" />').html(desc);
                    $e('body').append(hint);
                    hint.css('left', e.pageX);
                    hint.css('top', e.pageY);
                    hint.show();
                })
                    .mouseleave(function () {
                        $e('.fn-gantt-hint').remove();
                    })
                    .mousemove(function (e) {
                        $e('.fn-gantt-hint').css('left', e.pageX);
                        $e('.fn-gantt-hint').css('top', e.pageY + 15);
                    });
            }
            if (classNames) {
                bar.addClass(classNames);
            }
            if (dataObj.itemId.length > 0) {
                bar.click(function (e) {
                    e.stopPropagation();
                    if (options.taskSearch != 'false') {
                        window.open('./taskHome.action?metaData.siteID=' + options.siteID
                            + '&searchText="' + dataObj.taskSearch + '"', '_' + options.linkTab).focus();
                    } else if (options.chartLinks == 'print') {
                        let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetPrintItem');
                        let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + dataObj.itemId + '&view=readonly&injectSheetLinkView=true&isPrintPreview=true');
                        window.open(link, '_blank').focus();
                    } else if (options.chartLinks == 'isheet') {
                        let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                        let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + dataObj.itemId);
                        window.open(link, '_' + options.linkTab).focus();
                    } else if (options.chartLinks == 'default') {
                        let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                        res = res.replace(/metaData.sheetViewID=\d*/i, '');
                        let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + dataObj.itemId);
                        window.open(link, '_' + options.linkTab).focus();
                    } else if (options.chartLinks == 'viewItem') {
                        const itemBtn = document.createElement('a');
                        itemBtn.className = 'CKContextLink hidden';
                        itemBtn.textContent = 'LINK';
                        itemBtn.setAttribute('id', '{"linkType":"iSheetItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetItemID":"' + dataObj.itemId + '","sheetViewID":"0","viewMode":"0","linkedFromCKEditor":false}');
                        let tableBtnLink = buildISheetUrl('injectColumnViewItemPage', dataObj.itemId, true, {
                            'metaData.viewMode': '0',
                            'view': 'readonly',
                            'sheetItemLinkView': 'false',
                        });
                        itemBtn.setAttribute('href', tableBtnLink);
                        document.getElementById(options.container).append(itemBtn);
                        rebindCKContentLink();
                        itemBtn.click();
                        itemBtn.remove();
                    }
                });
            }
            return bar;
        },

        // Remove the `wd` (weekday) class and add `today` class to the
        // current day/week/month (depending on the current scale)
        markNow: function (element) {
            let cd = new Date().setHours(0, 0, 0, 0);
            switch (options.scale) {
                case 'weeks':
                    $e(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                    break;
                case 'months':
                    $e(element).find(':findmonth("' + cd + '")').removeClass('wd').addClass('today');
                    break;
                case 'days':
                /* falls through */
                case 'hours':
                /* falls through */
                default:
                    $e(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
            }
        },

        // Parse the data and fill the data panel
        fillData: function (element, datapanel) {
            let cellWidth = tools.getCellSize();
            let barOffset = (cellWidth - 18) / 2;
            let dataPanelWidth = datapanel.width();
            // Loop through the values of each data element and set a row
            $e.each(rawData, function (i, entry) {
                if (i >= pageNum * options.itemsPerPage &&
                    i < (pageNum * options.itemsPerPage + options.itemsPerPage)) {
                    let _bar;
                    let from, to, cFrom, cTo, dFrom, dTo, dl, dp;
                    let topEl, top;
                    switch (options.scale) {
                        case 'hours':
                            dFrom = tools.genId(tools.dateDeserialize(entry.from), scaleStep);
                            from = $e(element).find('#dh-' + dFrom);
                            dTo = tools.genId(tools.dateDeserialize(entry.to), scaleStep);
                            to = $e(element).find('#dh-' + dTo);
                            cFrom = from.data('offset');
                            cTo = to.data('offset');
                            dl = Math.floor((cTo - cFrom) / cellWidth) + 1;
                            dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;
                            _bar = core.createDurationBar(entry.label, entry.desc, entry.customClass, entry, entry.color); //add desc for popout
                            topEl = $e(element).find('#rowheader' + i);
                            top = cellWidth * 5 + barOffset + topEl.data('offset');
                            _bar.css({
                                top: top,
                                left: Math.floor(cFrom),
                                width: dp + '%'
                            });
                            if (entry.dependent) {
                                _bar.attr('data-dependent', engineercore_safeCSS(entry.dependent));
                            }
                            _bar.attr('data-name', engineercore_safeCSS(entry.name));
                            datapanel.append(_bar);
                            break;

                        case 'weeks':
                            dFrom = tools.dateDeserialize(entry.from);
                            dTo = tools.dateDeserialize(entry.to);

                            from = $e(element).find('#' + dFrom.getWeekId());
                            cFrom = from.data('offset');
                            to = $e(element).find('#' + dTo.getWeekId());
                            cTo = to.data('offset');
                            dl = Math.round((cTo - cFrom) / cellWidth) + 1;
                            dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                            _bar = core.createDurationBar(entry.label, entry.desc, entry.customClass, entry, entry.color);

                            topEl = $e(element).find('#rowheader' + i);
                            top = cellWidth * 3 + barOffset + topEl.data('offset');
                            _bar.css({
                                top: top,
                                left: Math.floor(cFrom),
                                width: dp + '%'
                            });
                            if (entry.dependent) {
                                _bar.attr('data-dependent', engineercore_safeCSS(entry.dependent));
                            }
                            _bar.attr('data-name', engineercore_safeCSS(entry.name));
                            datapanel.append(_bar);
                            break;
                        case 'months':
                            dFrom = tools.dateDeserialize(entry.from);
                            dTo = tools.dateDeserialize(entry.to);

                            if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                dFrom.setDate(dFrom.getDate() + 4);
                            }

                            if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                dFrom.setDate(dFrom.getDate() + 4);
                            }

                            if (dTo.getDate() <= 3 && dTo.getMonth() === 0) {
                                dTo.setDate(dTo.getDate() + 4);
                            }

                            from = $e(element).find('#dh-' + tools.genId(dFrom));
                            cFrom = from.data('offset');
                            to = $e(element).find('#dh-' + tools.genId(dTo));
                            cTo = to.data('offset');
                            dl = Math.round((cTo - cFrom) / cellWidth) + 1;
                            dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                            _bar = core.createDurationBar(entry.label, entry.desc, entry.customClass, entry, entry.color);

                            topEl = $e(element).find('#rowheader' + i);
                            top = cellWidth * 2 + barOffset + topEl.data('offset');
                            _bar.css({
                                top: top,
                                left: Math.floor(cFrom),
                                width: dp + '%'
                            });
                            if (entry.dependent) {
                                _bar.attr('data-dependent', engineercore_safeCSS(entry.dependent));
                            }
                            _bar.attr('data-name', engineercore_safeCSS(entry.name));
                            datapanel.append(_bar);
                            break;

                        case 'days':
                        default:
                            dFrom = tools.genId(tools.dateDeserialize(entry.from));
                            dTo = tools.genId(tools.dateDeserialize(entry.to));
                            from = $e(element).find('#dh-' + dFrom);
                            cFrom = from.data('offset');
                            dl = Math.round((dTo - dFrom) / UTC_DAY_IN_MS) + 1;
                            dp = 100 * (cellWidth * dl - 1) / dataPanelWidth;

                            _bar = core.createDurationBar(entry.label, entry.desc, entry.customClass, entry, entry.color);

                            topEl = $e(element).find('#rowheader' + i);
                            top = cellWidth * 4 + barOffset + topEl.data('offset');
                            _bar.css({
                                top: top,
                                left: Math.floor(cFrom),
                                width: dp + '%'
                            });
                            if (entry.dependent) {
                                _bar.attr('data-dependent', engineercore_safeCSS(entry.dependent));
                            }
                            _bar.attr('data-name', engineercore_safeCSS(entry.name));
                            datapanel.append(_bar);
                    }
                }
            });
        },
        drawDependencies: function (element) {
            let errorLog = '';
            element.find('[data-dependent]').each(function () {
                let $predecessor = element.find('.bar[data-name="' + $e(this).attr('data-dependent') + '"]');
                if ($predecessor.length > 0) {
                    let bLeft = ($predecessor[0].offsetLeft + $predecessor[0].offsetWidth) - 2;
                    let bTop = $predecessor[0].offsetTop + $predecessor[0].offsetHeight / 2;
                    let bWidth = (this.offsetLeft - bLeft) + 1;
                    let bHeight = (this.offsetTop - bTop) + this.offsetHeight / 2;
                    let connector = $e('<div>');
                    connector.addClass('connector');
                    connector.css({
                        'position': 'absolute',
                        'width': bWidth,
                        'height': bHeight,
                        'top': bTop,
                        'left': bLeft,
                        'border-bottom-style': 'dashed',
                        'border-left-style': 'dashed',
                        'border-width': '1px'
                    });
                    $e(element).append(connector);
                } else
                    errorLog += $e(this).attr('data-dependent') + ', ';
            });
            if (errorLog.length > 1) {
                console.error('Error, the following connectors could not be made: ' + errorLog);
            }
        },
        navigateTo: function (element, val) {
            let $rightPanel = $e(element).find('.fn-gantt .rightPanel');
            let $dataPanel = $rightPanel.find('.dataPanel');
            let rightPanelWidth = $rightPanel.width();
            let dataPanelWidth = $dataPanel.width();

            let maxLeft, curLeft;
            switch (val) {
                case 'begin':
                    $dataPanel.animate({ 'left': '0' }, 'fast');
                    scrollNavigation.panelMargin = 0;
                    break;
                case 'end':
                    { let pLeft = dataPanelWidth - rightPanelWidth;
                    scrollNavigation.panelMargin = pLeft * -1;
                    $dataPanel.animate({ 'left': '-' + pLeft }, 'fast');
                    break; }
                case 'now':
                    if (!scrollNavigation.canScroll || !$dataPanel.find('.today').length) {
                        return false;
                    }
                    maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                    val = $dataPanel.find('.today').offset().left - $dataPanel.offset().left;
                    val *= -1;
                    if (val > 0) {
                        val = 0;
                    } else if (val < maxLeft) {
                        val = maxLeft;
                    }
                    $dataPanel.animate({ 'left': val }, 'fast');
                    scrollNavigation.panelMargin = val;
                    break;
                default:
                    maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                    curLeft = $dataPanel.css('left').replace('px', '');
                    val = Number.parseInt(curLeft, 10) + val;
                    if (val <= 0 && val >= maxLeft) {
                        $dataPanel.animate({ 'left': val }, 'fast');
                    }
                    scrollNavigation.panelMargin = val;
            }
            core.synchronizeScroller(element);
        },

        // Navigate to a specific page
        navigatePage: function (element, val) {
            if ((pageNum + val) >= 0 &&
                (pageNum + val) < Math.ceil(rowsNum / options.itemsPerPage)) {
                core.waitToggle(element, function () {
                    pageNum += val;
                    hPosition = $e('.fn-gantt .dataPanel').css('left').replace('px', '');
                    scaleOldWidth = false;
                    core.init(element);
                });
            }
        },

        // Change zoom level
        zoomInOut: function (element, val) {
            core.waitToggle(element, function () {
                let zoomIn = (val < 0);
                let scaleSt = scaleStep + val * 3;
                // adjust hour scale to desired factors of 24
                scaleSt = { 4: 3, 5: 6, 9: 8, 11: 12 }[scaleSt] || (Math.max(scaleSt, 1));
                let scale = options.scale;
                if ((options.scale === 'hours' && scaleSt >= 13) || (options.scale === 'weeks' && zoomIn)) {
                    scale = 'days';
                    headerRows = 3;
                    scaleSt = 13;
                } else if (options.scale === 'days' && zoomIn) {
                    scale = 'hours';
                    headerRows = 4;
                    scaleSt = 12;
                } else if ((options.scale === 'days' && !zoomIn) || (options.scale === 'months' && zoomIn)) {
                    scale = 'weeks';
                    headerRows = 2;
                    scaleSt = 13;
                } else if (options.scale === 'weeks' && !zoomIn) {
                    scale = 'months';
                    headerRows = 1;
                    scaleSt = 14;
                }

                scaleStep = scaleSt;
                options.scale = scale;
                let $rightPanel = $e(element).find('.fn-gantt .rightPanel');
                let $dataPanel = $rightPanel.find('.dataPanel');
                hPosition = $dataPanel.css('left').replace('px', '');
                scaleOldWidth = ($dataPanel.width() - $rightPanel.width());
                core.init(element);
            });
        },

        toggleSubTasks: function (element) {
            if (options.showSubtasks == 'true') {
                options.showSubtasks = 'false';
            } else {
                options.showSubtasks = 'true';
            }
            core.create(element);
        },

        // Move chart via mouse
        mouseScroll: function (element, e) {
            let $dataPanel = $e(element).find('.fn-gantt .dataPanel');
            $dataPanel.css('cursor', 'move');
            let mPos = scrollNavigation.mouseX === null ? e.pageX : scrollNavigation.mouseX;
            let delta = e.pageX - mPos;
            scrollNavigation.mouseX = e.pageX;

            core.scrollPanel(element, delta);

        },

        // Move chart via mousewheel
        wheelScroll: function (element, e) {
            e.preventDefault();
            let delta = e.detail || - (e = e.originalEvent).wheelData || e.deltaY || e.detail;
            delta = (delta / Math.abs(delta)) || 0;
            core.scrollPanel(element, -50 * delta);
        },

        // Move chart via slider control
        sliderScroll: function (element, e) {
            let $sliderBar = $e(element).find('.nav-slider-bar');
            let $sliderBarBtn = $sliderBar.find('.nav-slider-button');
            let $rightPanel = $e(element).find('.fn-gantt .rightPanel');
            let $dataPanel = $rightPanel.find('.dataPanel');
            let bPos = $sliderBar.offset();
            let bWidth = $sliderBar.width();
            let wButton = $sliderBarBtn.width();
            let pos, pLeft;
            if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                pos = e.pageX - bPos.left;
                pos = pos - wButton / 2;
                $sliderBarBtn.css('left', pos);

                pLeft = $dataPanel.width() - $rightPanel.width();

                let pPos = pos * pLeft / bWidth * -1;
                if (pPos >= 0) {
                    $dataPanel.css('left', '0');
                    scrollNavigation.panelMargin = 0;
                } else if (pos >= bWidth - (wButton * 1)) {
                    $dataPanel.css('left', pLeft * -1);
                    scrollNavigation.panelMargin = pLeft * -1;
                } else {
                    $dataPanel.css('left', pPos);
                    scrollNavigation.panelMargin = pPos;
                }
            }
        },

        // Update scroll panel margins
        scrollPanel: function (element, delta) {
            if (!scrollNavigation.canScroll) {
                return false;
            }
            let _panelMargin = Number.parseInt(scrollNavigation.panelMargin, 10) + delta;
            if (_panelMargin > 0) {
                scrollNavigation.panelMargin = 0;
                $e(element).find('.fn-gantt .dataPanel').css('left', scrollNavigation.panelMargin);
            } else if (_panelMargin < scrollNavigation.panelMaxPos * -1) {
                scrollNavigation.panelMargin = scrollNavigation.panelMaxPos * -1;
                $e(element).find('.fn-gantt .dataPanel').css('left', scrollNavigation.panelMargin);
            } else {
                scrollNavigation.panelMargin = _panelMargin;
                $e(element).find('.fn-gantt .dataPanel').css('left', scrollNavigation.panelMargin);
            }
            core.synchronizeScroller(element);
        },

        // Synchronize scroller
        synchronizeScroller: function (element) {
            if (options.navigate !== 'scroll') { return; }
            let $rightPanel = $e(element).find('.fn-gantt .rightPanel');
            let $dataPanel = $rightPanel.find('.dataPanel');
            let $sliderBar = $e(element).find('.nav-slider-bar');
            let $sliderBtn = $sliderBar.find('.nav-slider-button');

            let bWidth = $sliderBar.width();
            let wButton = $sliderBtn.width();

            let pLeft = $dataPanel.width() - $rightPanel.width();
            let hPos = $dataPanel.css('left') || 0;
            if (hPos) {
                hPos = hPos.replace('px', '');
            }
            let pos = hPos * bWidth / pLeft - $sliderBtn.width() * 0.25;
            pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
            $sliderBtn.css('left', pos * -1);
        },


        // waitToggle
        waitToggle: function (element, showCallback) {
            if ($e.isFunction(showCallback)) {
                let $elt = $e(element);
                if (!loader) {
                    loader = $e('<div class="fn-gantt-loader">' +
                        '<div class="fn-gantt-loader-spinner"><span>' + options.waitText + '</span></div></div>');
                }
                $elt.append(loader);
                setTimeout(showCallback, 500);

            } else if (loader) {
                loader.detach();
            }
        }
    };

    let tools = {

        // Return the maximum available date in data depending on the scale
        getMaxDate: function (element) {
            let maxDate = null;
            $e.each(rawData, function (i, entry) {
                let toDate = tools.dateDeserialize(entry.to);
                if (Number.isNaN(toDate)) { return; }
                maxDate = Math.max(maxDate, toDate);
            });
            maxDate = maxDate || new Date();
            let bd;
            switch (options.scale) {
                case 'hours':
                    maxDate.setHours(Math.ceil((maxDate.getHours()) / scaleStep) * scaleStep);
                    maxDate.setHours(maxDate.getHours() + scaleStep * 3);
                    break;
                case 'weeks':
                    { bd = new Date(maxDate);
                    bd = new Date(bd.setDate(bd.getDate() + 3 * 7));
                    let md = Math.floor(bd.getDate() / 7) * 7;
                    maxDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                    break; }
                case 'months':
                    bd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                    bd.setMonth(bd.getMonth() + 2);
                    maxDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                    break;
                case 'days':
                default:
                    maxDate.setHours(0);
                    maxDate.setDate(maxDate.getDate() + 3);
            }
            return maxDate;
        },

        // Return the minimum available date in data depending on the scale
        getMinDate: function (element) {
            let minDate = null;
            $e.each(rawData, function (i, entry) {
                let fromDate = tools.dateDeserialize(entry.from);
                if (Number.isNaN(fromDate)) { return; }
                minDate = minDate > fromDate || minDate === null ? fromDate : minDate;
            });
            minDate = minDate || new Date();
            switch (options.scale) {
                case 'hours':
                    minDate.setHours(Math.floor((minDate.getHours()) / scaleStep) * scaleStep);
                    minDate.setHours(minDate.getHours() - scaleStep * 3);
                    break;
                case 'weeks':
                    { let bd = new Date(minDate);
                    bd = new Date(bd.setDate(bd.getDate() - 1 * 7));
                    let md = Math.floor(bd.getDate() / 7) * 7;
                    minDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                    break; }
                case 'months':
                    minDate.setHours(0, 0, 0, 0);
                    minDate.setDate(1);
                    minDate.setMonth(minDate.getMonth() - 1);
                    break;
                case 'days':
                default:
                    minDate.setHours(0, 0, 0, 0);
                    minDate.setDate(minDate.getDate() - 3);
            }
            return minDate;
        },

        // Return an array of Date objects between `from` and `to`
        parseDateRange: function (from, to) {
            let year = from.getFullYear();
            let month = from.getMonth();
            let date = from.getDate();
            let range = [], i = 0;
            do {
                range[i] = new Date(year, month, date + i);
            } while (range[i++] < to);
            return range;
        },

        // Return an array of Date objects between `from` and `to` hourly
        parseTimeRange: function (from, to, scaleStep) {
            let year = from.getFullYear();
            let month = from.getMonth();
            let date = from.getDate();
            let hour = from.getHours();
            hour -= hour % scaleStep;
            let range = [], h = 0, i = 0;
            do {
                range[i] = new Date(year, month, date, hour + h++ * scaleStep);
                // overwrite any hours repeated due to DST changes
                if (i > 0 && range[i].getHours() === range[i - 1].getHours()) {
                    i--;
                }
            } while (range[i++] < to);
            return range;
        },

        // Return an array of Date objects between a range of weeks
        parseWeeksRange: function (from, to) {
            let current = from.getDayForWeek();
            let ret = [];
            let i = 0;
            do {
                ret[i++] = current.getDayForWeek();
                current.setDate(current.getDate() + 7);
            } while (current <= to);

            return ret;
        },

        // Return an array of Date objects between a range of months
        parseMonthsRange: function (from, to) {
            let current = new Date(from);
            let ret = [];
            let i = 0;
            do {
                ret[i++] = new Date(current.getFullYear(), current.getMonth(), 1);
                current.setMonth(current.getMonth() + 1);
            } while (current <= to);
            return ret;
        },

        // Deserialize a date from a string or integer
        dateDeserialize: function (date) {
            if (typeof date === 'string') {
                date = date.replace(/\/Date\((.*)\)\//, '$1');
                date = $e.isNumeric(date) ? Number.parseInt(date, 10) : $e.trim(date);
            }
            return new Date(date);
        },

        // Generate an id for a date
        genId: function (t) { // letargs
            if ($e.isNumeric(t)) {
                t = new Date(t);
            }
            switch (options.scale) {
                case 'hours':
                    { let hour = t.getHours();
                    if (arguments.length >= 2) {
                        hour = (Math.floor(t.getHours() / arguments[1]) * arguments[1]);
                    }
                    return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour)).getTime(); }
                case 'weeks':
                    { let y = t.getFullYear();
                    let w = t.getWeekOfYear();
                    let m = t.getMonth();
                    if (m === 11 && w === 1) {
                        y++;
                    } else if (!m && w > 51) {
                        y--;
                    }
                    return y + '-' + w; }
                case 'months':
                    return t.getFullYear() + '-' + t.getMonth();
                case 'days':
                default:
                    return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
            }
        },

        // normalizes an array of dates into a map of start-of-day millisecond values
        _datesToDays: function (dates) {
            let dayMap = {};
            for (let i = 0, len = dates.length, day; i < len; i++) {
                day = tools.dateDeserialize(dates[i]);
                dayMap[day.setHours(0, 0, 0, 0)] = true;
            }
            return dayMap;
        },
        // Returns true when the given date appears in the array of holidays, if provided
        isHoliday: (function () {
            if (!options.holidays?.length) {
                return function () { return false; };
            }
            let holidays = false;
            // returns the function that will be used to check for holidayness of a given date
            return function (date) {
                if (!holidays) {
                    holidays = tools._datesToDays(options.holidays);
                }
                return !!holidays[
                    // assumes numeric dates are already normalized to start-of-day
                    $e.isNumeric(date) ?
                        date :
                        (new Date(date.getFullYear(), date.getMonth(), date.getDate())).getTime()
                ];
            };
        })(),

        // Get the current cell height
        getCellSize: function () {
            if (tools._getCellSize === undefined) {
                let measure = $e('<div style="display: none; position: absolute;" class="fn-gantt"><div class="row"></div></div>');
                $e('body').append(measure);
                tools._getCellSize = measure.find('.row').height();
                measure.empty().remove();
            }
            return tools._getCellSize;
        },

        // Get the current page height
        getPageHeight: function (element) {
            return pageNum + 1 === pageCount ? rowsOnLastPage * tools.getCellSize() : options.itemsPerPage * tools.getCellSize();
        }
    };

    let rootContainer;
    if ($e('#' + options.container + '-container').length < 1) {
        rootContainer = $e('<div>');
        rootContainer.attr('id', options.container + '-container');
        $e('#' + options.container).append(rootContainer);
    } else {
        rootContainer = $e('#' + options.container + '-container');
    }
    let rawData = null;        // Received data
    let pageNum = 0;        // Current page number
    let pageCount = 0;      // Available pages count
    let rowsOnLastPage = 0; // How many rows on last page
    let rowsNum = 0;        // Number of total rows
    let hPosition = 0;      // Current position on diagram (Horizontal)
    let dateStart = null;
    let dateEnd = null;
    let scaleOldWidth = null;
    let headerRows = null;
    let scaleStep = null;

    switch (options.scale) {
        //case "hours":
        //    let headerRows = 5;
        //    let scaleStep = 8;
        //    break;
        case 'hours':
            headerRows = 4;
            scaleStep = 1;
            break;
        case 'weeks':
            headerRows = 2;
            scaleStep = 13;
            break;
        case 'months':
            headerRows = 1;
            scaleStep = 14;
            break;
        case 'days':
        default:
            headerRows = 3;
            scaleStep = 13;
    }

    let scrollNavigation = {
        panelMouseDown: false,
        scrollerMouseDown: false,
        mouseX: null,
        panelMargin: 0,
        repositionDelay: 0,
        panelMaxPos: 0,
        canScroll: true
    };
    let gantt = null;
    let loader = null;
    core.create(rootContainer);
}

function EngineerGantt(userOptions) {
    engineerGantt(userOptions);
}

if (!window.engineerLegalPlugins) {
    window.engineerLegalPlugins = {};
}
if (!window.engineerLegalPlugins.gantt) {
    window.engineerLegalPlugins.gantt = { status: 1, version: engineerGanttVersion };
} else if (!window.engineerLegalPlugins.gantt.version) {
    window.engineerLegalPlugins.gantt.version = engineerGanttVersion;
}