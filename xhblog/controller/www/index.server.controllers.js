"use strict";
//引入数据模型  
const mongoose=require('mongoose');
const Article = mongoose.model('Article');			//文章
const Category=mongoose.model("Category");			//类型
const Banner = mongoose.model('Banner');			//轮播图
const User = mongoose.model('User');				//用户
const Lm = mongoose.model('Lm');				//留言
const Friend=mongoose.model("Friend");			//友链
const Comment=mongoose.model('Comment');		//评论
const async = require('async');

/*
 	Object Indexs() 主页面访问
 * @params currentPage当前页面
 * @params pagesize要显示的列表个数
 * */
var Indexs=function(req,res,currentPage,pageSize){
	async.waterfall([
		function(callback){
			Banner.find({}).sort({weight:-1}).limit(3).exec(function(err,banner){
				if(err){
					return console.log("banner find err:",err)
				}
				callback(null,banner);
			})
		},
		function(banner,callback){
			Article.count({},function(err,total){	//所有文章
				Article.find({}).skip((currentPage-1)*pageSize).limit(pageSize).exec(function(err,doc){
					callback(null,banner,total,doc);
				})
			});
		},
		function(banner,total,doc,callback){		//最新文章
			Article.findNew(1,function(newArticle){
				callback(null,banner,total,doc,newArticle);
			});
		},
		function(banner,total,doc,newArticle,callback){		//热门文章
			Article.findByHot(3,function(hot){
				callback(null,banner,total,doc,newArticle,hot);
			})
		},
		/*function(banner,total,doc,newart,hot,callback){
			/*Article.find({}).populate('category').exec(function(err,ddc){
				console.log(ddc);
			});*/
			
			/*Article.aggregate([{$group : {_id:"$type", total : {$sum : 1}}}],function(err,types){
				if(err){
					return console.dir(err);		
				}
				callback(null,banner,total,doc,newart,hot,types);*/
				/*前台页面导航
				<%types.forEach(function(v,i){%>
				<li>
					<a href="/type/<%=v._id%>"><%=v._id%> <span><%=v.total%></span></a>
				</li>
				<%})%>*/
			/*})*/
			/*Category.find({}).exec(function(err,categorys){
				callback(null,banner,total,doc,newart,hot,categorys);
			})
		},*/
	],function(err,banner,total,article,newArticle,hot){
		console.log(app.locals.user);
		res.render('www/', {
			title: '个人博客首页',
			banner:banner,
			total:total,
			article:article,	//所有文章
			newArticle:newArticle[0],	//最新文章
			hot:hot,				//热门文章
			currentpage:currentPage,	//当前页码
			pagesize:pageSize			//列表数
		});
	});
}
  

/*
 * checkSession 检测session
 * 
 * */
function checkSession(ss,callback){
	if(ss){
		return callback(null);
	}else{
		return callback("err");
	}
}

/*
 * checkUserStatus 检查用户是否登陆
 * */
function checkUserStatus(req,res,next){
	if(!req.session["userSession"]){
        res.redirect('login');		//res.redirect会终端ajax请求
    }
	next();
}

app.use(function(req,res,next){
	var _user=req.session['userSession'];
	app.locals.user=_user;
	/*Category.find({}).exec(function(err,categorys){
		Friend.find({},function(err,friends){
			app.locals.friends=friends;
			app.locals.categorys=categorys;
		});
	});
	next();*/
	next();
})



