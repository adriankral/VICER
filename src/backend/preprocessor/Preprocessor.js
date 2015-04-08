define([
    './cfgGenerator',
    './envGenerator'
], function(cfgGenerator, envGenerator) {

    var _ = require('underscore');

    function AstToCfg(_astObj) {
	this.astObj = _astObj;
	this.preprocessed = {};
    }
    
    AstToCfg.prototype.retrieveGlobals = function retrieveGlobals() {
	// retrieve globals
	this.preprocessed.global = {};
	for(var i = 0; i < this.astObj.external_declarations.length; i++) {
	    if(this.astObj.external_declarations[i].type !== "declaration")
		continue;
	    var varDef = this.astObj.external_declarations[i];
	    var globalVariable = {
		type: varDef.tvalue.name
	    };
	    this.preprocessed.global[varDef.name] = globalVariable;
	}
    };

    AstToCfg.prototype.generateFunctions = function generateFunctions() {
	// generate functions
	this.preprocessed.functions = {};
	this.preprocessed.values = {};
	for(var i = 0; i < this.astObj.external_declarations.length; i++) {
	    if(this.astObj.external_declarations[i].type !== "function_definition")
		continue;
	    var funcDef = this.astObj.external_declarations[i];
	    
	    var args = [];
	    console.log('FUNCDEF');
	    console.log(funcDef);
	    console.log('PARAMETERSS');
	    console.log(funcDef.parameters);
	    for(var j = 0; j < funcDef.param_names.length; j++)
		args.push(funcDef.name + '_PARAMETER_' + funcDef.param_names[j]);

	    var envAndValues = envGenerator(funcDef);
	    var env = envAndValues.env;
	    var values = {};
	    for(var val in envAndValues.constants) {
		values[envAndValues.constants[val]] = val;
	    }

	    var cfg = cfgGenerator(funcDef.body);

	    // mark the first node
	    var firstId = cfg.first;
	    cfg = cfg.graph;
	    cfg[0] = cfg[firstId];
	    cfg[firstId] = undefined; // will delete erase both?
	    
	    for(var l in cfg.graph) {
		if(cfg[l].next == firstId)
		    cfg[l].next = 0;
	    }

	    var functionDesc = {
		returns: funcDef.returns,
		args: args,
		env: env,
		cfg: cfg
	    };
	    this.preprocessed.functions[funcDef.name] = functionDesc;
	    this.preprocessed.values = _.extend(this.preprocessed.values, values);
	}
    };

    AstToCfg.prototype.getConverted = function getConverted() {
	return this.preprocessed;
    };

    AstToCfg.prototype.convert = function convert() {
	this.retrieveGlobals();
	this.generateFunctions();
	return this.getConverted();
    };

    function createAstToCfg(astObj) {
	return new AstToCfg(astObj);
    }

    return Preprocessor;
});