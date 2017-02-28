"use strict";
var uetrue=null;
app.controller('articleCtrl',
		['$scope','$http',"$stateParams",'$window','$log','$modal','toaster','articleServices',"defPopService",
		 function($scope,$http,$stateParams,$window,$log,$modal,toaster,articleServices,defPopService){
	//分页配置参数
	$scope.pageConfig = {
		maxSize:5,
		limit:2,		//每页显示的文章数
	    bigTotalItems:0,	//文章总数
        bigCurrentPage:1
    };
	$scope.article = {};
	$scope.ArticleType = [					//文章类型
	      { name: '网络热点', value:"网络热点" },	
	      { name: 'IT技术', value:"IT技术" },
	      { name: 'HTML', value:"HTML" },
	      { name: 'JS', value:"JS" }
	 ];		

      //分页显示
	 $scope.pageChanged = function(cp,limit) {
    	 articleServices.page({current:cp,textCount:limit}).then(function(res){
    		 $scope.articlelist=res.data.page;
    		 $scope.pageConfig.bigTotalItems =res.data.total;
    		
    	 },function(err){
    		 defPopService.defPop({
					status:0,
					content:"出错了！"
			 });
 		 })
	 };	
	
	 
	$scope.checkedIds = [];		//id组
	//文章全选操作
	$scope.selectAll=function(allCheck){
		/*angular.forEach($scope.articlelist,function (v) {
			v.check=$scope.select_all;
			if($scope.checkedIds.indexOf(v.bId)<0){
				$scope.checkedIds.push(v.bId);
			}
        });*/
		/*$scope.item_checked=!$scope.item_checked;*/
		if(allCheck==true){
			angular.forEach($scope.articlelist,function (v) {
				if($scope.checkedIds.indexOf(v.bId)<0){
					$scope.checkedIds.push(v.bId);
				}
            });
		}else{
			 angular.forEach($scope.articlelist,function (v) {
				$scope.checkedIds=[];
	         });
		}
	}
	//单选
	$scope.selectOne = function (id) {
		/*var index = $scope.checkedIds.indexOf(item.bId);
		console.log($scope.checkedIds)
		console.log(index);*/
		var index = $scope.checkedIds.indexOf(id);
		if(index === -1) {					//如果没有那就添加到数组中
			 $scope.checkedIds.push(id);				
        } else if (index !== -1){			//否则就删除掉
            $scope.checkedIds.splice(index, 1);
        };
    }
    
	$scope.del=function(){				//多选或单选删除
		if($scope.checkedIds.length==0){
			return defPopService.defPop({
					status:0,
					content:"请选择要删除的文章！"
			 });
		}
	    var modalInstance = $modal.open({
	          templateUrl: 'confirm.html',
	          size:"sm",
	          controller: 'ModalInstanceCtrl',
	          resolve: {
	        	  data:function(){		//注入到ModalInstanceCtrl 里的data
	        		  var obj={
	        			  id:$scope.id,
	        			  handle:0
	        		  }
	        		  return obj;
	        	  }
	          }
      });
	  modalInstance.result.then(function () {
			$http({
				method:"POST",
				url:"/admin/article/del",
				data:{ids:$scope.checkedIds}
			 }).then(function(res){
				var data=res.data;
				if(data.code>0){
					defPopService.defPop({
						status:1,
						content:"删除成功!",
						callback:function(){
							$scope.pageChanged();
						}
					 });
				}
			 }).catch(function(err){
				console.log(err)
			 })
       }, function () {
          $log.info('Modal dismissed at: ' + new Date());
       });
	}
	
	 

	//列表显示  
	$scope.loadlist=function(){
		articleServices.list('').then(function(res){
			$scope.pageConfig.bigTotalItems =res.data.article.length;
		},function(err){
			 defPopService.defPop({
					status:1,
					content:"出错了！"
			 });
		})
	}
	
	$scope.format=function(arg){			//时间格式化，可用angular自带的$filter格式化时间
		return moment(arg).format('YYYY-MM-DD HH:mm:ss');
	};
	$scope.remove=function(item){				//图标点击删除
		var id = item.bId;
		var modalInstance = $modal.open({
	          templateUrl: 'confirm.html',
	          size:"sm",
	          controller: 'ModalInstanceCtrl',
	          resolve: {
	        	  data:function(){		//注入到ModalInstanceCtrl 里的data
	        		  var obj={
	        			  id:$scope.id,
	        			  handle:0
	        		  }
	        		  return obj;
	        	  }
	          }
        });
		 modalInstance.result.then(function () {
			articleServices.remove(id).then(function(res){
				var data=res.data;
				if(data.code>0){
					 defPopService.defPop({
						status:1,
						content:"删除成功!",
						callback:function(){
							$scope.pageChanged();
						}
					 });
				}
			},function(err){
				 defPopService.defPop({
						status:0,
						content:"出错了！"
				 });
			});
         }, function () {
            $log.info('Modal dismissed at: ' + new Date());
         });
	
	};
	//发布文章
	$scope.save=function(){
		var formData = new FormData($("#Article_form")[0]);
		formData.append('author',$('#manager_name').text().trim());
		formData.append('content',UE.getEditor('editor').getContentTxt());
		formData.append('tagcontent',UE.getEditor('editor').getContent());
		formData.append("article_type",$scope.article.type.name);	//类型
		articleServices.save(formData).then(function(res){
			var data=res.data;
			if(data.code>0){
				defPopService.defPop({
					status:1,
					content:"发表成功!"
				 });
			}
		},function(err){
			 defPopService.defPop({
					status:0,
					content:"出错了！"
			 });
		});
	};
	
	//搜索文章
	$scope.search=function(title){
		if(!title){
			return defPopService.defPop({
					status:0,
					content:"请输入要搜索文章的标题！"
			 });
			
		}
		articleServices.search(title).then(function(res){
			if(res.data.code<0){
				return defPopService.defPop({
					status:0,
					title:"搜索结果",
					content:"没有找到相关文章！"
			    });
				
			}
			var data=res.data.results;
			$scope.searchResult=data;
			$scope.number=res.data.number;
		},function(err){
			defPopService.defPop({
				status:0,
				content:"服务器出错了！"
		    });
		});
	};
	
	//编辑文章
	$scope.edit=function(item){
		$scope.id=item.bId;
        var modalInstance = $modal.open({
            templateUrl: '/tpl/admin_tpl/article/editor_modal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
        	    data:function(){		//注入到ModalInstanceCtrl 里的data
        		    var obj={
        			    id:$scope.id,
        			    handle:1		
        		    }
        		  return obj;
        	    },
             }
        });
	};
}]);

