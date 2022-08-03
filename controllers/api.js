exports.install = function() {
	// FlowStream
	ROUTE('+GET /contenus/*',redirects);
	ROUTE('+API    /api/    -streams                          *Streams      --> query');
	ROUTE('+API    /api/    -streams_read/{id}                *Streams      --> read');
	ROUTE('+API    /api/    +streams_save                     *Streams      --> save');
	ROUTE('+API    /api/    -streams_remove/{id}              *Streams      --> remove');
	ROUTE('+API    /api/    -streams_stats                    *Streams      --> stats');
	ROUTE('+API    /api/    -streams_pause/{id}               *Streams      --> pause');
	// Variables
	ROUTE('+API    /api/    -variables                        *Variables    --> read');
	ROUTE('+API    /api/    +variables_save                   *Variables    --> save');
	// Clipboard
	ROUTE('+API    /api/    -clipboard_export/id              *Clipboard    --> export');
	ROUTE('+API    /api/    +clipboard_import                 *Clipboard    --> import', [60000 * 5]);
	// Socket
	ROUTE('SOCKET  /flows/{id}/', socket, 1024 * 5);
	ROUTE('+GET /events/{homeid_awayid}/',events);
	ROUTE('+GET /contenus/{apiconfig_name}/',contenus_today);
	ROUTE('+GET /contenus/archieves/{apiconfig_name}/',contenus_archieves);
	ROUTE('+GET /contenus/planning/{apiconfig_name}/',contenus_planning);
	ROUTE('+GET /contenus/configurations/{apiconfig_name}/',contenus_configurations);
	ROUTE('+GET /evenements/',evenements);
	ROUTE('+GET /contenus/',contenus);
	ROUTE('+GET /archieves/',archieves);
	ROUTE('+GET /planning/',planning);
	ROUTE('+GET /configurations/',configurations);
	ROUTE('+GET /contenus/operations/',contenus_operations);
	ROUTE('+POST /planning/sauvegarde/',planning_operations);
	ROUTE('+POST /configurations/sauvegarde/',configurations_operations);
	ROUTE('+POST /message/envoie/',message);
	ROUTE('+GET /matchs/',matchs);
	ROUTE('+GET /menus/',menus);
};

function redirects(){
	this.redirect('/contenus');
}

function message(){
	var self = this;
	if(self.body){
		var url = 'http://213.246.36.116/smsbillingtelecelbf/euro_sub_broadcast.php';
		var opt = {};
				opt.url = url;
				opt.query = { content : data, from : '821' , cible : 'can' };
				opt.callback = function(err,res){
					$.send('output',res);
					}		

				self.plain(self.body);
			}
};

function events(){
	var self = this;
	var homeid_awayid = self.params.homeid_awayid;
	console.log(homeid_awayid);
	NOSQL('evenements2').find().where('homeid_awayid',homeid_awayid).sort('dtcreated_desc').callback(function(err,res){
		self.json(res);
	});
};

function contenus_today(){
	var self = this;
	var config_name = self.params.apiconfig_name;
	console.log(config_name);
	NOSQL('contenustoday').find().where('apiconfig_name',config_name).where('date',F.datetime.format('yyyy-MM-dd')).sort('dtcreated_desc').callback(function(err,res){
		console.log(res);
		self.json(res);
	});
};

function contenus_archieves(){
	var self = this;
	var config_name = self.params.apiconfig_name;
	var dt = self.query.date || new Date().format('yyyy-MM-dd');
	console.log(config_name);
	NOSQL('contenusvalidate').find().where('apiconfig_name',config_name).where('date',dt).sort('dtcreated_desc').callback(function(err,res){
		console.log(res);
		self.json(res);
	});
};

function contenus_planning(){
	var self = this;
	var config_name = self.params.apiconfig_name;
	console.log(config_name);
	NOSQL('times').one().where('name',config_name).callback(function(err,res){
		console.log(res);
		self.json(res);
	});
};

