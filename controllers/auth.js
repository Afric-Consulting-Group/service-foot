exports.install =  function(){
    	// REST API
	ROUTE('-POST    /fapi/auth/        *Auth       --> exec');
	ROUTE('+GET     /fapi/logout/      *Auth       --> logout');
	ROUTE('+POST    /fapi/password/    *Auth       --> save');
	
}