app.controller('editorCtrl',['$scope',function($scope){
	if (uetrue) {
		uetrue.destroy();
	}
	uetrue=UE.getEditor('editor',{
        initialFrameHeight:300		//高度设置
    });
}]);


app.controller("articleListCtrl",["$scope","$stateParams",function($scope,$stateParams){
	$scope.pageConfig.bigCurrentPage=parseInt($stateParams.page);
	$scope.pageChanged($scope.pageConfig.bigCurrentPage,$scope.pageConfig.limit);
}]);


app.controller('ModalInstanceCtrl',
	['$scope', '$modalInstance',"data","articleServices","defPopService",
	 function($scope,$modalInstance,data,articleServices,defPopService){
		var id=data.id;
		if(data.handle==1){				//
			articleServices.find(id).then(function(res){
				$scope.up_item=res.data.article;
				UE.delEditor("up_editor");		//先销毁在进行创建否则会报错
				var upUe=UE.getEditor('up_editor',{
			        initialFrameHeight:200		//高度设置
			    });  
			    upUe.addListener("ready", function () {
			    	// editor准备好之后才可以使用
			    	upUe.setContent($scope.up_item.tagcontent);
		        });
			},function(err){
				defPopService.defPop({
					status:0,
					content:"服务器出错了！"
			    });
			});
		}
	    $scope.update = function (id) {
	    	var arg={
	    		id:id,
	    		tagcontent:UE.getEditor('up_editor').getContent(),
	    		content:UE.getEditor('up_editor').getContentTxt()
	    	};
	    	articleServices.update(arg).then(function(res){
	    		var data=res.data;
	    		if(data.code>0){
	    			defPopService.defPop({
	    				status:1,
	    				content:"更新成功！"
	    		    });
	    			
	    		}
	    	},function(err){
	    		defPopService.defPop({
    				status:0,
    				content:"更新失败！"
    		    });
	    	
	    	});
	    	
	    };

	    $scope.cancel = function () {
	       $modalInstance.dismiss('cancel');
	    };
	    
	    $scope.confirm=function(){
	        $modalInstance.close({			//里面的参数为向 modalInstance.result.then(function (e) {})中传递一个数据
	        	code:1						
	        });
	    }
	    
	    
}])