module.exports={
	checkLogin:function(req,res,next){
		if(!req.session["userSession"]){
	       return res.json({
	    	   code:-2
	       });
	    }
		next();
	},
	common:function(req,res,next){
		Category.find({}).exec(function(err,categorys){
			Friend.find({},function(err,friends){
				app.locals.friends=friends;
				app.locals.categorys=categorys;
			});
		});
		next();
	},
	showIndex:function(req, res) {
		const pageNum=req.params["page"]?req.params["page"]:1;
		Indexs(req,res,pageNum,1);
	},
	showDetial:function(req,res){
		const bid=req.params["bid"];
		async.waterfall([
			function(callback){
				Article.findById(bid,function(doc){
					if(!doc){			//没有找到文章就发送一个404
						return res.send(404, "Oops! We didn't find it");
					}
					Article.findByIdUpdate(bid,function(){
						callback(null,doc);
					})
				});
			},
			function(doc,callback){
				Article.findByHot(2,function(hot){
					callback(null,doc,hot);
				})
			},
			function(doc,hot,callback){
				Article.findOne({bId:{'$gt':bid}},function(err,nextArticle){
					if(err){
						console.log(err)
					}
					callback(null,doc,hot,nextArticle);
				});
			},
			function(doc,hot,nextArticle,callback){
				Article.findOne({bId:{'$lt':bid}},function(err,prevArticle){
					if(err){
						console.log(err)
					}
					callback(null,doc,hot,nextArticle,prevArticle);
				});
			},
			function(doc,hot,nextArticle,prevArticle,callback){
				Comment.find({article:doc._id}).populate('from','username').populate('reply.from reply.to','username').exec(function(err,comments){
					callback(null,doc,hot,nextArticle,prevArticle,comments);
				})
			}
			
		],function(err,doc,hot,nextArticle,prevArticle,comments){
			res.render("www/detial",{
				article:doc,
				hot:hot,
				title:doc.title,
				nextArticle:nextArticle,
				prevArticle:prevArticle,
				comments:comments			//评论
			});
		})
	},
	showSearchResults:function(req,res){
		var title=req.query.wd;
		async.waterfall([
			function(callback){
				Article.findByTitle(title,function(articles){
					callback(null,articles);
				});
			},
			/*function(doc,callback){
				Article.aggregate([{$group : {_id:"$type", total : {$sum : 1}}}],function(err,result){
					if(err){
						return console.dir(err);
					}
					var typeNums=[];
					for(var i=0;i<result.length;i++){
						typeNums.push(result[i].total);
					}
					callback(null,doc,result);
				})
			}*/
		],function(err,articles){
			res.render("www/search_results",{
				articles:articles,
				title:'搜索结果'
			});
		});
	},
	showLogin:function(req,res){
		res.render("www/login",{
			title:"用户登录"
		})
	},
	showRegist:function(req,res){
		
		res.render("www/regist",{
			title:"用户注册"
		})
	},
	logout:function(req,res){
		delete req.session['userSession'];
		delete app.locals.user;
		res.json({
			code:1
		});
	},
	doLogin:function(req,res){
		const username=req.body.username,
		  password=req.body.password,
		  ref=req.query.ref,
		  articleId=req.query.articleId;
		console.log(articleId);
		
		if(validator.isEmpty(username)){
			res.json({
				code:-2,
				message:"请输入用户名！"
			});
		}else if(validator.isEmpty(password)){
			res.json({
				code:-2,
				message:"请输入密码！"
			});
		}else{
			User.findOne({username:username},function(err,user){
				if(err){
					return console.dir("查询出错");
				}else if(!user){
					res.json({
						code:-1,
						message:"该用户没有注册！"
					})
				}else if(user&&user.password!==md5(password)){
					res.json({
						code:0,
						message:"用户密码不正确！"
					})
				}else{
					req.session["userSession"] = user;
					res.json({
						code:1,
						message:"登录成功！",
						ref:ref,
						articleId:articleId
					});
					
				}
			})	
		}
	},
	doRegist:function(req,res){
		const username=req.body.username,
			  password=req.body.password,
			  email=req.body.email;
		const user=new User({
			username:username,
			password:md5(password),
			email:req.body.email
		});
		if(validator.isEmpty(username)){
			res.json({
				code:-2,
				message:"用户名不得为空！"
			});
		}else if(validator.isEmpty(password)){
			res.json({
				code:-2,
				message:"密码不得为空！"
			});
		}else if(validator.isEmpty(email)){
			res.json({
				code:-2,
				message:"邮箱不得为空！"
			});
		}else if(!validator.isEmail(email)){
			res.json({
				code:-2,
				message:"请输入正确的邮箱！"
			});
		}else if(!validator.isLength(password,{min:3})){
			res.json({
				code:-2,
				message:"密码不得小于3位！"
			});
		}else{
			User.findOne({username:username},function(err,result){
				if(err){
					return console.dir("查询出错");
				}else if(result){
					res.json({
						code:-1,
						message:"用户名已被创建"
					});
				}else{
					user.save(function(err){
						if(err){
							return console.dir("保存用户出错");
						}
						res.json({
							code:1,
							message:"成功注册"
						});
					});
				}
			});
		}
	},
	postComment:function(req,res){
		var _comment=req.body;
		_comment.from=req.session["userSession"];
		if(_comment.cId){
			var reply={
				from:_comment.from._id,
				to:_comment.toId,
				content:_comment.content
			};
			Comment.update({_id:_comment.cId},{
				$addToSet:{"reply": reply}
			}).then(function(){
				res.json({
					code:1
				});
			}).catch(function(err){
				console.log(err);
			});
			
			/*Comment.findOne({_id:_comment.cId},function(err,comment){
				var reply={
					from:_comment.from,
					to:_comment.toId,
					content:_comment.content,
					create_time:Date.now()
				};
				
				
				comment.reply.push(reply);
				comment.save(function(err,comment){
					res.json({
						code:1
					});
				})
				
			})*/
		}else{
			var comment=new Comment(_comment);
			comment.save().then(function(comment){
				res.json({
					code:1
				});
			}).catch(function(err){
				console.log('评论报错出错:'+err);
			});
		}
	},
	showWord:function(req,res){
		checkUserStatus(req,res,function(){
			res.render("www/word",{
				title:'留言'
			})
		})
	},
	postWord:function(req,res){
		var lm=new Lm({
			message:req.body.content,
			username:req.session["userSession"].username,
			userid:req.session["userSession"]._id
		});
		lm.save(function(err){
			if(err){
				return console.dir("留言失败:"+err)
			}
			res.json({
				code:1
			});
		});

		/*checkSession(req.session["userSession"],function(status){
			if(status){
				console.log(status)
				res.json({
					code:-1,
					message:"请先登录"
				});
			}
			var lm=new Lm({
				message:req.body.content,
				username:req.session["userSession"].username,
				userid:req.session["userSession"]._id
			});
			lm.save(function(err){
				if(err){
					return console.dir("err:"+err)
				}
				console.dir("留言成功");
				res.json({
					code:1,
					message:"留言成功"
				});
			})
		});*/
	},
	about:function(req,res){
		res.render("www/about",{
			title:'关于我'
		})
	}

}