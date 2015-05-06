define([
    '../Cfg'
], function (Cfg) {
    var cfgGenerator;
    
    function Continue(paramNode) {
	var continuePlaceholder = new Cfg ({
	    type: 'CONTINUE'
	});

	return continuePlaceholder;
    }

    return (function(_cfgGenerator) {
	cfgGenerator = _cfgGenerator;
	return Continue;
    });
});
