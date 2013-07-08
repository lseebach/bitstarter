#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

+ restler
   - https://github.com/danwrong/restler

*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');


//Defaults
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://bitstarter-lse.herokuapp.com/";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
//        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtml = function(html) {
//    console.log("entering cheerioHtml");
    return cheerio.load(html);
};

var restlerHtmlFile = function(url, checksfile) {
//    console.log("entering restlerHtmlFile");
    var checks = loadChecks(checksfile).sort();
    var generateResult = buildfn(url, checks);
	rest.get(url).on('complete', generateResult);
    // no return value
//    console.log("leaving restlerHtmlFile");
}

var buildfn = function(url, checks) {
//        console.log("entering buildfn with URL: %s and checks: %s",url, checks); 
        // create a function which complies to the signature of the 
        // rest.request call back (event "complete")
        var generateResults = function(result, response) {

//            console.log("entering generateResults with result: %s and response: %s"
//                    ,result, util.format(response.message));
            if (result instanceof Error) {
                console.error('Error: '+ util.format(response.message));
            } else {
                var out = {};
                // create a DOM from HTML
                var $ = cheerioHtml(result);
//                console.log("returned from  cheerioHtml with $: "+ $);
                // iterate through check-JSON
                for(var ii in checks) {
                    // check whether entry is present in given HTML 
                    var present = $(checks[ii]).length > 0;
//                    console.log("* ii: %s -> present: %s",ii,present);
                    // set the cheresult in the out-array
                    out[checks[ii]] = present;
                }
                var outJson = JSON.stringify(out, null, 4);
                console.log(outJson);
            }
//        console.log("leaving generateResults");
    };
//    console.log("leaving buildfn");
    return generateResults;
};

var loadChecks = function(checksfile) {
//    console.log("### entering loadChecks");
    var checkJson = JSON.parse(fs.readFileSync(checksfile));
//    console.log("checkJson: ", checkJson);
    return checkJson;
};
/*
var checkHtmlFile = function(url, checksfile) {
    console.log("entering checkHtmlFile with url: %s and checksfile: %s", url, checksfile);    
    var checks = loadChecks(checksfile).sort();
    // load the HTML via HTTP (async)
    restlerHtmlFile(url, checks);
    console.log("leaving checksHtmlFile");
}

	// load check-file and sort it.	
    var checks = loadChecks(checksfile).sort();
    var out = {};

    // iterate through check-JSON
    for(var ii in checks) {
        // check whether entry is present in given HTML 
        var present = $(checks[ii]).length > 0;
        // set the cheresult in the out-array
        out[checks[ii]] = present;
    }
    return out;
};

*/

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
//    	console.log("process.argv: "+process.argv);
    	// parse the CL parameters
	program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        // .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to page', URL_DEFAULT)
        .parse(process.argv);

//	console.log("program.checks: " + program.checks);
	// console.log("program.file: " + program.file);
//	console.log("program.url: " + program.url);
    
    restlerHtmlFile(program.url, program.checks);

	// based on file
	// var checkJson = checkHtmlFile(program.file, program.checks);

	// based on url
	// var checkJson = checkHtmlUrl(program.url, program.checks);
    // create an JSON outfile from check-array
	//var outJson = JSON.stringify(checkJson, null, 4);
    //	console.log(outJson);
} else {
    	exports.checkHtmlFile = checkHtmlFile;
}
