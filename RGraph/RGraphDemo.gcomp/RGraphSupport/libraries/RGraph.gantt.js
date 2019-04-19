// version: 2018-10-26
    /**
    * o--------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:               |
    * |                                                                                |
    * |                          http://www.rgraph.net                                 |
    * |                                                                                |
    * | RGraph is licensed under the Open Source MIT license. That means that it's     |
    * | totally free to use and there are no restrictions on what you can do with it!  |
    * o--------------------------------------------------------------------------------o
    */

    RGraph = window.RGraph || {isRGraph: true};

    /**
    * The gantt chart constructor
    * 
    * @param object conf The configuration object. You can also give seperate arguments if you prefer:
    *                    var foo = new RGraph.Gantt('cvs', [[0,50],[25,50],[50,50]]);
    */
    RGraph.Gantt = function (conf)
    {

        /**
        * Allow for object config style
        */
        if (   typeof conf === 'object'
            && typeof conf.data === 'object'
            && typeof conf.id === 'string') {

            var id                        = conf.id
            var canvas                    = document.getElementById(id);
            var data                      = conf.data;
            var parseConfObjectForOptions = true; // Set this so the config is parsed (at the end of the constructor)
        
        } else {
        
            var id     = conf;
            var canvas = document.getElementById(id);
            var data   = arguments[1];
        }



        this.id                = id;
        this.canvas            = canvas;
        this.context           = this.canvas.getContext ? this.canvas.getContext("2d", {alpha: (typeof id === 'object' && id.alpha === false) ? false : true}) : null;
        this.canvas.__object__ = this;
        this.type              = 'gantt';
        this.isRGraph          = true;
        this.uid               = RGraph.CreateUID();
        this.canvas.uid        = this.canvas.uid ? this.canvas.uid : RGraph.CreateUID();
        this.data              = data;
        this.colorsParsed      = false;
        this.coordsText        = [];
        this.original_colors   = [];
        this.firstDraw         = true; // After the first draw this will be false



        
        // Set some defaults
        this.properties =
        {
            'chart.background.barcount':    null,
            'chart.background.barcolor1':   'rgba(0,0,0,0)',
            'chart.background.barcolor2':   'rgba(0,0,0,0)',
            'chart.background.grid':        true,
            'chart.background.grid.width':  1,
            'chart.background.grid.color':  '#ddd',
            'chart.background.grid.hsize':  20,
            'chart.background.grid.vsize':  20,
            'chart.background.grid.hlines': true,
            'chart.background.grid.vlines': true,
            'chart.background.grid.border': true,
            'chart.background.grid.autofit':true,
            'chart.background.grid.autofit.align':true,
            'chart.background.grid.autofit.numhlines': 7,
            'chart.background.grid.autofit.numvlines': null,
            'chart.vbars':                  [],
            'chart.hbars':                  [],
            'chart.text.size':              12,
            'chart.text.font':              'Arial, Verdana, sans-serif',
            'chart.text.color':             'black',
            'chart.text.accessible':               true,
            'chart.text.accessible.overflow':      'visible',
            'chart.text.accessible.pointerevents': false,
            'chart.gutter.left':            75,
            'chart.gutter.right':           25,
            'chart.gutter.top':             35,
            'chart.gutter.bottom':          25,
            'chart.labels':                 [],
            'chart.labels.color':           null,
            'chart.labels.align':           'bottom',
            'chart.labels.inbar':           null,
            'chart.labels.inbar.color':     'black',
            'chart.labels.inbar.bgcolor':   null,
            'chart.labels.inbar.align':     'left',
            'chart.labels.inbar.size':      10,
            'chart.labels.inbar.font':      'Segoe UI, Arial, Verdana, sans-serif',
            'chart.labels.inbar.above':     false,
            'chart.labels.percent':         true,
            'chart.vmargin':                 2,
            'chart.title':                  '',
            'chart.title.background':       null,
            'chart.title.x':                null,
            'chart.title.y':                null,
            'chart.title.bold':             true,
            'chart.title.font':             null,
            'chart.title.yaxis':            '',
            'chart.title.yaxis.bold':        true,
            'chart.title.yaxis.pos':        null,
            'chart.title.yaxis.color':      null,
            'chart.title.yaxis.position':   'right',
            'chart.title.yaxis.x':          null,
            'chart.title.yaxis.y':          null,
            'chart.title.xaxis.x':          null,
            'chart.title.xaxis.y':          null,
            'chart.title.xaxis.bold':       true,
            'chart.title.xaxis.color':      null,
            'chart.title.x':                null,
            'chart.title.y':                null,
            'chart.title.halign':           null,
            'chart.title.valign':           null,
            'chart.borders':                true,
            'chart.defaultcolor':           'white',
            'chart.coords':                 [],
            'chart.tooltips':               null,
            'chart.tooltips.effect':         'fade',
            'chart.tooltips.css.class':      'RGraph_tooltip',
            'chart.tooltips.highlight':     true,
            'chart.tooltips.event':         'onclick',
            'chart.highlight.stroke':       'rgba(0,0,0,0)',
            'chart.highlight.fill':         'rgba(255,255,255,0.7)',
            'chart.xmin':                   0,
            'chart.xmax':                   0,
            'chart.contextmenu':            null,
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.zoom.factor':            1.5,
            'chart.zoom.fade.in':           true,
            'chart.zoom.fade.out':          true,
            'chart.zoom.hdir':              'right',
            'chart.zoom.vdir':              'down',
            'chart.zoom.frames':            25,
            'chart.zoom.delay':             16.666,
            'chart.zoom.shadow':            true,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.resizable':              false,
            'chart.resize.handle.adjust':   [0,0],
            'chart.resize.handle.background': null,
            'chart.adjustable':             false,
            'chart.adjustable.only':        null,
            'chart.events.click':           null,
            'chart.events.mousemove':       null,
            'chart.clearto':   'rgba(0,0,0,0)'
        }

        // DATA NOW IS **REQUIRED** TO BE AN OBJECT
        //
        // First thing to do is convert an object based configuration
        // to an array one.
        //if (typeof conf.data === 'object') {
        //
        //        // This little function saves duplication. It tests the
        //        // config object/arr and sets objects to arrays
        //        var convert = function (orig)
        //        {
        //            var arr = [
        //                typeof orig.start      === 'number' ? orig.start      : null,
        //                typeof orig.duration   === 'number' ? orig.duration   : null,
        //                typeof orig.complete   === 'number' ? orig.complete   : null,
        //                typeof orig.label      === 'string' ? orig.label      : null,
        //                typeof orig.background === 'string' ? orig.background : null,
        //                typeof orig.foreground === 'string' ? orig.foreground : null,
        //                typeof orig.border     === 'string' ? orig.border     : null,
        //                typeof orig.linewidth  === 'number' ? orig.linewidth  : null
        //            ];
        //
        //            // Some alternative names that are usable
        //            if (typeof orig.color       === 'string') arr[5] = orig.color;
        //            if (typeof orig.bordercolor === 'string') arr[6] = orig.bordercolor;
        //            
        //            return arr;
        //        };
        //
        //
        //    // Go through the array and convert objects back to arrays for BC
        //    for (var i=0; i<conf.data.length; ++i) {
        //
        //
        //
        //        // Single event
        //        if (   typeof conf.data[i] === 'object'
        //            && !RGraph.isNull(conf.data[i])
        //            && typeof conf.data[i].start === 'number') {
        //
        //            conf.data[i] = convert(conf.data[i]);
        //        
        //        // Multiple events
        //        } else if (   typeof conf.data[i]    === 'object'
        //                   && typeof conf.data[i][0] === 'object'
        //                   && !RGraph.isNull(conf.data[i][0])
        //                   && typeof conf.data[i][0].start === 'number') {
        //            
        //            for (var j=0; j<conf.data[i].length; ++j) {
        //                conf.data[i][j] = convert(conf.data[i][j]);
        //            }
        //        }
        //    }
        //}



        /**
        * Create the dollar objects so that functions can be added to them
        */
        if (!data) {
            alert('[GANTT] The Gantt chart event data is now supplied as the second argument to the constructor - please update your code');
        } else {
            // Go through the data converting relevant args to numbers
            for (var i=0,idx=0; i<data.length; ++i) {
                if (typeof data[i].start     === 'string') data[i].start     = parseFloat(data[i].start);
                if (typeof data[i].duration  === 'string') data[i].duration  = parseFloat(data[i].duration);
                if (typeof data[i].complete  === 'string') data[i].complete  = parseFloat(data[i].complete);
                if (typeof data[i].linewidth === 'string') data[i].linewidth = parseFloat(data[i].linewidth);
            }
        }
        
        // Linearize the data (DON'T use RGraph.arrayLinearize() here)
        for (var i=0,idx=0; i<data.length; ++i) {
            if (RGraph.isArray(this.data[i][0])) {
                for (var j=0; j<this.data[i].length; ++j) {
                    this['$' + (idx++)] = {};
                }
            } else {
                this['$' + (idx++)] = {};
            }
        }



        /*
        * Translate half a pixel for antialiasing purposes - but only if it hasn't beeen
        * done already
        */
        if (!this.canvas.__rgraph_aa_translated__) {
            this.context.translate(0.5,0.5);
            
            this.canvas.__rgraph_aa_translated__ = true;
        }




        // Short variable names
        var RG   = RGraph,
            ca   = this.canvas,
            co   = ca.getContext('2d'),
            prop = this.properties,
            pa2  = RG.path2,
            win  = window,
            doc  = document,
            ma   = Math
        
        
        
        /**
        * "Decorate" the object with the generic effects if the effects library has been included
        */
        if (RG.Effects && typeof RG.Effects.decorate === 'function') {
            RG.Effects.decorate(this);
        }




        /**
        * A peudo setter
        * 
        * @param name  string The name of the property to set
        * @param value mixed  The value of the property
        */
        this.set =
        this.Set = function (name)
        {
            var value = typeof arguments[1] === 'undefined' ? null : arguments[1];

            /**
            * the number of arguments is only one and it's an
            * object - parse it for configuration data and return.
            */
            if (arguments.length === 1 && typeof name === 'object') {
                RG.parseObjectStyleConfig(this, name);
                return this;
            }




    
            /**
            * This should be done first - prepend the propertyy name with "chart." if necessary
            */
            if (name.substr(0,6) != 'chart.') {
                name = 'chart.' + name;
            }




            // Convert uppercase letters to dot+lower case letter
            while(name.match(/([A-Z])/)) {
                name = name.replace(/([A-Z])/, '.' + RegExp.$1.toLowerCase());
            }
    
            if (name == 'chart.margin') {
                name = 'chart.vmargin'
            }
            
            if (name == 'chart.events') {
                alert('[GANTT] The chart.events property is deprecated - supply the events data as an argument to the constructor instead');
                this.data = value;
            }





    
            prop[name] = value;
    
            return this;
        };




        /**
        * A peudo getter
        * 
        * @param name  string The name of the property to get
        */
        this.get =
        this.Get = function (name)
        {
            /**
            * This should be done first - prepend the property name with "chart." if necessary
            */
            if (name.substr(0,6) != 'chart.') {
                name = 'chart.' + name;
            }

            // Convert uppercase letters to dot+lower case letter
            while(name.match(/([A-Z])/)) {
                name = name.replace(/([A-Z])/, '.' + RegExp.$1.toLowerCase());
            }
    
            if (name == 'chart.margin') {
                name = 'chart.vmargin'
            }
    
            return prop[name.toLowerCase()];
        };




        /**
        * Draws the chart
        */
        this.draw =
        this.Draw = function ()
        {
            /**
            * Fire the onbeforedraw event
            */
            RG.FireCustomEvent(this, 'onbeforedraw');
    
    
    
            /**
            * This is new in May 2011 and facilitates indiviual gutter settings,
            * eg chart.gutter.left
            */
            this.gutterLeft   = prop['chart.gutter.left'];
            this.gutterRight  = prop['chart.gutter.right'];
            this.gutterTop    = prop['chart.gutter.top'];
            this.gutterBottom = prop['chart.gutter.bottom'];
            
            /**
            * Stop this growing uncntrollably
            */
            this.coordsText = [];
    
    
            /**
            * Parse the colors. This allows for simple gradient syntax
            */
            if (!this.colorsParsed) {

                this.parseColors();
                
                // Don't want to do this again
                this.colorsParsed = true;
            }

            /**
            * Work out the graphArea
            */
            this.graphArea     = ca.width - this.gutterLeft - this.gutterRight;
            this.graphHeight   = ca.height - this.gutterTop - this.gutterBottom;
            this.numEvents     = this.data.length
            this.barHeight     = this.graphHeight / this.numEvents;
            this.halfBarHeight = this.barHeight / 2;
    
    
    
    
            /**
            * Draw the background
            */
            RG.background.Draw(this);
    
    
    
            /**
            * Draw the labels at the top
            */
            this.drawLabels();
    
    
    
            /**
            * Draw the events
            */
            this.DrawEvents();
    
    
    
            /**
            * Setup the context menu if required
            */
            if (prop['chart.contextmenu']) {
                RG.ShowContext(this);
            }
    
            
            /**
            * This function enables resizing
            */
            if (prop['chart.resizable']) {
                RG.AllowResizing(this);
            }
    
    
            /**
            * This installs the event listeners
            */
            RG.InstallEventListeners(this);
    

            /**
            * Fire the onfirstdraw event
            */
            if (this.firstDraw) {
                this.firstDraw = false;
                RG.fireCustomEvent(this, 'onfirstdraw');
                this.firstDrawFunc();
            }




            /**
            * Fire the RGraph ondraw event
            */
            RG.FireCustomEvent(this, 'ondraw');
            
            return this;
        };
        
        
        
        /**
        * Used in chaining. Runs a function there and then - not waiting for
        * the events to fire (eg the onbeforedraw event)
        * 
        * @param function func The function to execute
        */
        this.exec = function (func)
        {
            func(this);
            
            return this;
        };








        //
        // Draws the labels at the top and the left of the chart
        //
        this.drawLabels =
        this.DrawLabels = function ()
        {
            // Draw the X labels at the top/bottom of the chart.
            var labels      = prop['chart.labels'],
                labelsColor = prop['chart.labels.color'] || prop['chart.text.color'],
                labelSpace  = (this.graphArea) / labels.length,
                x           = this.gutterLeft + (labelSpace / 2),
                y           = this.gutterTop - (prop['chart.text.size'] / 2) - 5,
                font        = prop['chart.text.font'],
                size        = prop['chart.text.size'];

            co.beginPath();
            co.fillStyle = prop['chart.text.color'];
            co.strokeStyle = 'black'
            
            /**
            * This facilitates chart.labels.align
            */
            if (prop['chart.labels.align'] == 'bottom') {
                y = ca.height - this.gutterBottom + size + 2;
            }
    
            /**
            * Draw the horizontal labels
            */
            for (i=0; i<labels.length; ++i) {

                RG.text2(this,{
                    font:   font,
                    size:   size,
                    x:      x + (i * labelSpace),
                    y:      y,
                    text:   String(labels[i]),
                    halign: 'center',
                    valign: 'center',
                    tag:    'labels.horizontal'
                });
            }

            // Draw the vertical labels
            for (var i=0,len=this.data.length; i<len; ++i) {

                var ev = this.data[i],
                    x  = this.gutterLeft,
                    y  = this.gutterTop + this.halfBarHeight + (i * this.barHeight);
                
                co.fillStyle = labelsColor || prop['chart.text.color'];

                // Determine whether the event is just a single event or an array
                // of multiple events
                var label = RG.isArray(ev) ? String(ev[0].label) : String(ev.label);

                if (label) {
                    RG.text2(this,{
                        font:   font,
                        size:   size,
                        x:      x - 5,
                        y:      y,
                        text:   label,
                        halign: 'right',
                        valign: 'center',
                        tag:    'labels.vertical'
                    });
                }
            }
        };








        /**
        * Draws the events to the canvas
        */
        this.drawEvents =
        this.DrawEvents = function ()
        {
            var events = this.data;
    
            /**
            * Reset the coords array to prevent it growing
            */
            this.coords = [];




            /**
            * First draw the vertical bars that have been added
            */
            if (prop['chart.vbars']) {

                for (i=0,len=prop['chart.vbars'].length; i<len; ++i) {

                    // Boundary checking
                    if (prop['chart.vbars'][i][0] + prop['chart.vbars'][i][1] > prop['chart.xmax']) {
                        prop['chart.vbars'][i][1] = 364 - prop['chart.vbars'][i][0];
                    }
        
                    var barX   = this.gutterLeft + (( (prop['chart.vbars'][i][0] - prop['chart.xmin']) / (prop['chart.xmax'] - prop['chart.xmin']) ) * this.graphArea),
                        barY   = this.gutterTop,
                        width  = (this.graphArea / (prop['chart.xmax'] - prop['chart.xmin']) ) * prop['chart.vbars'][i][1],
                        height = ca.height - this.gutterTop - this.gutterBottom;
                    
                    // Right hand bounds checking
                    if ( (barX + width) > (ca.width - this.gutterRight) ) {
                        width = ca.width - this.gutterRight - barX;
                    }
        
                    co.fillStyle = prop['chart.vbars'][i][2];
                    co.fillRect(barX, barY, width, height);
                }
            }



            // Now draw the horizontal bars
            if (prop['chart.hbars']) {

                for (i=0,len=prop['chart.hbars'].length; i<len; ++i) {
        
                    if (prop['chart.hbars'][i]) {
                        
                        var barX   = this.gutterLeft,
                            barY   = ((ca.height - this.gutterTop - this.gutterBottom) / this.data.length) * i + this.gutterTop,
                            width  = this.graphArea,
                            height = this.barHeight

                        co.fillStyle = prop['chart.hbars'][i];
                        co.fillRect(barX, barY, width, height);
                    }
                }
            }




            // Draw the events
            var sequentialIndex = 0;

            for (i=0; i<events.length; ++i) {
                if (typeof events[i].start === 'number') {

                    this.DrawSingleEvent(
                        events[i],
                        i,
                        sequentialIndex++
                    );
                } else {
                    for (var j=0; j<events[i].length; ++j) {

                        var subindex = j;

                        this.DrawSingleEvent(
                            events[i][j],
                            i,
                            sequentialIndex++,
                            subindex
                        );

                    }
                }
    
            }
        };








        /**
        * Retrieves the bar (if any) that has been click on or is hovered over
        * 
        * @param object e The event object
        */
        this.getShape =
        this.getBar = function (e)
        {
            e = RG.fixEventObject(e);

            var mouseXY = RG.getMouseXY(e),
                mouseX = mouseXY[0],
                mouseY = mouseXY[1];
    
            /**
            * Loop through the bars determining if the mouse is over a bar
            */
            for (var i=0,len=this.coords.length; i<len; i++) {
    
                var left   = this.coords[i][0],
                    top    = this.coords[i][1],
                    width  = this.coords[i][2],
                    height = this.coords[i][3];
    
                if (   mouseX >= left
                    && mouseX <= (left + width)
                    && mouseY >= top
                    && mouseY <= (top + height)
                   ) {

                    var tooltip = RG.parseTooltipText(
                        prop['chart.tooltips'],
                        i
                    );


                    var ret =  {
                        0: this,   object:  this,
                        1: left,   x:       left,
                        2: top,    y:       top,
                        3: width,  width:   width,
                        4: height, height:  height,
                        5: i,      index:   this.coords[i][4].index,
                                   subindex: (this.coords[i][4] && typeof this.coords[i][4].subindex === 'number' ? this.coords[i][4].subindex : null),
                                   sequentialIndex: this.coords[i][5],
                                   tooltip: tooltip
                    };

                    return ret;
                }
            }
        };








        // Draws a single event
        this.drawSingleEvent =
        this.DrawSingleEvent = function (ev, index, sequentialIndex)
        {
            // Store the indexes on the original data
            ev.index = index;
            if (typeof arguments[3] === 'number') {
                ev.subindex = arguments[3]
            }

            var min = prop['chart.xmin'];

            co.beginPath();
            co.strokeStyle = 'black';
            co.fillStyle = ev.color ? ev.color : prop['chart.defaultcolor'];

            var barStartX  = this.gutterLeft + (((ev.start - min) / (prop['chart.xmax'] - min)) * this.graphArea),
                barStartY  = this.gutterTop + (index * this.barHeight),
                barWidth   = (ev.duration / (prop['chart.xmax'] - min) ) * this.graphArea;

            // If the width is greater than the graph atrea, curtail it
            if ( (barStartX + barWidth) > (ca.width - this.gutterRight) ) {
                barWidth = ca.width - this.gutterRight - barStartX;
            }

            //  Draw the bar storing the coordinates
            this.coords.push([
                barStartX,
                barStartY + prop['chart.vmargin'],
                barWidth,
                this.barHeight - (2 * prop['chart.vmargin']),
                ev,
                sequentialIndex,
            ]);
















            // draw the border around the bar
            if (prop['chart.borders'] || typeof ev.border === 'number') {

                co.strokeStyle = typeof(ev.border) === 'string' ? ev.border : 'black';
                co.lineWidth = (typeof(ev.linewidth) === 'number' ? ev.linewidth : 1);

                if (ev.linewidth !== 0) {
                    co.strokeRect(
                        barStartX,
                        barStartY + prop['chart.vmargin'],
                        barWidth,
                        this.barHeight - (2 * prop['chart.vmargin'])
                    );
                }
            }
            
            // Not entirely sure what this does...
            if (RG.isNull(ev.complete)) {
                co.fillStyle = ev.color ? ev.color : prop['chart.defaultcolor'];
            } else {
                co.fillStyle = ev.background ? ev.background : prop['chart.defaultcolor'];
            }

            co.fillRect(
                barStartX,
                barStartY + prop['chart.vmargin'],
                barWidth,
                this.barHeight - (2 * prop['chart.vmargin'])
            );
    
            // Work out the completeage indicator
            var complete = (ev.complete / 100) * barWidth;
    
            // Draw the % complete indicator. If it's greater than 0
            if (typeof(ev.complete) === 'number') {

                co.fillStyle = ev.color ? ev.color : '#0c0';

                // Draw the percemt complete bar if the complete option is given
                co.fillRect(
                    barStartX,
                    barStartY + prop['chart.vmargin'],
                    (ev.complete / 100) * barWidth,
                    this.barHeight - (2 * prop['chart.vmargin'])
                );
                
                // Don't necessarily have to draw the label
                if (prop['chart.labels.percent']) {
                    
                    co.beginPath();
                    co.fillStyle = prop['chart.text.color'];

                    RG.text2(this,{
                        font:   prop['chart.text.font'],
                        size:   prop['chart.text.size'],
                        x:      barStartX + barWidth + 5,
                        y:      barStartY + this.halfBarHeight,
                        text:   String(ev.complete) + '%',
                        valign: 'center',
                        tag:    'labels.complete'
                    });
                }
            }


            /**
            * Draw the inbar label if it's defined
            */
            if (prop['chart.labels.inbar'] && prop['chart.labels.inbar'][sequentialIndex]) {
                
                var label = String(prop['chart.labels.inbar'][sequentialIndex]),
                    halign = prop['chart.labels.inbar.align'] == 'left' ? 'left' : 'center';

                halign = prop['chart.labels.inbar.align'] == 'right' ? 'right' : halign;
                
                // Work out the position of the text
                if (halign == 'right') {
                    var x = (barStartX + barWidth) - 5;
                } else if (halign == 'center') {
                    var x = barStartX + (barWidth / 2);
                } else {
                    var x = barStartX + 5;
                }
    
    
                // Draw the labels "above" the bar
                if (prop['chart.labels.inbar.above']) {
                    x = barStartX + barWidth + 5;
                    halign = 'left';
                }


                // Set the color
                co.fillStyle = prop['chart.labels.inbar.color'];
                RG.text2(this,{
                    font:         prop['chart.labels.inbar.font'],
                    size:         prop['chart.labels.inbar.size'],
                    x:            x,
                    y:            barStartY + this.halfBarHeight,
                    text:         label,
                    valign:       'center',
                    halign:       halign,
                    bounding:     typeof(prop['chart.labels.inbar.bgcolor']) == 'string',
                    boundingFill: typeof(prop['chart.labels.inbar.bgcolor']) == 'string' ? prop['chart.labels.inbar.bgcolor'] : null,
                    tag:          'labels.inbar'
                });
            }
        };








        /**
        * Each object type has its own Highlight() function which highlights the appropriate shape
        * 
        * @param object shape The shape to highlight
        */
        this.highlight =
        this.Highlight = function (shape)
        {
            if (typeof prop['chart.highlight.style'] === 'function') {
                (prop['chart.highlight.style'])(shape);
            } else {
                RG.Highlight.Rect(this, shape);
            }
        };








        /**
        * The getObjectByXY() worker method. Don't call this call:
        * 
        * RGraph.ObjectRegistry.getObjectByXY(e)
        * 
        * @param object e The event object
        */
        this.getObjectByXY = function (e)
        {
            var mouseXY = RG.getMouseXY(e);
    
            if (
                   mouseXY[0] > this.gutterLeft
                && mouseXY[0] < (ca.width - this.gutterRight)
                && mouseXY[1] > this.gutterTop
                && mouseXY[1] < (ca.height - this.gutterBottom)
                ) {
    
                return this;
            }
        };








        /**
        * This method handles the adjusting calculation for when the mouse is moved
        * 
        * @param object e The event object
        */
        this.adjusting_mousemove =
        this.Adjusting_mousemove = function (e)
        {
            // Handle adjusting for the Bar
            if (prop['chart.adjustable'] && RG.Registry.get('chart.adjusting') && RG.Registry.Get('chart.adjusting').uid == this.uid) {
                
                var bar = RG.Registry.get('chart.adjusting.gantt');

                if (bar) {
                    var mouseXY    = RG.getMouseXY(e),
                        obj        = RG.Registry.get('chart.adjusting.gantt')['object'],
                        index      = bar['index'],
                        subindex   = bar['subindex'],
                        diff       = ((mouseXY[0] - RG.Registry.get('chart.adjusting.gantt')['mousex']) / (ca.width - obj.gutterLeft - obj.gutterRight)) * prop['chart.xmax'],
                        eventStart = RG.Registry.get('chart.adjusting.gantt')['event_start'],
                        duration   = RG.Registry.get('chart.adjusting.gantt')['event_duration'],
                        event      = typeof subindex === 'number' ? obj.data[index][subindex] : obj.data[index]

                    if (bar['mode'] === 'move') {

                        diff = ma.round(diff);

                        // Single event
                        if (RG.isNull(subindex)) {
                        
                            event.start = eventStart + diff;
                            
                            if (eventStart + diff < 0) {
                                obj.data[index].start = 0;

                            } else if ((eventStart + diff + obj.data[index].duration) > prop['chart.xmax']) {
                                obj.data[index].start = prop['chart.xmax'] - obj.data[index].duration;
                            }


                        // Multiple events
                        } else {
                            
                            var index    = RG.Registry.get('chart.adjusting.gantt').index,
                                subindex = RG.Registry.get('chart.adjusting.gantt').subindex,
                                event    = this.data[index][subindex];
                            
                            event.start = eventStart + diff;
                            
                            if ( (eventStart + diff) < 0) {
                                event.start = 0;
                            } else if ( (eventStart + diff + event.duration) > prop['chart.xmax'] ) {
                                event.start = prop['chart.xmax'] - event.duration;
                            }
                        }












                    } else if (bar['mode'] == 'resize') {
        
                        /*
                        * Account for the right hand gutter. Appears to be a FF bug
                        */
                        if (mouseXY[0] > (ca.width - obj.gutterRight)) {
                            mouseXY[0] = ca.width - obj.gutterRight;
                        }
                        
                        var diff = ((mouseXY[0] - RG.Registry.get('chart.adjusting.gantt')['mousex']) / (ca.width - obj.gutterLeft - obj.gutterRight)) * prop['chart.xmax'];
                            diff = ma.round(diff);






                        // Single event
                        if (RG.isNull(subindex)) {
                            obj.data[index].duration = duration + diff;
                            
                            if (obj.data[index].duration < 0) {
                                obj.data[index].duration = 1;
                            }

                        // Multiple events
                        } else {
                            obj.data[index][subindex].duration = duration + diff;
                            
                            if (obj.data[index][subindex].duration < 0) {
                                obj.data[index][subindex].duration = 1;
                            }
                        }
                    }
                    
                    RG.resetColorsToOriginalValues(this);
        
                    //RG.Clear(ca);
                    RG.redrawCanvas(ca);
                    
                    RG.fireCustomEvent(obj, 'onadjust');
                }
            }
        };








        /**
        * This function positions a tooltip when it is displayed
        * 
        * @param obj object    The chart object
        * @param int x         The X coordinate specified for the tooltip
        * @param int y         The Y coordinate specified for the tooltip
        * @param objec tooltip The tooltips DIV element
        *
        this.positionTooltip = function (obj, x, y, tooltip, idx)
        {
            var coordX     = obj.coords[tooltip.__index__][0];
            var coordY     = obj.coords[tooltip.__index__][1];
            var coordW     = obj.coords[tooltip.__index__][2];
            var coordH     = obj.coords[tooltip.__index__][3];
            var canvasXY   = RG.getCanvasXY(obj.canvas);
            var gutterLeft = obj.gutterLeft;
            var gutterTop  = obj.gutterTop;
            var width      = tooltip.offsetWidth;
            var height     = tooltip.offsetHeight;
            var mouseXY    = RG.getMouseXY(window.event);
    
            // Set the top position
            tooltip.style.left = 0;
            tooltip.style.top  = window.event.pageY - height - 5 + 'px';
            
            // By default any overflow is hidden
            tooltip.style.overflow = '';
    
            
            // Reposition the tooltip if at the edges:
            
            // LEFT edge
            if (canvasXY[0] + mouseXY[0] - (width / 2) < 0) {
                tooltip.style.left = canvasXY[0] + mouseXY[0]  - (width * 0.1) + 'px';
    
            // RIGHT edge
            } else if (canvasXY[0] + mouseXY[0]  + (width / 2) > doc.body.offsetWidth) {
                tooltip.style.left = canvasXY[0] + mouseXY[0]  - (width * 0.9) + 'px';
    
            // Default positioning - CENTERED
            } else {
                tooltip.style.left = canvasXY[0] + mouseXY[0]  - (width / 2) + 'px';
            }
        };*/








        /**
        * Returns the X coordinate for the given value
        * 
        * @param number value The desired value (eg minute/hour/day etc)
        */
        this.getXCoord = function (value)
        {
            var min       = prop['chart.xmin'],
                max       = prop['chart.xmax'],
                graphArea = ca.width - this.gutterLeft - this.gutterRight;

            if (value > max || value < min) {
                return null;
            }

            var x = (((value - min) / (max - min)) * graphArea) + this.gutterLeft;
            
            return x;
        };








        /**
        * Returns the value given EITHER the event object OR a two element array containing the X/Y coords
        */
        this.getValue = function (arg)
        {
            if (arg.length == 2) {
                var mouseXY = arg;
            } else {
                var mouseXY = RGraph.getMouseXY(arg);
            }
            
            var mouseX = mouseXY[0],
                mouseY = mouseXY[1];
            
            var value  = (mouseX - this.gutterLeft) / (ca.width - this.gutterLeft - this.gutterRight);
                value *= (prop['chart.xmax'] - prop['chart.xmin']);
            
            // Bounds checking
            if (value < prop['chart.xmin'] || value > prop['chart.xmax']) {
                value = null;
            }
            
            return value;
        };








        /**
        * This allows for easy specification of gradients. Could optimise this not to repeatedly call parseSingleColors()
        */
        this.parseColors = function ()
        {
            // Save the original colors so that they can be restored when the canvas is reset
            if (this.original_colors.length === 0) {
                
                this.original_colors['data'] = RG.arrayClone(this.data);


                this.original_colors['chart.background.barcolor1']  = RG.arrayClone(prop['chart.background.barcolor1']);
                this.original_colors['chart.background.barcolor2']  = RG.arrayClone(prop['chart.background.barcolor2']);
                this.original_colors['chart.background.grid.color'] = RG.arrayClone(prop['chart.background.grid.color']);
                this.original_colors['chart.defaultcolor']          = RG.arrayClone(prop['chart.defaultcolor']);
                this.original_colors['chart.highlight.stroke']      = RG.arrayClone(prop['chart.highlight.stroke']);
                this.original_colors['chart.highlight.fill']        = RG.arrayClone(prop['chart.highlight.fill']);
            }




            /**
            * this.coords can be used here as gradients are only parsed on the SECOND draw - not the first.
            * A .redraw() is downe at the end of the first draw.
            */
            for (var i=0,sequentialIndex=0; i<this.data.length; ++i) {

                // Multiple events
                if (   RG.isArray(this.data[i])
                    && typeof this.data[i][0] === 'object'
                    && typeof this.data[i][0].start === 'number'
                   ) {

                    for (var j=0,len=this.data[i].length; j<len; j+=1,sequentialIndex+=1) {
                        this.data[i][j].background = this.parseSingleColorForGradient(
                            this.data[i][j].background,
                            {start: this.data[i][j].start, duration: this.data[i][j].duration}
                        );

                        this.data[i][j].color = this.parseSingleColorForGradient(
                            this.data[i][j].color, 
                            {start: this.data[i][j].start, duration: this.data[i][j].duration}
                        );
                    }
                
                // Single event
                } else {
                
                    if (typeof this.data[i].background === 'string') {
                        this.data[i].background = this.parseSingleColorForGradient(
                            this.data[i].background,
                            {start: this.data[i].start, duration: this.data[i].duration}
                        );
                    }

                    if (typeof this.data[i].color === 'string') {
                        this.data[i].color = this.parseSingleColorForGradient(
                            this.data[i].color,
                            {start: this.data[i].start, duration: this.data[i].duration}
                        );
                    }

                    ++sequentialIndex;
                }
            }

            prop['chart.background.barcolor1']  = this.parseSingleColorForGradient(prop['chart.background.barcolor1']);
            prop['chart.background.barcolor2']  = this.parseSingleColorForGradient(prop['chart.background.barcolor2']);
            prop['chart.background.grid.color'] = this.parseSingleColorForGradient(prop['chart.background.grid.color']);
            prop['chart.background.color']      = this.parseSingleColorForGradient(prop['chart.background.color']);
            prop['chart.defaultcolor']          = this.parseSingleColorForGradient(prop['chart.defaultcolor']);
            prop['chart.highlight.stroke']      = this.parseSingleColorForGradient(prop['chart.highlight.stroke']);
            prop['chart.highlight.fill']        = this.parseSingleColorForGradient(prop['chart.highlight.fill']);
        };








        /**
        * Use this function to reset the object to the post-constructor state. Eg reset colors if
        * need be etc
        */
        this.reset = function ()
        {
        };




        /**
        * This parses a single color value
        * 
        * @param string color The color to parse
        */
        this.parseSingleColorForGradient = function (color)
        {
            var opts = arguments[1] || {};

            if (!color || typeof(color) != 'string') {
                return color;
            }


            if (color.match(/^gradient\((.*)\)$/i)) {

                // Allow for JSON gradients
                if (color.match(/^gradient\(({.*})\)$/i)) {
                    return RGraph.parseJSONGradient({object: this, def: RegExp.$1});
                }

                var parts = RegExp.$1.split(':'),
                    value = (opts.start + opts.duration) > prop['chart.xmax'] ? prop['chart.xmax'] : (opts.start + opts.duration);

                // Create the gradient
                var grad = co.createLinearGradient(
                    typeof opts.start === 'number' ? this.getXCoord(opts.start) : this.gutterLeft,
                    0,
                    typeof opts.start === 'number' ? this.getXCoord(value) : ca.width - this.gutterRight,
                    0
                );
    
                var diff = 1 / (parts.length - 1);

                grad.addColorStop(0, RG.trim(parts[0]));
                for (var j=1; j<parts.length; ++j) {
                    grad.addColorStop(j * diff, RG.trim(parts[j]));
                }
            }

            return grad ? grad : color;
        };








        /**
        * Using a function to add events makes it easier to facilitate method chaining
        * 
        * @param string   type The type of even to add
        * @param function func 
        */
        this.on = function (type, func)
        {
            if (type.substr(0,2) !== 'on') {
                type = 'on' + type;
            }
            
            if (typeof this[type] !== 'function') {
                this[type] = func;
            } else {
                RG.addCustomEventListener(this, type, func);
            }
    
            return this;
        };








        /**
        * This function runs once only
        * (put at the end of the file (before any effects))
        */
        this.firstDrawFunc = function ()
        {
        };








        /**
        * Gantt chart Grow effect
        * 
        * @param object   obj Options for the grow effect
        * @param function     Optional callback (a function)
        */
        this.grow = function ()
        {
            var obj             = this,
                opt             = arguments[0] || {},
                callback        = arguments[1] ? arguments[1] : function () {},
                canvas          = obj.canvas,
                context         = obj.context,
                numFrames       = opt.frames || 30,
                frame           = 0;
                original_events = RG.arrayClone(obj.data);

            function iterator ()
            {
                RG.clear(obj.canvas);
                RG.redrawCanvas(obj.canvas);


                if (frame <= numFrames) {
                    // Update the events
                    for (var i=0,len=obj.data.length; i<len; ++i) {
                        if (typeof obj.data[i] === 'object' && obj.data[i][0] && typeof obj.data[i][0] === 'object') {
                            for (var j=0; j<obj.data[i].length; ++j) {
                                obj.data[i][j].duration = (frame / numFrames) * original_events[i][j].duration;
                            }
                        } else {
                            obj.data[i].duration = (frame / numFrames) * original_events[i].duration;
                        }
                    }

                    obj.reset();


                    
                    frame++;

                    RGraph.Effects.updateCanvas(iterator);
    
                } else {
                    callback(obj);
                }
            }
            
            iterator();
            
            return this;
        };








        /**
        * This helps the Gantt reset colors when the reset function is called.
        * It handles going through the data and resetting the colors.
        */
        this.resetColorsToOriginalValues = function ()
        {
            /**
            * Copy the original colors over for single-event-per-line data
            */
            for (var i=0; i<this.original_colors['data'].length; ++i) {
                if (this.original_colors['data'][i].background) {
                    this.data[i].background = RG.arrayClone(this.original_colors['data'][i].background);
                }

                if (this.original_colors['data'][i].color) {
                    this.data[i].color = RG.arrayClone(this.original_colors['data'][i].color);
                }
                
                if (typeof this.original_colors['data'][i][0] === 'object' && typeof this.original_colors['data'][i][0].start === 'number') {
                    for (var j=0,len2=this.original_colors['data'][i].length; j<len2; ++j) {
                        this.data[i][j].background = RG.arrayClone(this.original_colors['data'][i][j].background);
                        this.data[i][j].color      = RG.arrayClone(this.original_colors['data'][i][j].color);
                    }
                }
            }
        };





        /**
        * This function resets the object - clearing it of any previously gathered info
        */
        this.reset = function ()
        {
            this.resetColorsToOriginalValues();
        
            this.colorsParsed    = false;
            this.coordsText      = [];
            this.original_colors = [];
            this.firstDraw       = true;
            this.coords          = [];
        };








        // An unused function
        this.sequentialIndex2Grouped=function(){alert('[RGRAPH] Something went badly wrong - contact support');};








        // Determines whether the Gant is adjustable or not
        this.isAdjustable = function (shape)
        {
            if (RG.isNull(prop['chart.adjustable.only'])) {
                return true;
            
            } else if (RG.isArray(prop['chart.adjustable.only']) && prop['chart.adjustable.only'][shape.sequentialIndex]) {
                return true;
            }

            return false;
        };




        /**
        * Register the object
        */
        RG.Register(this);




        /**
        * This is the 'end' of the constructor so if the first argument
        * contains configuration data - handle that.
        */
        if (parseConfObjectForOptions) {
            RG.parseObjectStyleConfig(this, conf.options);
        }
    };