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

    RGraph     = window.RGraph || {isRGraph: true};
    RGraph.SVG = RGraph.SVG || {};

// Module pattern
(function (win, doc, undefined)
{
    var RG  = RGraph,
        ua  = navigator.userAgent,
        ma  = Math,
        win = window,
        doc = document;



    RG.SVG.Gauge = function (conf)
    {
        //
        // A setter that the constructor uses (at the end)
        // to set all of the properties
        //
        // @param string name  The name of the property to set
        // @param string value The value to set the property to
        //
        this.set = function (name, value)
        {
            if (arguments.length === 1 && typeof name === 'object') {
                for (i in arguments[0]) {
                    if (typeof i === 'string') {
                    
                        var ret = RG.SVG.commonSetter({
                            object: this,
                            name:   i,
                            value:  arguments[0][i]
                        });
                        
                        name  = ret.name;
                        value = ret.value;

                        this.set(name, value);
                    }
                }
            } else {

                    
                var ret = RG.SVG.commonSetter({
                    object: this,
                    name:   name,
                    value:  value
                });
                
                name  = ret.name;
                value = ret.value;

                this.properties[name] = value;

                // If setting the colors, update the originalColors
                // property too
                //
                // NB Don't need to do this for this chart type
                //if (name === 'colors') {
                //    this.originalColors = RG.SVG.arrayClone(value);
                //    this.colorsParsed = false;
                //}
            }

            return this;
        };







        this.type            = 'gauge';
        this.innerMin        = RG.SVG.stringsToNumbers(conf.innerMin);
        this.innerMax        = RG.SVG.stringsToNumbers(conf.innerMax);
        this.outerMin        = RG.SVG.stringsToNumbers(conf.outerMin);
        this.outerMax        = RG.SVG.stringsToNumbers(conf.outerMax);
        this.value           = RG.SVG.stringsToNumbers(conf.value);
        this.angleStart      = 0 - RG.SVG.TRIG.HALFPI - (RG.SVG.TRIG.HALFPI / 2);
        this.angleEnd        = 0 + RG.SVG.TRIG.HALFPI + (RG.SVG.TRIG.HALFPI / 2);
        this.angleSpan       = this.angleEnd - this.angleStart;
        this.id              = conf.id;
        this.uid             = RG.SVG.createUID();
        this.container       = document.getElementById(this.id);
        this.layers          = {}; // MUST be before the SVG tag is created!
        this.svg             = RG.SVG.createSVG({
                                   object:    this,
                                   container: this.container
                               });
        this.isRGraph        = true;
        this.width           = Number(this.svg.getAttribute('width'));
        this.height          = Number(this.svg.getAttribute('height'));

        this.colorsParsed    = false;
        this.originalColors  = {};
        this.gradientCounter = 1;
        this.nodes           = {};
        this.shadowNodes     = [];
        
        // Some bounds checking for the value
        if (this.value > this.innerMax) this.value = this.innerMax;
        if (this.value < this.innerMin) this.value = this.innerMin;

        // Add this object to the ObjectRegistry
        RG.SVG.OR.add(this);

        // Set the DIV container to be inline-block
        this.container.style.display = 'inline-block';

        this.properties =
        {
            centerx: null,
            centery: null,
            radius:  null,

            gutterLeft:   10,
            gutterRight:  10,
            gutterTop:    20,
            gutterBottom: 0,
            rmargin:      null, // This is set below
            
            backgroundFill: 'Gradient(white:#FEFEFE:#E6E6E6:#dedede)',
            backgroundStroke: '#ddd',

            linewidth:   1,
            colors: ['black','black'],
            innerGap:    5,

            tickmarksOuterSize: 3,
            tickmarksInnerSize: 3,
            tickmarksCount:     10,

            textColor:      'black',
            textFont:       'sans-serif',
            textSize:       10,
            textBold:       false,
            textItalic:     false,
            
            labelsIngraph:           true,
            labelsIngraphFont:       null,
            labelsIngraphSize:       null,
            labelsIngraphBold:       null,
            labelsIngraphItalic:     null,
            labelsIngraphColor:      null,
            labelsIngraphUnitsPre:   '',
            labelsIngraphUnitsPost:  '',
            labelsIngraphThousand:   ',',
            labelsIngraphPoint:      '.',
            labelsIngraphFormatter:  null,
            labelsIngraphDecimals:   0,
            labelsIngraphPadding:    3,
            labelsIngraphBackground: 'Gradient(#ddd:#eee)',
            labelsIngraphRounded:    2,

            scaleInnerFont:      null,
            scaleInnerSize:      null,
            scaleInnerBold:      null,
            scaleInnerItalic:    null,
            scaleInnerColor:     null,
            scaleInnerUnitsPre:  '',
            scaleInnerUnitsPost: '',
            scaleInnerPoint:     '.',
            scaleInnerThousand:  ',',
            scaleInnerDecimals:  0,
            scaleInnerFormatter: null,
            scaleInnerLabelsCount: 10,
            scaleInnerRound:       false,

            scaleOuter:          true,
            scaleOuterFont:      null,
            scaleOuterSize:      null,
            scaleOuterBold:      null,
            scaleOuterItalic:    null,
            scaleOuterColor:     null,
            scaleOuterUnitsPre:  '',
            scaleOuterUnitsPost: '',
            scaleOuterPoint:     '.',
            scaleOuterThousand:  ',',
            scaleOuterDecimals:  0,
            scaleOuterFormatter: null,
            scaleOuterLabelsCount: 10,
            scaleOuterRound:       false,

            title:       '',
            titleSize:   null,
            titleX:      null,
            titleY:      '+5',
            titleHalign: 'center',
            titleValign: 'bottom',
            titleColor:  null,
            titleFont:   null,
            titleBold:   true,
            titleItalic: false,

            titleSubtitle:       null,
            titleSubtitleSize:   null,
            titleSubtitleX:      null,
            titleSubtitleY:      '+15',
            titleSubtitleHalign: 'center',
            titleSubtitleValign: 'center',
            titleSubtitleColor:  '#aaa',
            titleSubtitleFont:   null,
            titleSubtitleBold:   false,
            titleSubtitleItalic: false,
            
            needleColor: '#666',
            
            centerpinRadius: 5,
            
            adjustable: false
        };




        //
        // Copy the global object properties to this instance
        //
        RG.SVG.getGlobals(this);





        /**
        * "Decorate" the object with the generic effects if the effects library has been included
        */
        if (RG.SVG.FX && typeof RG.SVG.FX.decorate === 'function') {
            RG.SVG.FX.decorate(this);
        }




        var prop = this.properties;








        //
        // The draw method draws the Bar chart
        //
        this.draw = function ()
        {
            // Fire the beforedraw event
            RG.SVG.fireCustomEvent(this, 'onbeforedraw');


            // Reset this to prevent it from growing
            this.nodes = {};

            // Should be the first thing that's done inthe.draw() function
            // except for the onbeforedraw event
            this.width  = Number(this.svg.getAttribute('width'));
            this.height = Number(this.svg.getAttribute('height'));



            // Create the defs tag if necessary
            RG.SVG.createDefs(this);



            // Add these
            this.graphWidth  = this.width - prop.gutterLeft - prop.gutterRight;
            this.graphHeight = this.height - prop.gutterTop  - prop.gutterBottom;

            // If a title is specified then adjust the centery down
            if (prop.title.length > 0) {
                this.graphHeight -= prop.gutterTop;
            }

            // Work out the center point
            this.centerx = (this.graphWidth / 2) + prop.gutterLeft;
            this.centery = (this.graphHeight / 2) + prop.gutterTop;
            this.radius  = ma.min(this.graphWidth / 2, this.graphHeight / 2);

            // If a title is specified then adjust the centery down
            if (prop.title.length > 0) {
                this.centery += 10;
                this.radius  -= 10;
            }



            // Allow the user to override the calculated centerx/y/radius
            this.centerx = typeof prop.centerx === 'number' ? prop.centerx : this.centerx;
            this.centery = typeof prop.centery === 'number' ? prop.centery : this.centery;
            this.radius  = typeof prop.radius  === 'number' ? prop.radius  : this.radius;

            // Allow the centerx/centery/radius to be a plus/minus
            if (typeof prop.radius  === 'string' && prop.radius.match(/^\+|-\d+$/) )   this.radius  += parseFloat(prop.radius);
            if (typeof prop.centerx === 'string' && prop.centerx.match(/^\+|-\d+$/) ) this.centery += parseFloat(prop.centerx);
            if (typeof prop.centery === 'string' && prop.centery.match(/^\+|-\d+$/) ) this.centerx += parseFloat(prop.centery);

            
            
            
            // Parse the colors for gradients
            RG.SVG.resetColorsToOriginalValues({object:this});
            this.parseColors();





            // Change the rmargin if it wasnt set manually
            if (prop.rmargin === null) {
                if (prop.scaleOuter) {
                    prop.rmargin = 40;
                } else {
                    prop.rmargin = 25;
                }
            }






            // Draw the meter
            this.drawMeter();


            // Draw the needle
            this.drawNeedle();
            
            

            // Draw the ingraph label
            if (prop.labelsIngraph) {
                this.drawIngraph();
            }



            // Draw the title and subtitle
            RG.SVG.drawTitle(this);


            // Ajusting
            if (prop.adjustable) {
                
                this.adjusting_mousedown = false;
            
                var func = function (e)
                {
                    var svg     = e.currentTarget,
                        obj     = svg.__object__,
                        mouseX  = e.offsetX,
                        mouseY  = e.offsetY;

                    var radius = RG.SVG.TRIG.getHypLength({
                        x1: mouseX,
                        y1: mouseY,
                        x2: obj.centerx,
                        y2: obj.centery,
                        object: obj
                    });
                    
                    if (radius > obj.radius) {
                        return;
                    }

                    var value = obj.getValue(e);
                    
                    obj.value = value;
                    obj.drawNeedle();
                };
                
                // Create a reference so that code thats inside
                // the event listeners can easily access the
                // object
                var obj = this;
                
                this.svg.addEventListener('mousedown', function (e)
                {
                    this.adjusting_mousedown = true;
                    func(e);
                }, false);
                
                this.svg.addEventListener('mousemove', function (e)
                {
                    if (this.adjusting_mousedown) {
                        func(e);
                    }
                }, false);
                
                this.svg.addEventListener('mouseup', function (e)
                {
                    this.adjusting_mousedown = false;
                }, false);
            }




            // Fire the draw event
            RG.SVG.fireCustomEvent(this, 'ondraw');


            return this;
        };








        // Generate the inner scale
        this.drawMeter = function ()
        {
            // Generate the Inner scale
            this.scaleInner = RG.SVG.getScale({
                object:    this,
                numlabels: prop.scaleInnerLabelsCount,
                unitsPre:  prop.scaleInnerUnitsPre,
                unitsPost: prop.scaleInnerUnitsPost,
                max:       this.innerMax,
                min:       this.innerMin,
                point:     prop.scaleInnerPoint,
                round:     prop.scaleInnerRound,
                thousand:  prop.scaleInnerThousand,
                decimals:  prop.scaleInnerDecimals,
                strict:    true,
                formatter: prop.scaleInnerFormatter
            });

            // Generate the outer scale
            this.scaleOuter = RG.SVG.getScale({
                object:    this,
                numlabels: prop.scaleOuterLabelsCount,
                unitsPre:  prop.scaleOuterUnitsPre,
                unitsPost: prop.scaleOuterUnitsPost,
                max:       this.outerMax,
                min:       this.outerMin,
                point:     prop.scaleOuterPoint,
                round:     prop.scaleOuterRound,
                thousand:  prop.scaleOuterThousand,
                decimals:  prop.scaleOuterDecimals,
                strict:    true,
                formatter: prop.scaleOuterFormatter
            });


            // Draw the background circle
            this.nodes.background = RG.SVG.create({
                svg: this.svg,
                type: 'circle',
                parent: this.svg.all,
                attr: {
                    cx: this.centerx,
                    cy: this.centery,
                    r: this.radius,
                    stroke: prop.backgroundStroke,
                    fill: prop.backgroundFill
                }
            });


            // Create the axis groups
            this.nodes.innerAxisGroup = RG.SVG.create({
                svg: this.svg,
                type: 'g',
                parent: this.svg.all,
                attr: {
                    id: 'innerAxisGroup',
                }
            });


            this.nodes.outerAxisGroup = RG.SVG.create({
                svg: this.svg,
                type: 'g',
                parent: this.svg.all,
                attr: {
                    id: 'outerAxisGroup',
                }
            });





            //
            // Draw the circular lines
            //
            var innerPath = RG.SVG.TRIG.getArcPath3({
                cx: this.centerx,
                cy: this.centery,
                r:  this.radius - prop.innerGap - prop.rmargin,
                start: this.angleStart,
                end: this.angleEnd,
                anticlockwise: false,
                lineto: false
            });

            var inner = RG.SVG.create({
                svg: this.svg,
                type: 'path',
                parent: this.nodes.innerAxisGroup,
                attr: {
                    d: innerPath,
                    stroke: prop.colors[1],
                    fill: 'transparent',
                    'stroke-width': prop.linewidth
                }
            });














            // Draw the outer partial circle
            var outerPath = RG.SVG.TRIG.getArcPath3({
                cx: this.centerx,
                cy: this.centery,
                r:  this.radius - prop.rmargin,
                start: this.angleStart,
                end: this.angleEnd,
                anticlockwise: false,
                lineto: false
            });

            var outer = RG.SVG.create({
                svg: this.svg,
                type: 'path',
                parent: this.nodes.outerAxisGroup,
                attr: {
                    d: outerPath,
                    stroke: prop.colors[0],
                    fill: 'transparent',
                    'stroke-width': prop.linewidth
                }
            });
            
            // Store references to the circles
            this.nodes.outerAxis = outerPath;
            this.nodes.innerAxis = innerPath;

















            var numticks  = prop.tickmarksCount,
                gap       = this.angleSpan / numticks,
                numlabels = prop.tickmarksCount;


















            for (var i=0; i<=numticks; ++i) {

                if (prop.scaleOuter) {
                    
                    // Draw the OUTER tickmarks
                    var path_a = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius - prop.rmargin,
                        start: this.angleStart + (i * gap),
                        end: this.angleStart + (i * gap),
                        anticlockwise: false,
                        lineto: false
                    });
        
                    var path_b = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius + prop.tickmarksOuterSize - prop.rmargin,
                        start: this.angleStart + (i * gap),
                        end: this.angleStart + (i * gap),
                        anticlockwise: false,
                        lineto: true
                    });
        
                    RG.SVG.create({
                        svg: this.svg,
                        type: 'path',
                        parent: this.nodes.outerAxisGroup,
                        attr: {
                            d: path_a + ' ' + path_b,
                            stroke: prop.colors[0],
                            fill: 'transparent',
                            'stroke-width': prop.linewidth,
                            'stroke-linecap':  'square'
                        }
                    });
    
                    // Calculate the coordinates for the text label
                    var coords = RG.SVG.TRIG.toCartesian({
                        cx:    this.centerx,
                        cy:    this.centery,
                        r:     this.radius + prop.tickmarksOuterSize + 10 - prop.rmargin,
                        angle: this.angleStart - RG.SVG.TRIG.HALFPI + (i * gap)
                    });
                    
                    var halign = (coords.x > this.centerx ? 'left' : 'right');
    
                    if (i / numlabels === 0.5) {
                        halign = 'center';
                    }
    
                    // Add an outer text label
                    RG.SVG.text({
                        object:     this,
                        svg:        this.svg,
                        parent:     this.nodes.outerAxisGroup,
                        tag:        'scale.outer',
                        text:       (i === 0 ? RG.SVG.numberFormat({
                                        object:  this,
                                        prepend: prop.scaleOuterUnitsPre,
                                        append:  prop.scaleOuterUnitsPost,
                                        num:     this.outerMin.toFixed(prop.scaleOuterDecimals),
                                        point:    prop.scaleOuterPoint,
                                        thousand: prop.scaleOuterThousand
                                    }) : this.scaleOuter.labels[i - 1]),
                        size:       prop.scaleOuterSize || prop.textSize,
                        x:          coords.x,
                        y:          coords.y,
                        halign:     halign,
                        valign:     'center',
                        padding:    2,
                        color:      prop.scaleOuterColor  || prop.textColor,
                        bold:       typeof prop.scaleOuterBold   === 'boolean' ? prop.scaleOuterBold : prop.textBold,
                        italic:     typeof prop.scaleOuterItalic === 'boolean' ? prop.scaleOuterItalic : prop.textItalic,
                        font:       prop.scaleOuterFont || prop.textFont
                    });
                } else {



                    // Close the circles



                    var path_a = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius - prop.rmargin,
                        start: this.angleStart,
                        end: this.angleStart,
                        anticlockwise: false,
                        lineto: false
                    });
        
                    var path_b = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius - prop.innerGap - prop.rmargin,
                        start: this.angleStart,
                        end: this.angleStart,
                        anticlockwise: false,
                        lineto: true
                    });
        
                    RG.SVG.create({
                        svg: this.svg,
                        type: 'path',
                        parent: this.nodes.innerAxisGroup,
                        attr: {
                            d: path_a + path_b,
                            stroke: prop.colors[1],
                            fill: 'transparent',
                            'stroke-width': prop.linewidth,
                            'stroke-linecap':  'square'
                        }
                    });






                    var path_a = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius - prop.rmargin,
                        start: this.angleEnd,
                        end: this.angleEnd,
                        anticlockwise: false,
                        lineto: false
                    });
        
                    var path_b = RG.SVG.TRIG.getArcPath3({
                        cx: this.centerx,
                        cy: this.centery,
                        r:  this.radius - prop.innerGap - prop.rmargin,
                        start: this.angleEnd,
                        end: this.angleEnd,
                        anticlockwise: false,
                        lineto: true
                    });
        
                    RG.SVG.create({
                        svg: this.svg,
                        type: 'path',
                        parent: this.nodes.innerAxisGroup,
                        attr: {
                            d: path_a + path_b,
                            stroke: prop.colors[1],
                            fill: 'transparent',
                            'stroke-width': prop.linewidth,
                            'stroke-linecap':  'square'
                        }
                    });

                }
    
    
    
    
    
    
    
    
                // Draw the INNER tickmarks




                var path_a = RG.SVG.TRIG.getArcPath3({
                    cx: this.centerx,
                    cy: this.centery,
                    r:  this.radius - prop.rmargin - prop.innerGap,
                    start: this.angleStart + (i * gap),
                    end: this.angleStart + (i * gap),
                    anticlockwise: false,
                    lineto: false
                });
                
                var path_b = RG.SVG.TRIG.getArcPath3({
                    cx: this.centerx,
                    cy: this.centery,
                    r:  this.radius  - prop.innerGap - prop.tickmarksOuterSize - prop.rmargin,
                    start: this.angleStart + (i * gap),
                    end: this.angleStart + (i * gap),
                    anticlockwise: false,
                    lineto: true
                });

                RG.SVG.create({
                    svg: this.svg,
                    type: 'path',
                    parent: this.nodes.innerAxisGroup,
                    attr: {
                        d: path_a + ' ' + path_b,
                        stroke: prop.colors[1],
                        fill: 'transparent',
                        'stroke-width': prop.linewidth,
                        'stroke-linecap':  'square'
                    }
                });



                // Calculate the coordinates for the text label
                var coords = RG.SVG.TRIG.toCartesian({
                    cx:    this.centerx,
                    cy:    this.centery,
                    r:     this.radius - prop.innerGap - prop.tickmarksInnerSize - 10 - prop.rmargin,
                    angle: this.angleStart - RG.SVG.TRIG.HALFPI + (i * gap)
                });
                
                var halign = (coords.x > this.centerx ? 'right' : 'left');

                if (i / numlabels === 0.5) {
                    halign = 'center';
                }

                // Add an inner text label
                RG.SVG.text({
                    object:     this,
                    svg:        this.svg,
                    parent:     this.nodes.innerAxisGroup,
                    tag:        'scale.inner',
                    
                    text:       (i === 0 ? RG.SVG.numberFormat({
                                    object:  this,
                                    prepend: prop.scaleInnerUnitsPre,
                                    append:  prop.scaleInnerUnitsPost,
                                    num:     this.innerMin.toFixed(prop.scaleInnerDecimals),
                                    point:    prop.scaleInnerPoint,
                                    thousand: prop.scaleInnerThousand
                                }) : this.scaleInner.labels[i - 1]),

                    size:       prop.scaleInnerSize || prop.textSize,
                    x:          coords.x,
                    y:          coords.y,
                    halign:     halign,
                    valign:     'center',
                    padding:    2,
                    color:      prop.scaleInnerColor  || prop.textColor,
                    bold:       typeof prop.scaleInnerBold   === 'boolean' ? prop.scaleInnerBold : prop.textBold,
                    italic:     typeof prop.scaleInnerItalic === 'boolean' ? prop.scaleInnerItalic : prop.textItalic,
                    font:       prop.scaleInnerFont || prop.textFont
                });
            }
        };








        // Draws the label that sits below the needle,
        // inside the meter
        this.drawIngraph = function ()
        {
            // If the group already exists remove it
            if (this.nodes.labelsIngraphGroup) {
                this.nodes.labelsIngraphGroup.parentNode.removeChild(this.nodes.labelsIngraphGroup);
            }

            this.nodes.labelsIngraphGroup = RG.SVG.create({
                svg: this.svg,
                type: 'g',
                parent: this.svg.all,
                attr: {
                    id: 'labelsIngraphGroup',
                }
            });
            
            this.nodes.labelsIngraph = RG.SVG.text({
                object: this,
                parent: this.nodes.labelsIngraphGroup,
                text:   RG.SVG.numberFormat({
                    prepend:            prop.labelsIngraphUnitsPre,
                    append:             prop.labelsIngraphUnitsPost,
                    decimal_seperator:  prop.labelsIngraphPoint,
                    thousand_seperator: prop.labelsIngraphThousand,
                    formatter:          prop.labelsIngraphFormatter,
                    num: this.value.toFixed(prop.labelsIngraphDecimals)
                }),
                x:                 this.centerx,
                y:                 this.centery + this.radius - prop.rmargin - 30,
                background:        prop.labelsIngraphBackground,
                backgroundRounded: prop.labelsIngraphRounded,
                padding:           prop.labelsIngraphPadding,
                halign:            'center',
                valign:            'center',
                size:              prop.labelsIngraphSize || prop.textSize + 2,
                bold:              typeof prop.labelsIngraphBold === 'boolean' ? prop.labelsIngraphBold : prop.textBold,
                italic:            typeof prop.labelsIngraphItalic === 'boolean' ? prop.labelsIngraphItalic : prop.textItalic,
                font:              prop.labelsIngraphFont || prop.textFont,
                color:             prop.labelsIngraphColor || prop.textColor
            });
            
            // Add a border to the rect
            var rect = this.nodes.labelsIngraph.previousSibling;
            
            rect.setAttribute('stroke', '#aaa');

            // Prevent clicks on the label from affecting the rest of the
            // chart if adjusting is enabled
            var func = function (e) {e.stopPropagation();};
            
            rect.addEventListener('mousedown', func, false);
            this.nodes.labelsIngraph.addEventListener('mousedown', func, false);
        };








        // Draws the needle of the meter.
        //
        // This function is used by the adkusting feature to redraw just
        // the needle instead of redrawing the whole chart
        //
        this.drawNeedle = function ()
        {
            // Remove any pre-existing needle
            if (this.nodes.needleGroup) {
                this.nodes.needleGroup.parentNode.removeChild(this.nodes.needleGroup);
            }



            this.nodes.needleGroup = RG.SVG.create({
                svg: this.svg,
                type: 'g',
                parent: this.svg.all,
                attr: {
                    id: 'needle-group',
                    fill: prop.needleColor,
                    stroke: prop.needleColor
                }
            });
            
            
            
            

            // Calculate the end coords of the needle
            var angle = (this.value - this.innerMin) / (this.innerMax - this.innerMin) * this.angleSpan;
                angle += RG.SVG.TRIG.HALFPI + (RG.SVG.TRIG.HALFPI / 2);

            // These are the coords of the tip of the needle
            var coords = RG.SVG.TRIG.toCartesian({
                cx:    this.centerx,
                cy:    this.centery,
                r:     this.radius - 60,
                angle: angle
            });

            // These are the coords of the left of the needle
            var coords2 = RG.SVG.TRIG.toCartesian({
                cx:    this.centerx,
                cy:    this.centery,
                r:     prop.centerpinRadius,
                angle: angle - RG.SVG.TRIG.HALFPI
            });

            // These are the coords of the right of the needle
            var coords3 = RG.SVG.TRIG.toCartesian({
                cx:    this.centerx,
                cy:    this.centery,
                r:     prop.centerpinRadius,
                angle: angle + RG.SVG.TRIG.HALFPI
            });

            // Now draw the needle
            RG.SVG.create({
                svg: this.svg,
                type: 'path',
                parent: this.nodes.needleGroup,
                attr: {
                    'stroke-width': 1,
                    'stroke-linecap': "round",
                    d: 'M{1} {2} L{3} {4} L{5} {6} z'.format(
                        coords.x,
                        coords.y,
                        coords2.x,
                        coords2.y,
                        coords3.x,
                        coords3.y
                        
                    )
                }
            });

            // Draw a center circle
            RG.SVG.create({
                svg: this.svg,
                type: 'circle',
                parent: this.nodes.needleGroup,
                attr: {
                    cx:this.centerx,
                    cy: this.centery,
                    r: prop.centerpinRadius
                }
            });
                    
            
            
            
            // Update the ingraph label if it's enabled
            if (prop.labelsIngraph) {
                this.drawIngraph();
            }
        };

















        /**
        * This allows for easy specification of gradients
        */
        this.parseColors = function ()
        {
            // Save the original colors so that they can be restored when the canvas is reset
            if (!Object.keys(this.originalColors).length) {
                this.originalColors = {
                    colors:                  RG.SVG.arrayClone(prop.colors),
                    backgroundFill:          RG.SVG.arrayClone(prop.backgroundFill),
                    backgroundStroke:        RG.SVG.arrayClone(prop.backgroundStroke),
                    labelsIngraphBackground: RG.SVG.arrayClone(prop.labelsIngraphBackground)
                }
            }

            // backgroundFill
            prop.backgroundFill = RG.SVG.parseColorLinear({
                object: this,
                color: prop.backgroundFill,
                start: prop.gutterTop,
                  end: this.height - prop.gutterBottom,
                direction: 'vertical'
            });

            // backgroundStroke
            prop.backgroundStroke = RG.SVG.parseColorLinear({
                object: this,
                color: prop.backgroundStroke,
                start: prop.gutterTop,
                  end: this.height - prop.gutterBottom,
                direction: 'vertical'
            });

            // labelsIngraphBackground
            prop.labelsIngraphBackground = RG.SVG.parseColorLinear({
               object: this,
                color: prop.labelsIngraphBackground,
            direction: 'vertical',
        gradientUnits: 'objectBoundingBox'
            });
        };








        // Returns the value of a click
        //
        // @param e object The event object
        this.getValue = function (e)
        {
            var mouseX  = e.offsetX,
                mouseY  = e.offsetY;
        
            var angle = RG.SVG.TRIG.getAngleByXY({
                cx: this.centerx,
                cy: this.centery,
                x: mouseX,
                y: mouseY
            });
        
            if (mouseX < this.centerx) {
                angle = angle - RG.SVG.TRIG.TWOPI;
            }
        
            var value = ((angle - this.angleStart) / (this.angleEnd - this.angleStart));
            value = value * (this.innerMax - this.innerMin);
            value = value + this.innerMin;
        
            if (value < this.innerMin) value = this.innerMin;
            if (value > this.innerMax) value = this.innerMax;

            return value;
        };








        /**
        * Using a function to add events makes it easier to facilitate method
        * chaining
        *
        * @param string   type The type of even to add
        * @param function func
        */
        this.on = function (type, func)
        {
            if (type.substr(0,2) !== 'on') {
                type = 'on' + type;
            }

            RG.SVG.addCustomEventListener(this, type, func);

            return this;
        };








        //
        // Used in chaining. Runs a function there and then - not waiting for
        // the events to fire (eg the onbeforedraw event)
        //
        // @param function func The function to execute
        //
        this.exec = function (func)
        {
            func(this);

            return this;
        };








        //
        // Set the options that the user has provided
        //
        for (i in conf.options) {
            if (typeof i === 'string') {
                this.set(i, conf.options[i]);
            }
        }
    };
    
    
    
    return this;




// End module pattern
})(window, document);