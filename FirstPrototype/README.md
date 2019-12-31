# First WebVI Prototype

While cleaning up an old machine I ran into what can be considered the first WebVI.

It was a prototype I worked on with [Paul Austin](https://twitter.com/MrPaulAustin) after seeing his presentation about [Vireo](https://github.com/ni/VireoSDK) at National Instruments's internal developer focused conference NI-Tech.

Paul's talk showed how Vireo allowed you to take the LabVIEW graphical programming language and run it on [tiny memory constrained targets](http://download.ni.com/evaluation/mindstorms/LabVIEW_for_NXT_Advanced_Programming_Guide.pdf). At the time I was experimenting with the [emscripten](https://emscripten.org/) toolchain which allows you to compile a C++ application into JavaScript for the web.

When you look at the properties of Vireo and the properties of a web page it lines up well. You need a compact runtime that downloads quickly and can run on smart phone web browsers.

The early days of the emscripten toolchain were a bit rough but I eventually was able to compile Vireo into HTML and JavaScript. All it did was print `HelloWorld` into a text box but it was proof enough that WebVIs were possible.

Throw in some dozens (if not hundreds) more language features, a couple generations of HTML control evolution, make a high performance charting package, some UI features like property nodes and events, network communication, a data services platform, integration into a WYSIWYG editor, transitioning from JS, to asm.js, to WebAssembly, a half-decade of work with an awesome team, some Chemical X, and bam!

You get WebVIs as you know them today :)

You can run the OG WebVI built May 21, 2013 at 8:27 PM in your browser to see the [glorious Hello World message that started WebVIs](test.html).

<div align="center">
    <div>
        <a href="test.html">
            <img width="108" height="67" src="vireo.png" alt="Original Vireo logo">
        </a>
    </div>
</div>
