var fs = require("fs");
var glob = require("glob");
var path = require('path');

smartSass = function (sourcePatterns, targetDirectoryRoot)
{
	var sassFiles = [];
	var sassNotPartialFiles = [];
	var sassPartialFiles = [];
	var filesWhichNeedSass = [];

	sourcePatterns.forEach( function(pattern){
			sassFiles = sassFiles.concat(glob.sync(pattern));
	});
	sassFiles.forEach( function(sassFile){
			sassIsPartial(sassFile)? sassPartialFiles.push(sassFile): sassNotPartialFiles.push(sassFile);
	});

	sassNotPartialFiles.forEach( function(sassFile){
			var cssRelatedFile = path.join(targetDirectoryRoot, sassFile.replace(path.extname(sassFile), ".css"));
			if(sassIsNewOrModified(sassFile, cssRelatedFile) || sassPartialsModified(sassFile, sassPartialFiles, cssRelatedFile))
			 		 filesWhichNeedSass.push(sassFile);
	});
 	return filesWhichNeedSass;
}

sassIsPartial = function(sassFile){	
	return (path.basename(sassFile).charAt(0) =='_');
}

sassIsNewOrModified = function(sFile, relatedCssFile){
	return (!fs.existsSync(relatedCssFile) || fs.statSync(sFile).mtime > fs.statSync(relatedCssFile).mtime);
}

sassPartialsModified = function(sFile, sPartialFiles, relatedCssFile){
	
	var importedPartials = [];
	var regexp = /@import\s+[^\s\\]+/g;				// regular expression to find partials
	var importsFound = fs.readFileSync(sFile).toString().match(regexp);
	if(importsFound == null) return false;			// no imported partials sass files found
	
	importsFound.forEach(function(match){
			importedPartials.push( "_" + path.basename(match.split(" ").pop()));
	});
	
	for(var i=0; i< importedPartials.length; i++){
		for(var j=0; j< sPartialFiles.length; j++){
			if(sPartialFiles[j].indexOf(importedPartials[j]) >=0 && sassIsNewOrModified(sPartialFiles[j], relatedCssFile)){
				return true;
			}
		}
	}
	return false;
}

module.exports = smartSass;
