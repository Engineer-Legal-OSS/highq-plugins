/* EngineerTimeline - a HighQ plugin

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

*/

var engineerTimelineVersion = '5.0.0';

function engineerTimeline(userOptions) {
    let rootContainer = null;
    let timelineHeader = null;
    let timelineContainer = null;
    let rawXmlData = null;
    let timelineData = new Map();

    if ($e('#engineertimelinestyles').length == 0) {
        $e('<style id="engineertimelinestyles">.engtimeline { padding-top: 1em; margin-left: 0px; } .timeline-header{display:flex;} .timeline-header .legend-item{display: inline-block; margin-right: 5px; cursor:pointer;} .dimmed{opacity:.5}</style>').appendTo('head');
    }

    let options = new TimelineOptions(userOptions);

    window.engineerLegalPlugins.timeline[options.container] = options;

    function TimelineOptions(customOptions) {
        this.container = customOptions.container ? customOptions.container : null;
        if (!this.container) {
            throw new Error('Option `container` is requred.');
        }
        this.iSheetViewLink = customOptions.iSheetViewLink ? customOptions.iSheetViewLink : null;
        if (!this.iSheetViewLink) {
            try {
                this.iSheetViewLink = getLink(this.container);
            } catch (error) {
                console.log('Cannot use getLink, requires engineerCore version 1.2.1');
            }
        }
        if (!this.iSheetViewLink) {
            throw new Error('Either a link to an iSheet view must be created in this section or Option "iSheetViewLink" must be set.');
        }
        this.iSheetViewUrl = new URL(this.iSheetViewLink);
        this.siteID = this.iSheetViewUrl.searchParams.get('metaData.siteID');
        this.sheetID = this.iSheetViewUrl.searchParams.get('metaData.sheetId');
        this.sheetViewID = this.iSheetViewUrl.searchParams.get('metaData.sheetViewID');
        this.timelineStyle = customOptions.timelineStyle ? customOptions.timelineStyle : '2px solid #000';
        this.nodeSize = customOptions.nodeSize ? customOptions.nodeSize : '25';
        this.itemWidth = customOptions.itemWidth ? customOptions.itemWidth : this.nodeSize * 4;
        this.imageColumn = customOptions.imageColumn ? customOptions.imageColumn : 'false';
        this.buttonText = customOptions.buttonText ? customOptions.buttonText : 'Select Item';
        this.section1Columns = customOptions.section1Columns ? customOptions.section1Columns : 'false';
        this.section2Columns = customOptions.section2Columns ? customOptions.section2Columns : 'false';
        this.statusColumn = customOptions.statusColumn ? customOptions.statusColumn : 'auto';
        this.statusShapes = customOptions.statusShapes ? customOptions.statusShapes : {}; // eg { "In Progress": "circle", "Completed": "square" } - accepts "circle", "square", "triangle", "diamond", "star"
        this.defaultColor = customOptions.defaultColor ? customOptions.defaultColor : '#0a1431';
        // Numeric column index ('0','1', etc.) or 'false' to group all rows under a Default group
        this.groupColumn = customOptions.groupColumn ? customOptions.groupColumn : 'false';
        this.showAllGroup = customOptions.showAllGroup ? customOptions.showAllGroup : 'false';
        this.allGroupTitle = customOptions.allGroupTitle ? customOptions.allGroupTitle : 'All';
        this.defaultGroupTitle = customOptions.defaultGroupTitle ? customOptions.defaultGroupTitle : 'Default';
        this.panelLinks = customOptions.panelLinks ? customOptions.panelLinks : 'false';
        this.verticalLayout = customOptions.verticalLayout ? customOptions.verticalLayout : 'false';
        this.maxHeight = customOptions.maxHeight ? customOptions.maxHeight : 'auto';
        this.quickViewSearchEnabled = customOptions.quickViewSearchEnabled ? customOptions.quickViewSearchEnabled : 'true';
        this.searchDelay = customOptions.searchDelay ? customOptions.searchDelay : 500;
        this.taskSearch = customOptions.taskSearch ? customOptions.taskSearch : 'false';
        // Possible values are blank or self
        this.linkTab = customOptions.linkTab ? customOptions.linkTab : 'blank';
        this.showLegend = customOptions.showLegend ? customOptions.showLegend : 'true';
        this.otherTitle = customOptions.otherTitle ? customOptions.otherTitle : 'Other';
        this.onRender = customOptions.onRender ? customOptions.onRender : function (containerid) { };
        this.hiddenStatus = [];
    }

    createTimeline();

    function createTimeline() {
        timelineHeader = $e('<div>')
            .attr('id', 'timelineHeader_' + options.container)
            .addClass('timeline-header');
        timelineHeader.css(options.groupColumn =='false' ? {'flex-direction': 'row-reverse'} : {});
        timelineContainer = $e('<div>')
            .attr('id', 'timelineContainer_' + options.container)
            .addClass('container-fluid engtimeline');
        if (options.verticalLayout != 'true') {
            timelineContainer.css('overflow-x', 'auto');
        } else if (options.maxHeight != 'auto' && Number.isInteger(Number.parseInt(options.maxHeight))) {
            timelineContainer.css({ 'max-height': options.maxHeight + 'px', 'overflow-y': 'auto' });
        }
        rootContainer = $e('#' + options.container);
        rootContainer.parents('.ckContentArea').css('display', 'contents');
        rootContainer.append(timelineHeader);
        rootContainer.append(timelineContainer);
        engineercore_loadDoc(options.iSheetViewLink, buildQuickViewUI);
    }

    /**
     * Builds UI based on XML data
     */
    function buildQuickViewUI(xmlDoc) {
        rawXmlData = xmlToObj(xmlDoc);
        if (rawXmlData.view.head?.headColumn) {
            for (let i = 0; i < rawXmlData.view.head.headColumn.length; i++) {
                let header = rawXmlData.view.head.headColumn[i];
                if (header.columnTypeAlias === 'SHEET_COLUMN_TYPE_CHOICE' && options.statusColumn == 'auto') {
                    options.statusColumn = i.toString();
                }
            }
        }
        if (rawXmlData.view.data?.item) {
            renderTimeline();
        }
    }

    function buildLegend() {
        let $legendContainer = $e('<div class="legendPanel"/>')
            .css({ 'text-align': 'right' })
            .prepend($e('<span class="legendSettingsToggle" style="cursor:pointer;">⚙️ </span><span class="legendTitle" style="font-weight:600"><span class="legendTitle" style="font-weight:600; padding-left:10px">Legend: </span>'));
        let legendArr = [];
        let titles = [];

        if (options.statusColumn != 'auto' && rawXmlData.view.data.item) {
            rawXmlData.view.data.item.forEach(calcLegend);
        }
        legendArr.forEach(function (item) {
            buildLegendItem(item);
        });

        $e(timelineHeader).append($legendContainer);

        $e('.legendSettingsToggle').popover({
            html: true,
            trigger: 'click',
            placement: 'bottom',
            container: 'body',
            title: 'Legend Settings',
            template: `
    <div class="popover legend-popover" role="tooltip">
      <div class="arrow"></div><h6 class="popover-title"></h6>
      <div class="popover-content"></div>
    </div>
  `,
            content: '<div></div>'
        });

        $e('.legendSettingsToggle').on('click', function () {
            $e(this).popover('show');
            setTimeout(() => {
                const $popover = $e(this).data('bs.popover').$tip;
                const content = $popover.find('.popover-content');
                content.html(`
            <div style="min-width:9em;">
                <div>
                    <label style="margin-right:10px;">
                        <input type="radio" name="legendMode" id="legendModeShow" value="hideOthers">
                        Click to Show
                    </label>
                    <br/>
                    <label>
                        <input type="radio" name="legendMode" id="legendModeHide" value="hideSelf">
                        Click to Hide
                    </label>
                </div>
            </div>
        `);

                const radioShow = document.getElementById('legendModeShow');
                const radioHide = document.getElementById('legendModeHide');
                const stored = localStorage.getItem('engineerlegal-legendClickMode');
                if (stored === 'hideSelf') {
                    radioHide.checked = true;
                } else {
                    // default to show behavior (hideOthers)
                    radioShow.checked = true;
                }

                [radioShow, radioHide].forEach(r => r.addEventListener('change', () => {
                    if (radioShow.checked) {
                        localStorage.setItem('engineerlegal-legendClickMode', radioShow.value);
                    } else if (radioHide.checked) {
                        localStorage.setItem('engineerlegal-legendClickMode', radioHide.value);
                    }
                }));

                // Recenter
                const popoverWidth = $popover.outerWidth();
                const triggerOffset = $e(this).offset();
                const triggerWidth = $e(this).outerWidth();
                const left = triggerOffset.left + (triggerWidth / 2) - (popoverWidth / 2);
                $popover.css('left', `${left}px`);
            }, 10);
        });

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
                .text(item.title)
                .on('click', function () {
                    // Determine legend click behavior from persisted setting
                    const mode = localStorage.getItem('engineerlegal-legendClickMode') || 'hideSelf';

                    if (mode === 'hideSelf') {
                        // Original toggle behavior: toggle this class only
                        if (options.hiddenStatus.includes(classId)) {
                            options.hiddenStatus.splice(options.hiddenStatus.indexOf(classId), 1);
                            $e(this).removeClass('dimmed');
                            $e('#' + options.container + ' .eng-timeline-container.' + classId).removeClass('hidden');
                        } else {
                            options.hiddenStatus.push(classId);
                            $e(this).addClass('dimmed');
                            $e('#' + options.container + ' .eng-timeline-container.' + classId).addClass('hidden');
                        }
                    } else {
                        // hideOthers: when clicking an item, hide all other classes and show this class only.
                        // If currently only this class is visible (i.e., hiddenStatus contains everything except this), then reset to show all.
                        // Build a set of all legend class ids from the legend container
                        const legendItems = $e(this).parent().find('.legend-item');
                        const allClassIds = [];
                        legendItems.each(function () {
                            const cls = $e(this).attr('class').match(/legend-item-([a-zA-Z0-9-_]+)/);
                            if (cls?.[1]) {
                                allClassIds.push(cls[1]);
                            }
                        });

                        // Compute currently visible set (i.e., not hidden)
                        const currentlyHidden = new Set(options.hiddenStatus.slice());
                        const currentlyVisible = allClassIds.filter(id => !currentlyHidden.has(id));

                        // If the only visible class is the one clicked, then reset (show all)
                        if (currentlyVisible.length === 1 && currentlyVisible[0] === classId) {
                            // clear hiddenStatus
                            options.hiddenStatus = [];
                            // remove dim/fade from all
                            legendItems.removeClass('dimmed');
                            allClassIds.forEach(id => $e('#' + options.container + ' .eng-timeline-container.' + id).removeClass('hidden'));
                        } else {
                            // hide all others (add all other ids to hiddenStatus), ensure this class is visible
                            options.hiddenStatus = allClassIds.filter(id => id !== classId);
                            // update classes
                            legendItems.each(function () {
                                const cls = $e(this).attr('class').match(/legend-item-([a-zA-Z0-9-_]+)/);
                                if (cls?.[1]) {
                                    if (cls[1] === classId) {
                                        $e(this).removeClass('dimmed');
                                        $e('#' + options.container + ' .eng-timeline-container.' + cls[1]).removeClass('hidden');
                                    } else {
                                        $e(this).addClass('dimmed');
                                        $e('#' + options.container + ' .eng-timeline-container.' + cls[1]).addClass('hidden');
                                    }
                                }
                            });
                        }
                    }
                });
            $legendContainer.append(legendElement);
        }
    }

    function renderTimeline() {
        let allGroup;
        rawXmlData.view.data.item.forEach(function (v, i) {
            let groupname;
            let multiGroup = [];
            if (i == 0 && options.showAllGroup != 'false') {
                timelineData.set(options.allGroupTitle, {
                    rows: [i]
                });
                allGroup = timelineData.get(options.allGroupTitle);
            }
            if (options.groupColumn != 'false') {
                if (rawXmlData.view.head.headColumn[options.groupColumn].columnTypeAlias === 'SHEET_COLUMN_TYPE_CHOICE') {
                    if (v.column[options.groupColumn].rawData.choice) {
                        v.column[options.groupColumn].rawData.choice.forEach(group => {
                            multiGroup.push(group.cdata);
                        });
                    } else {
                        multiGroup.push(options.defaultGroupTitle);
                    }
                }
                groupname = v.column[options.groupColumn].displayData.cdata;
            } else {
                groupname = options.defaultGroupTitle;
            }
            if (options.showAllGroup != 'false') {
                allGroup.rows.push(i);
            }
            if (multiGroup.length) {
                multiGroup.forEach(group => {
                    if (!timelineData.has(group)) {
                        timelineData.set(group, {
                            rows: [i]
                        });
                    } else {
                        let data = timelineData.get(group);
                        data.rows.push(i);
                    }
                });
            } else if (!timelineData.has(groupname)) {
                timelineData.set(groupname, {
                    rows: [i]
                });
            } else {
                let data = timelineData.get(groupname);
                data.rows.push(i);
            }
        });
        if (options.groupColumn != 'false') {
            buildQuickViewButton(options.container + '-quickViewSelector', timelineData.keys());
        } else {
            buildTimeline(null, options.defaultGroupTitle);
        }
    }

    /**
     * Creates html markup for quickview button
     */
    function buildQuickViewButton(buttonId, items) {
        if (timelineData.size > 0) {
            let buttonContainer = document.createElement('div');
            let button = document.createElement('button');
            let caret = document.createElement('span');
            let optionsContainer = document.createElement('ul');
            let selectedQuickViewLabel = document.createElement('span');
            let callFirstQuickView = null;
            caret.className = 'caret';
            button.textContent = options.buttonText;
            button.append(caret);
            button.id = buttonId;
            button.className = 'btn btn-danger dropdown-toggle';
            button.setAttribute('type', 'button');
            button.setAttribute('aria-haspopup', 'true');
            button.setAttribute('aria-expanded', 'false');
            button.style = 'float:left; margin-right:10px';
            button.dataset.toggle = 'dropdown';
            button.dataset.haspopup = 'true';
            optionsContainer.className = 'dropdown-menu';
            optionsContainer.style = 'width: max-content; max-width: 90vw; top:35px';
            optionsContainer.setAttribute('aria-labelledby', buttonId);
            // Create search box for typeahead
            const timelineItem = document.createElement('li');
            const typeAheadInput = document.createElement('input');
            const selector = '#' + timelineHeader.id + ' ul li.quickview-item';
            let searchHandler;
            if (options.quickViewSearchEnabled != 'false') {
                typeAheadInput.placeholder = 'Filter';
                typeAheadInput.className = 'form-control';
                typeAheadInput.style = 'margin: 10px 20px; width: 50%';
                $e(typeAheadInput).keyup(function () {
                    const term = $e(this).val();
                    if (searchHandler) {
                        clearTimeout(searchHandler);
                    }
                    if (term.length > 0) {
                        searchHandler = setTimeout(function () {
                            const items = $e(selector + ':icontains(' + term + ')');
                            $e(selector).hide();
                            items.each(function () {
                                $e(this).show();
                            });
                        }, options.searchDelay);
                    } else {
                        $e(selector).show();
                    }
                });
                timelineItem.append(typeAheadInput);
                optionsContainer.append(timelineItem);

                // Create menu item for each group
                for (const item of items) {
                    let listItem = document.createElement('li');
                    let link = document.createElement('a');
                    listItem.className = 'quickview-item';
                    link.style = 'white-space: normal;';
                    link.href = '#';
                    link.textContent = item;
                    $e(link).click(function () {
                        buildTimeline(buttonId, item);
                    });
                    if (callFirstQuickView === null) {
                        callFirstQuickView = function () {
                            buildTimeline(buttonId, item);
                        };
                    }
                    listItem.append(link);
                    optionsContainer.append(listItem);
                }

                selectedQuickViewLabel.id = buttonId + 'Label';
                selectedQuickViewLabel.textContent = '';
                buttonContainer.id = timelineHeader.id + 'Menu';
                buttonContainer.className = 'dropdown';
                buttonContainer.style = 'min-height:35px; display:flex; align-items: flex-start';
                buttonContainer.append(button);
                buttonContainer.append(selectedQuickViewLabel);
                buttonContainer.append(optionsContainer);
                $e(timelineHeader).append(buttonContainer);
                $e('.dropdown-toggle').dropdown();
                if (options.quickViewSearchEnabled != 'false') {
                    // Focus sarch input when opning dropdown
                    $e('#' + buttonContainer.id).on('shown.bs.dropdown', function () {
                        $e(typeAheadInput).focus();
                    });
                    // Remove search term when closing dropdown
                    $e('#' + buttonContainer.id).on('hide.bs.dropdown', function () {
                        $e(selector).show();
                        $e(typeAheadInput).val('');
                    });
                }
                callFirstQuickView();
            }
        } else {
            buildTimeline(buttonId, options.defaultGroupTitle);
        }
    }

    function buildTimeline(buttonId, groupName) {
        if (buttonId) {
            $e('#' + buttonId + 'Label').empty();
            $e('#' + buttonId + 'Label').append('<strong>' + groupName + '</strong>');
            $e(timelineContainer).empty();
            $e(timelineContainer).hide();
        }
        let timelineList1 = document.createElement('div');
        timelineList1.setAttribute('id', '1timeline-' + options.container);
        timelineList1.className = 'timeline';
        timelineList1.style = 'display: flex; align-items: flex-end; justify-content: flex-start';
        let timelineList2 = document.createElement('div');
        timelineList2.setAttribute('id', '2timeline-' + options.container);
        timelineList2.className = 'timeline';
        timelineList2.style = 'display: flex; align-items: flex-start; justify-content: flex-start';

        if (options.verticalLayout == 'true') {
            timelineList1.style.flexDirection = 'column';
            timelineList2.style.flexDirection = 'column';
        }

        if (timelineData.size) {
            let timelinePosition = 0;
            for (const row of timelineData.get(groupName).rows) {
                let itemData = rawXmlData.view.data.item[row];
                let verticalRow;
                let statusClass = '';
                if (options.statusColumn != 'false' && options.statusColumn != 'auto') {
                    statusClass = engineercore_safeCSS(itemData.column[options.statusColumn].displayData.cdata);
                }
                if (options.verticalLayout == 'true') {
                    verticalRow = document.createElement('div');
                    verticalRow.className = 'timelineRow eng-timeline-container ' + statusClass;
                    verticalRow.style.display = 'flex';
                }
                let timelineItemContainer1 = document.createElement('div');
                let itemSection1 = document.createElement('div');
                itemSection1.className = 'section1 eng-timeline-container ' + statusClass;
                itemSection1.style = 'padding: 0px ' + options.nodeSize / 2 + 'px;display: flex;flex-direction: column;';
                itemSection1.style.width = options.itemWidth + 'px';
                itemSection1.style.marginBottom = options.nodeSize / 2 + 'px';
                if (options.verticalLayout != 'true') {
                    itemSection1.style.textAlign = 'center';
                } else {
                    itemSection1.style.textAlign = 'right';
                }

                if (options.section1Columns != 'false') {
                    let s1cols = options.section1Columns.split(',');
                    s1cols.forEach(function (column, i) {
                        let itemSection1Span = document.createElement('span');
                        itemSection1Span.className = 'engSection1 engItem' + i;
                        itemSection1Span.innerHTML = buildNodeContent(itemData.column[column]);
                        if (options.verticalLayout != 'true') {
                            itemSection1Span.style.padding = '2px 0px';
                        } else {
                            itemSection1Span.style.padding = '0px 5px';
                        }
                        itemSection1.prepend(itemSection1Span);
                    });
                    if (options.verticalLayout != 'true') {
                        timelineItemContainer1.append(itemSection1);
                    }
                }
                let timelineItemContainer2 = document.createElement('div');
                let itemSection2 = document.createElement('div');
                itemSection2.className = 'section2 eng-timeline-container ' + statusClass;
                itemSection2.style = 'position: relative;';
                if (options.verticalLayout != 'true') {
                    itemSection2.style.textAlign = 'center';
                    itemSection2.style.padding = options.nodeSize / 2 + 'px 0px';
                }
                itemSection2.style.width = options.itemWidth + 'px';

                if (options.verticalLayout == 'true') {
                    itemSection2.style.borderLeft = options.timelineStyle;
                } else {
                    itemSection2.style.borderTop = options.timelineStyle;
                }

                if (options.section2Columns != 'false') {
                    let s2cols = options.section2Columns.split(',');
                    s2cols.forEach(function (column, i) {
                        let itemSection2Span = document.createElement('span');
                        itemSection2Span.className = 'engSection2 engItem' + i;
                        itemSection2Span.style.display = 'block';
                        if (options.verticalLayout != 'true') {
                            itemSection2Span.style.padding = '2px 0px';
                        } else {
                            itemSection2Span.style.padding = '0px ' + (options.nodeSize / 2 + 5) + 'px';
                        }
                        itemSection2Span.innerHTML = buildNodeContent(itemData.column[column]);
                        itemSection2.prepend(itemSection2Span);
                    });
                }
                let itemNode = document.createElement('div');
                itemNode.className = 'timeline-node';
                itemNode.style = 'border-radius: 3px;border: 1px solid #0A1431;position: absolute;';
                itemNode.style.width = options.nodeSize + 'px';
                itemNode.style.height = options.nodeSize + 'px';
                if (options.verticalLayout == 'true') {
                    itemNode.style.left = '-' + (options.nodeSize / 2 + 1) + 'px';
                    itemNode.style.top = '3px';
                } else {
                    itemNode.style.top = '-' + options.nodeSize / 2 + 'px';
                    itemNode.style.left = (options.itemWidth - options.nodeSize) / 2 + 'px';
                }
                if (options.statusColumn != 'false' && options.statusColumn != 'auto') {
                    let color = getChoiceTypeColumnStyle(itemData.column[options.statusColumn].rawData);
                    if (!color) {
                        color = options.defaultColor;
                    }
                    itemNode.style.backgroundColor = color;
                    if (options.statusShapes.hasOwnProperty(itemData.column[options.statusColumn].displayData.cdata)) {
                        let shape = options.statusShapes[itemData.column[options.statusColumn].displayData.cdata];
                        if (shape == 'circle') {
                            itemNode.style.borderRadius = '50%';
                        } else if (shape == 'triangle') {
                            itemNode.style.border = 'none';
                            itemNode.style.backgroundColor = 'transparent';
                            itemNode.style.clipPath = 'none';
                            itemNode.style.transform = 'none';

                            const triangleSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            triangleSvg.setAttribute('width', options.nodeSize);
                            triangleSvg.setAttribute('height', options.nodeSize);
                            triangleSvg.setAttribute('viewBox', '0 0 ' + options.nodeSize + ' ' + options.nodeSize);
                            triangleSvg.style.display = 'block';
                            triangleSvg.style.overflow = 'visible';

                            const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                            triangle.setAttribute('points', (options.nodeSize / 2) + ',' + 0 + ' ' + 0 + ',' + options.nodeSize + ' ' + options.nodeSize + ',' + options.nodeSize);
                            triangle.setAttribute('fill', color);
                            triangle.setAttribute('stroke', '#0A1431');
                            triangle.setAttribute('stroke-width', '1');
                            triangleSvg.appendChild(triangle);
                            itemNode.appendChild(triangleSvg);
                        } else if (shape == 'diamond') {
                            itemNode.style.transform = 'rotate(45deg)';
                        } else if (shape == 'star') {
                            itemNode.style.border = 'none';
                            itemNode.style.backgroundColor = 'transparent';
                            itemNode.style.clipPath = 'none';
                            itemNode.style.transform = 'none';

                            const starSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                            const svgSize = Number(options.nodeSize);
                            starSvg.setAttribute('width', svgSize);
                            starSvg.setAttribute('height', svgSize);
                            starSvg.setAttribute('viewBox', '0 0 ' + svgSize + ' ' + svgSize);
                            starSvg.style.display = 'block';
                            starSvg.style.overflow = 'visible';

                            const center = svgSize / 2;
                            const outerRadius = svgSize / 2;
                            const innerRadius = svgSize / 5;
                            let starPoints = '';
                            for (let i = 0; i < 10; i++) {
                                const angle = (Math.PI / 180) * (i * 36 - 90);
                                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                                const x = center + radius * Math.cos(angle);
                                const y = center + radius * Math.sin(angle);
                                starPoints += x + ',' + y + ' ';
                            }

                            const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                            star.setAttribute('points', starPoints.trim());
                            star.setAttribute('fill', color);
                            star.setAttribute('stroke', '#0A1431');
                            star.setAttribute('stroke-width', '1');
                            starSvg.appendChild(star);
                            itemNode.appendChild(starSvg);
                        } else {
                            itemNode.style.borderRadius = '0';
                        }
                    }
                } else {
                    itemNode.style.backgroundColor = options.defaultColor;
                    itemNode.classList.add('defaultStatus');
                }
                if (options.panelLinks != 'false' || options.taskSearch != 'false') {
                    itemNode.style.cursor = 'pointer';
                }
                itemNode.dataset.taskSearch = options.taskSearch == 'false' ? '' : itemData.column[options.taskSearch].displayData.cdata;
                itemNode.dataset.itemId = rawXmlData.view.data.item[row].itemID.cdata;

                itemSection2.prepend(itemNode);
                if (timelinePosition == 0) {
                    let startnode = document.createElement('div');
                    startnode.className = 'start-node';
                    startnode.style = 'position: absolute;';
                    startnode.style.top = '-' + (options.nodeSize / 4) + 'px';
                    if (options.verticalLayout == 'true') {
                        verticalRow.style.paddingTop = (options.nodeSize / 2) + 'px';
                        startnode.style.left = '-' + (options.nodeSize / 4 + 1) + 'px';
                        startnode.style.top = '-' + (options.nodeSize / 2) + 'px';
                    }
                    let itemNode = document.createElement('div');
                    itemNode.className = 'timeline-node';
                    itemNode.style = 'border-radius: 30px;border: 1px solid #0A1431;background: #000';
                    itemNode.style.width = options.nodeSize / 2 + 'px';
                    itemNode.style.height = options.nodeSize / 2 + 'px';
                    startnode.prepend(itemNode);
                    itemSection2.prepend(startnode);
                }
                if (timelinePosition == timelineData.get(groupName).rows.length - 1) {
                    let endNode = document.createElement('div');
                    endNode.className = 'end-node';
                    if (options.verticalLayout == 'true') {
                        endNode.style = 'position: absolute;';
                        endNode.style.bottom = '-' + (options.nodeSize / 4 + 1) + 'px';
                        endNode.style.left = '-' + (options.nodeSize / 4 + 1) + 'px';
                    } else {
                        endNode.style = 'position: relative; float: right';
                        endNode.style.top = '-' + ((options.nodeSize / 4) * 3 + 1) + 'px';
                        endNode.style.left = (options.nodeSize / 4 + 1) + 'px';
                    }
                    let itemNode = document.createElement('div');
                    itemNode.className = 'timeline-node';
                    itemNode.style = 'border-radius: 30px;border: 1px solid #0A1431;background: #000';
                    itemNode.style.width = options.nodeSize / 2 + 'px';
                    itemNode.style.height = options.nodeSize / 2 + 'px';
                    endNode.append(itemNode);
                    if (options.verticalLayout == 'true') {
                        itemSection2.append(endNode);
                    } else {
                        itemSection2.prepend(endNode);
                    }
                }
                if (options.verticalLayout != 'true') {
                    timelineContainer.append(timelineList1);
                    timelineContainer.append(timelineList2);
                    timelineItemContainer2.append(itemSection2);
                    timelineList1.append(timelineItemContainer1);
                    timelineList2.append(timelineItemContainer2);
                } else {
                    verticalRow.append(itemSection1);
                    verticalRow.append(itemSection2);
                    timelineContainer.append(verticalRow);
                }
                timelinePosition++;
            }
        }

        $e('#' + options.container + ' .timeline-node').on('click', function () {
            let taskSearch = encodeURIComponent($e(this).data('taskSearch'));
            let itemId = $e(this).data('itemId');
            let columnTypeAlias = $e(this).data('columnTypeAlias');
            let itemURL = $e(this).data('itemURL');
            if (options.taskSearch != 'false') {
                window.open('./taskHome.action?metaData.siteID=' + options.siteID
                    + '&searchText="' + taskSearch + '"', '_' + options.linkTab).focus();
            } else if (columnTypeAlias == 'SHEET_COLUMN_TYPE_HYPERLINK') {
                if (itemURL != '') {
                    window.open(itemURL, '_' + options.linkTab).focus();
                } else {
                    return;
                }
            } else if (options.panelLinks == 'print') {
                let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetPrintItem');
                let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId + '&view=readonly&injectSheetLinkView=true&isPrintPreview=true');
                window.open(link, '_blank').focus();
            } else if (options.panelLinks == 'isheet') {
                let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                window.open(link, '_' + options.linkTab).focus();
            } else if (options.panelLinks == 'default') {
                let res = options.iSheetViewLink.replace('sheetViewExportXML', 'sheetHome');
                res = res.replace(/metaData.sheetViewID=\d*/i, '');
                let link = res.replace('&metaData.isheetExportType=xml', '&metaData.itemId=' + itemId);
                window.open(link, '_' + options.linkTab).focus();
            } else if (options.panelLinks == 'viewItem') {
                const itemBtn = document.createElement('A');
                itemBtn.className = 'CKContextLink hidden';
                itemBtn.textContent = 'LINK';
                itemBtn.setAttribute('id', '{"linkType":"iSheetItem","siteID":"' + options.siteID + '","contextID":"' + options.sheetID + '","sheetItemID":"' + itemId + '","sheetViewID":"0","viewMode":"0","linkedFromCKEditor":false}');
                let tableBtnLink = buildISheetUrl('injectColumnViewItemPage', itemId, true, {
                    'metaData.viewMode': '0',
                    'view': 'readonly',
                    'sheetItemLinkView': 'false',
                });
                itemBtn.setAttribute('href', tableBtnLink);
                $j('#' + options.container).append(itemBtn);
                rebindCKContentLink();
                itemBtn.click();
                itemBtn.remove();
            } else {
                return;
            }
        });
        if (options.showLegend != 'false') {
            $e(timelineHeader).find('.legendPanel').remove();
            buildLegend();
        }
        $e(timelineContainer).show();
        options.onRender(options.container);
    }

    /**
     * Queries a choice column style with back-compatiblity between engineerCore versions
     * 
     * @param object rawData
     * @returns string
     */
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

    function convertStringToHTML(str) {
        if (str && str.length > 0) {
            let parser = new DOMParser();
            let doc = parser.parseFromString(str, 'text/html');
            return doc.body.innerHTML;
        } else {
            return '';
        }
    }

    function buildNodeContent(sheetData) {
        if (sheetData) {
            if (sheetData.displayData.lookupuser) {
                let users = '';
                sheetData.displayData.lookupuser.forEach(user => {
                    if (user.userDisplayName.cdata) {
                        users += user.userDisplayName.cdata;
                        users += '<br/>';
                    }
                });
                return users;
            } else if (sheetData.displayData.cdata) {
                return convertStringToHTML(sheetData.displayData.cdata);
            } else {
                return '';
            }
        } else {
            return '';
        }
    }

    /**
    * jQuery custom selector that allows to find elements that contain a case insensitive text
    */
    jQuery.expr[':'].icontains = function (a, i, m) {
        return jQuery(a).text().toUpperCase().includes(m[3].toUpperCase());
    };

    /**
    * Creates a new iSheet URL with the specified parameters. 
    */
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
}

function EngineerTimeline(userOptions) {
    engineerTimeline(userOptions);
}

if (!window.engineerLegalPlugins) {
    window.engineerLegalPlugins = {};
}
if (!window.engineerLegalPlugins.timeline) {
    window.engineerLegalPlugins.timeline = { status: 1, version: engineerTimelineVersion };
} else if (!window.engineerLegalPlugins.timeline.version) {
    window.engineerLegalPlugins.timeline.version = engineerTimelineVersion;
}