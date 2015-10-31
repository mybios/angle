var SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;

var endsWith = function (s: string, suffix: string) {
    return s.indexOf(suffix, s.length - suffix.length) !== -1;
};
var cachedSourceMaps: {[key:string]:string}= {};

function loadSourceMap(sourceFile: string):any
{
    var sourcemap = cachedSourceMaps[sourceFile];
    if (typeof(sourcemap) == "undefined")
    {
        var sourceMapFile = sourceFile + ".map";
        if (cc.FileUtils.getInstance().isFileExist(sourceMapFile))
        {
            var sourceMapContent = cc.FileUtils.getInstance().getStringFromFile(sourceMapFile);
            sourcemap = new SourceMapConsumer(sourceMapContent);
            cachedSourceMaps[sourceFile] = sourcemap;
            return sourcemap;
        }
        else
        {
            cachedSourceMaps[sourceFile] = null;
            return null;
        }
    }
    else
    {
        return sourcemap;
    }
}

function restoreStacktrace(stacktrace: string) {
    var lines = stacktrace.split('\n');

    var result = '';

    lines.forEach(function (stackLineOrigin: string) {
        var stackLine = stackLineOrigin.trim();

        // chakra format stack
        if (stackLine.indexOf('at ') === 0) {

            var sourceUrl = 
              stackLine.substring(
                stackLine.lastIndexOf('(') + 1,
                stackLine.lastIndexOf(')')
              );

            var bundleFile = sourceUrl.substring(
              0,
              sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1)
            );

            var sourceLine = parseInt(sourceUrl.substring(
              sourceUrl.lastIndexOf(':', sourceUrl.lastIndexOf(':') - 1) + 1,
              sourceUrl.lastIndexOf(':')
            ));

            var column = parseInt(sourceUrl.substring(
              sourceUrl.lastIndexOf(':') + 1,
              sourceUrl.length
            ));

            var sourceMap = loadSourceMap(bundleFile);

            if (sourceMap == null)
            {
                result += stackLineOrigin;
                return;
            }

            var originalPosition = sourceMap.originalPositionFor({
                line: sourceLine,
                column: column
            });

            result += '    at ';
            result += stackLine.substring('at '.length, stackLine.lastIndexOf('('));
            if (typeof(originalPosition.name) == "string") {
                result += originalPosition.name;
            }
            result += ' (' + originalPosition.source + ':' + originalPosition.line + ':' + originalPosition.column + ')';
        }
        else
        {
            /*
            -		matches	[uncaughtException@preload/preload.js:7457:43,uncaughtException@,preload/preload.js:7457:43,preload/preload.js,7457,43,]	Object, (Array)
+		__proto__	[]	Object, (Array)
		index	0	Number
		input	"uncaughtException@preload/preload.js:7457:43"	String
		length	7	Number
		[0]	"uncaughtException@preload/preload.js:7457:43"	String
		[1]	"uncaughtException@"	String
		[2]	"preload/preload.js:7457:43"	String
		[3]	"preload/preload.js"	String
		[4]	"7457"	String
		[5]	"43"	String
		[6]	undefined	Undefined

            */
            // JavaScriptCore format stack
            let matches = stackLine.match(/(.+@)?((.+):([\d]+):([\d]+))|(\[.*\])/);
            if (((typeof matches != "undefined") && (matches != null)) && matches.length == 7) {
                if (typeof (matches[3]) == "string" && typeof (matches[4]) == "string" && typeof (matches[5]) == "string") {

                    var sourceMap = loadSourceMap(matches[3]);
                    if (sourceMap == null) {
                        result += '    at ';
                        result += stackLine;
                        return;
                    }
                    var originalPosition = sourceMap.originalPositionFor({
                        line: Number(matches[4]),
                        column: Number(matches[5])
                    });
                    result += '    at ';
                    if (typeof (matches[1]) == "string") {
                        result += matches[1];
                    }
                    result += ' (' + originalPosition.source + ':' + originalPosition.line + ':' + originalPosition.column + ')\n';
                    return;
                }
            }
            result += stackLineOrigin;
        }

        result += '\n';
    });

    return result;
}

