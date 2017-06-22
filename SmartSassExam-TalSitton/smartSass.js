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
			 var cssRelatedFile = path.join(targetDirectoryRoot, sassFile);
			 if(sassIsNewOrModifyed(sassFile, cssRelatedFile) || sassPartialsModified(sassFile, sassPartialFiles, cssRelatedFile))
			 		 filesWhichNeedSass.push(sassFile);
	});
 	return filesWhichNeedSass;
}

sassIsPartial = function(sassFile){
	return (path.basename(sassFile).charAt(0) =='_');
}

sassIsNewOrModifyed = function(sFile, relatedCssFile){
	return (!fs.existsSync(relatedCssFile) || fs.statSync(sFile).mtime > fs.statSync(relatedCssFile).mtime);
}

sassPartialsModified = function(sFile, sPartialFiles, relatedCssFile){
	var partials = [];
	var regexp = /@import\s+[^\s\\]+/g;				// regular expression to find partials
	var importFound = fs.readFileSync(sFile).toString().match(regexp);
	if(importFound == null) return false;
	importFound.forEach(function(match){
			partials.push( "_" + path.basename(match.split(" ").pop()));
	});

	for(var partial in partials){
		for(var spFile in sPartialFiles){
			if(spFile.indexOf(partials[partial]) >= 0 && sassIsNewOrModifyed(sPartialFiles[spFile], relatedCssFile)){
				return true;
			}
		}
	}
	return false;
}

module.exports = smartSass;