function contenus_configurations(){
	var self = this;
	var config_name = self.params.apiconfig_name;
	var dt = self.query.date || new Date().format('yyyy-MM-dd');
	console.log(config_name);
	NOSQL('apiconfigs').find().where('name',config_name).callback(function(err,res){
		console.log(res);
		self.json(res);
	});
};

function evenements(){
	var self = this;
	self.view('events',{
		matchs : []
	});
};

//Page contenus
function contenus_operations(){
	var self = this;
	switch (self.query.action) {
		case 'remove':
			var id = self.query.id;
			if(!id){
				return;
			};
			NOSQL('contenustoday').remove().where('id', id).callback(function(err, deleted){
				if(!deleted){
					self.json({success : false, value : deleted});
				};
				self.json({success : true, value : deleted});
			});
			break;
		case 'validate':
				var id = self.query.id;
				if(!id){
					return;
				};
				deplacer_contenu(id,function(ok){
					console.log('Tasks result',ok);
					if(!ok){
						self.json({success : false, value : ok});
					};

					self.json({success : true, value : ok});
				});
			
			break;
		default:
			break;
	};
	
};
// deplacer le contenu de la table contenustoday vers contenusvalidate
function deplacer_contenu(id,callback){
	var tasks = [];
	var temp;

	// tache 1 
	tasks.push(function(next){
		NOSQL('contenustoday').one().where('id',id).callback(function(err,contenu){
			if(!contenu){
				callback(0);
				return;
			}
			temp = contenu;
			next();
		});
	});
	// tache 2
	tasks.push(function(next){
		var model = temp;
		if(!model){
			callback(0);
			return;
		};
		model.dtvalidated = new Date();
		model.date = new Date().format('yyyy-MM-dd');
		model.time = new Date().format('HH:mm:ss');
		NOSQL('contenusvalidate').insert(model,true).where('id',model.id).callback(function(err, inserted){
			if(!inserted){
				callback(0);
				return;
			};
			next();
		});
	});

	// tache 3
	tasks.push(function(next){

		NOSQL('contenustoday').remove().where('id', id).callback(function(err, res){
			next();
		});
	});

	tasks.async(function(){
		callback(1);
	});
};
function contenus(){
	var self = this;
	self.view('contenus',{
		menus : []
	});
};
function archieves(){
	var self = this;
	self.view('archieves',{
		menus : []
	});
};
function planning(){
	var self = this;
	self.view('planning',{
		menus : []
	});
};
function configurations(){
	var self = this;
	self.view('configurations',{
		menus : []
	});
};
function matchs(){
	var self = this;
	NOSQL('matchs').find().where('date',NOW.format('yyyy-MM-dd')).callback(function(err,res){
		self.json(res);
	});
};
function menus(){
	var self = this;
	NOSQL('apiconfigs').find().callback(function(err,res){
		self.json(res);
	});
};
function socket(id) {
	var self = this;
	MODULE('flowstream').socket(id, self);
}


function planning_operations(){
	var self = this;
	var data = self.body;
	console.log(data);
	NOSQL('times').modify(data).where('name',data.name).callback(function(err,ok){
		if(!ok){
			self.json({success : false, value : ok});
		};
		self.json({success : true, value : ok});
	})
	
};

function configurations_operations(){
	var self = this;
	var data = self.body;
	var obj = { value : ''};
	var val;
	Object.keys(data).forEach(function(key){
		if(key == 'method' || key == 'baseurl' || key == 'name' || key == 'access_key' ){
			obj[key] = data[key];
			return;
		};

		if(data[key]){
			if(val){
				val += '&'+key+'='+data[key];
			}else{
				val = key+'='+data[key];
			}
		};

	});

	obj.value = val;
	console.log("data from client side",obj);
	NOSQL('apiconfigs').modify(data).where('name',obj.name).callback(function(err,ok){
		if(!ok){
			self.json({success : false, value : ok});
		};
		self.json({success : true, value : ok});
	})
};