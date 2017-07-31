var express = require('express');
var router = express.Router();
var jsLib = require("../models/user");
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
    name: { type: String, index: { unique: true, dropDups: true }}
});
var request = require("request");
var cheerio = require("cheerio");
var schedule = require("node-schedule");
var url = "http://www.alexa.cn/siterank/";
var keyword = 100;
var pages = [1,2,3,4,5,6];
var frequentjs = ['jquery','jQuery','base','vue','common','bootstrap','main','vendor','seallogo','home','m','k','c','nav','voice','g','log','dc','taspeed','footer','modernizr','json','sea','lang','request','class','app','mobile','lib','ajax'];


mongoose.connect('mongodb://localhost:27017/jslib');
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

　var rule = new schedule.RecurrenceRule();
　rule.minute = 50;
schedule.scheduleJob(rule, function(){
		jsLib.remove({},function(err,data){
				if(err) {
					console.log(err);
				}else{
					getTop50(frequentjs);	
				}
			})
})

//计算页面个数
router.post('/pagenum',function(req,res){
		 jsLib.find({},function(err,data){
				var n = data.length;
				var pages = n/10;
				res.json(pages);
			})
})
//搜索数据
router.post('/searchUrl',function(req,res){
	var urlArr = [];
	jsLib.find({}).sort({"num":-1}).exec(function(err,data){
				data.forEach(function(value,index){
					if(value.name==req.body.searchUrl){
						console.log(req.body.searchUrl)
						var urlObj = {	
							rank:index+1,
							name:value.name,
							num :value.num
						};
					urlArr.push(urlObj);
					}
				})
			res.json(urlArr);
	})		
})
//返回响应页面的数据
router.post('/searchLibjs',function(req,res){
	var page = req.body.page;
			jsLib.find({}).sort({"num":-1}).limit(10).skip((page-1)*10).exec(function(err,data){
				if(err) console.log(err);
				res.json(data);
			})			
})

function getTop50(arr){
	arr.forEach(function(value,data){
		var jslib = new jsLib({
			name : value,
			num  : 0
		});
		jslib.save();
	})
	for(var i=0;i<pages.length;i++){
			var options = {
			url: url+'/'+pages[i],
			headers :{
				"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
				"User-Agent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3018.3"}		
		}
		request(options,function(err,res,body){
			if(err) console.log(err.message);
			var answer = filterInfo(body);
			filterJs(answer,keyword);
		})
	}	
}

function filterInfo(html){
	var $ = cheerio.load(html);
	var lis = $('.siterank-sitelist>li');
	var target_info = [];
	
	lis.each(function(index,value){
		var elem = $(value);
		var li_index = elem.find('.rank-index').text(),
			li_value = elem.find('.domain>a').text();
			li_url = "http://www."+li_value.toLowerCase();
		var elem_info = {
			li_index : li_index,
			li_value :li_value,
			li_url : li_url
		}
		target_info.push(elem_info);
	})
	return target_info;
}

//过滤出网站的js库
function filterJs(arr,num){
	arr.forEach(function(value,index){
		var li_index = value.li_index,
			li_value = value.li_value,
			li_url = value.li_url;
		if(Number(li_index)<=Number(num)){
			console.log(li_index+"-→"+li_value+"-→"+li_url);
			var options = {
				url: li_url,
				headers :{
					"User-Agent":"Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3018.3"}		
			}
				var scriptsArr =[];
				request(options,function(err,res,result){
					if(result){
							var $ = cheerio.load(result);		
							var scripts = $("script").toArray();
							scripts.forEach(function(value,index){
								var value = $(value);
								if(value.attr('src')){	
									var reg = /[^\/\\]+$/gi;
									var libName = value.attr('src').match(reg).join('');
		      				var srcObj = libName.slice(0,libName.indexOf('.'));
		      				var reg2 = /^[a-zA-Z]+$/gi;
		      				var srcObj2 = srcObj.match(reg2);
		      				if(srcObj2!=null){
		      					scriptsArr.push(srcObj2[0].trim());	
		      				}
								}
							})
					}
				if(scriptsArr!='') {
					scriptsArr.forEach(function(value,index){
						jsLib.find({name:value},function(err,data){
									if(data.length!=0){
										jsLib.update({name:value},{'$inc':{'num':1}},{upsert:true},function(err,data){
                			console.log('save success...');
           					 });    
									}	
							})
					})
				}	
			})
		}
	})
}

module.exports = router;
