exports.install = function() {
	ROUTE('+GET /*',index);
	ROUTE('+GET /flow/',flow);
	ROUTE('+GET /designer/');
	ROUTE('-GET /*', login);
};
function index(){
	var self = this;
	self.view('contenus',{
		menus : []
	});
}
function flow(){
	var self = this;
	self.view('index');
};
function login(){
	var self = this;
	self.view('login');
}

