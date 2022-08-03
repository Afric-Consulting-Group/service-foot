exports.install = function(){

    
    ROUTE('+GET /teams/all/',all_teams);
    //ROUTE('+GET /automation/slug/',toSlug);
    ROUTE('+GET /matchs/today/',matchs_today);
};

function all_teams(){
    var self = this;
    var page = self.query.page;
    NOSQL('teams').find().page(page,12).callback(function(err,res){
        if(err){
            LOGGER('apiGetErrors','GET /teams/all/', self.query.msisdn);
            
            return;
        }else{
            toArray(res,function(menu){
                if(page  == 1){
                    LOGGER('apiGetSuccess','GET /teams/all/?page=1', self.query.msisdn);
                    self.json(menu);
                }else{
                    LOGGER('apiGetSuccess','GET /teams/all/?page=0', self.query.msisdn);
                    menu.push('Suite');
                    self.json(menu);
                }
            });
        }
       
    })
};
function matchs_today (){
    var self = this;
    NOSQL('matchs').find().where('date',NOW.format('yyyy-MM-dd')).callback(function(err,res){
        if(err){
            LOGGER('apiGetErrors','GET /matchs/today/',self.query.msisdn);
            return;
        }else{
            toArray2(res,function(menu){
            menu.push('Retourner');

            LOGGER('apiSuccess','GET /matchs/today/',self.query.msisdn);

                    self.json(menu);
            });
        }
    })
}
function toArray(data,callback){
    var menu = [];
    data.forEach(element => {
        menu.push(element.name);
    });
    callback(menu);
}
function toArray2(data,callback){
    var menu = [];
    data.forEach(element => {
        menu.push(element.home_name+ ' vs ' + element.away_name + ' : '+element.time);
    });
    menu.push('Tout suivre');

    callback(menu);
}

// function toSlug(){
//     var self = this;
//     NOSQL('matchs').find().callback(function(err,res){
//         res.forEach(function(item){
//             var doc = {};
//             doc.match_id = item.match_id;
//             doc.slug = (item.home_name +' vs '+item.away_name).slug();
//             exec(doc);
//         });
//     })
// }

function exec(doc){
    console.log(doc);
    NOSQL('matchs').modify({ slug : doc.slug}).where('match_id',doc.match_id).callback(function(err, res){
        console.log(res);
    })
}