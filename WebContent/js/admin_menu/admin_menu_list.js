layui.config({
	base : "js/"
}).use(['form','layer','jquery','laypage'],function(){
	var form = layui.form(),
		layer = parent.layer === undefined ? layui.layer : parent.layer,
		laypage = layui.laypage,
		$ = layui.jquery;

	//加载页面数据
	var newsData = '';
	var url="admin_menu/serch.do";
	var page = 0;
	var pagecurr = 0;
	var limit = 10;
	var dataCount =0;
	var name =$(".search_input").val();
	var pagesize =10;
	var pager ;

	//查询数据
	serch(page,limit,name);
	//获取资料总数
	function getDataCount(name){
		$.get(encodeURI("admin_menu/serchCount.do?name="+name), function(data){
			dataCount=parseInt(data);
			pager=new table_pager();
			pager.init("page",dataCount,pagesize,pagecurr,pageEvent);
		})
	}
	getDataCount($(".search_input").val());//获取资料总笔数
	//初始化分页
//	var pager=new table_pager();
//	pager.init("page",dataCount,pagesize,pageEvent);
	
	//分页按钮事件
	function pageEvent(curr){
		var start =pager.Lstart();
		page=start;
		pagecurr=pager.curr();
		var end =pagesize;
		serch(start,end,$(".search_input").val());
	}
	
	//查询
	function serch(start ,end ,name ){
		$.get(encodeURI("admin_menu/serch.do?page="+start+"&&limit="+end+"&&name="+name), function(data){
			newsData=data;
			newsList(data);
		})
	}
	

	//查询
	$(".search_btn").click(function(){
		var newArray = [];
		if($(".search_input").val() != ''){
			var index = layer.msg('查询中，请稍候',{icon: 16,time:false,shade:0.8});
			serch(page,limit,$(".search_input").val());
			getDataCount($(".search_input").val());
            setTimeout(function(){
                layer.close(index);
            },500);
		}else{
			layer.msg("请输入需要查询的内容");
		}
	})

	//添加文章
	$(".newsAdd_btn").click(function(){
		var index = layui.layer.open({
			title : "添加菜单功能",
			type : 2,
			content : "nextjsp.do?target=admin_menu_add",
			success : function(layero, index){
				layui.layer.tips('点击此处返回菜单列表', '.layui-layer-setwin .layui-layer-close', {
					tips: 3
				});
			}
		})
		//改变窗口大小时，重置弹窗的高度，防止超出可视区域（如F12调出debug的操作）
		$(window).resize(function(){
			layui.layer.full(index);
		})
		layui.layer.full(index);
	})

	//推荐文章
	$(".recommend").click(function(){
		var $checkbox = $(".news_list").find('tbody input[type="checkbox"]:not([name="show"])');
		if($checkbox.is(":checked")){
			var index = layer.msg('推荐中，请稍候',{icon: 16,time:false,shade:0.8});
            setTimeout(function(){
                layer.close(index);
				layer.msg("推荐成功");
            },2000);
		}else{
			layer.msg("请选择需要推荐的文章");
		}
	})

	//审核文章
	$(".audit_btn").click(function(){
		var $checkbox = $('.news_list tbody input[type="checkbox"][name="checked"]');
		var $checked = $('.news_list tbody input[type="checkbox"][name="checked"]:checked');
		if($checkbox.is(":checked")){
			var index = layer.msg('审核中，请稍候',{icon: 16,time:false,shade:0.8});
            setTimeout(function(){
            	for(var j=0;j<$checked.length;j++){
            		for(var i=0;i<newsData.length;i++){
						if(newsData[i].newsId == $checked.eq(j).parents("tr").find(".news_del").attr("data-id")){
							//修改列表中的文字
							$checked.eq(j).parents("tr").find("td:eq(3)").text("审核通过").removeAttr("style");
							//将选中状态删除
							$checked.eq(j).parents("tr").find('input[type="checkbox"][name="checked"]').prop("checked",false);
							form.render();
						}
					}
            	}
                layer.close(index);
				layer.msg("审核成功");
            },2000);
		}else{
			layer.msg("请选择需要审核的文章");
		}
	})

	//批量删除
	$(".batchDel").click(function(){
		var $checkbox = $('.news_list tbody input[type="checkbox"][name="checked"]');
		var $checked = $('.news_list tbody input[type="checkbox"][name="checked"]:checked');
		if($checkbox.is(":checked")){
			layer.confirm('确定删除选中的信息？',{icon:3, title:'提示信息'},function(index){
				var index = layer.msg('删除中，请稍候',{icon: 16,time:false,shade:0.8});
	            setTimeout(function(){
	            	//删除数据
	            	for(var j=0;j<$checked.length;j++){
	            		for(var i=0;i<newsData.length;i++){
							if(newsData[i].newsId == $checked.eq(j).parents("tr").find(".news_del").attr("data-id")){
								newsData.splice(i,1);
								newsList(newsData);
							}
						}
	            	}
	            	$('.news_list thead input[type="checkbox"]').prop("checked",false);
	            	form.render();
	                layer.close(index);
					layer.msg("删除成功");
	            },2000);
	        })
		}else{
			layer.msg("请选择需要删除的文章");
		}
	})

	//全选
	form.on('checkbox(allChoose)', function(data){
		var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"])');
		child.each(function(index, item){
			item.checked = data.elem.checked;
		});
		form.render('checkbox');
	});

	//通过判断文章是否全部选中来确定全选按钮是否选中
	form.on("checkbox(choose)",function(data){
		var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"])');
		var childChecked = $(data.elem).parents('table').find('tbody input[type="checkbox"]:not([name="show"]):checked')
		if(childChecked.length == child.length){
			$(data.elem).parents('table').find('thead input#allChoose').get(0).checked = true;
		}else{
			$(data.elem).parents('table').find('thead input#allChoose').get(0).checked = false;
		}
		form.render('checkbox');
	})

	//是否展示
	form.on('switch(isShow)', function(data){
		var index = layer.msg('修改中，请稍候',{icon: 16,time:false,shade:0.8});
        setTimeout(function(){
            layer.close(index);
			layer.msg("展示状态修改成功！");
        },2000);
	})
 
	//操作
	$("body").on("click",".news_edit",function(){  //编辑
		layer.alert('您点击了文章编辑按钮，由于是纯静态页面，所以暂时不存在编辑内容，后期会添加，敬请谅解。。。',{icon:6, title:'文章编辑'});
	})

	$("body").on("click",".news_collect",function(){  //收藏.
		if($(this).text().indexOf("已收藏") > 0){
			layer.msg("取消收藏成功！");
			$(this).html("<i class='layui-icon'>&#xe600;</i> 收藏");
		}else{
			layer.msg("收藏成功！");
			$(this).html("<i class='iconfont icon-star'></i> 已收藏");
		}
	})

	$("body").on("click",".news_del",function(){  //删除
		var _this = $(this);
		layer.confirm('确定删除此信息？',{icon:3, title:'提示信息'},function(index){
			//_this.parents("tr").remove();
			var id=_this.attr("data-id");
			$.get(encodeURI("admin_menu/delmenu.do?id="+id), function(data){
				//console.log(data);
				top.layer.msg(data.msg);
				if(data.mst==0){
					serch(page,limit,$(".search_input").val());
					getDataCount($(".search_input").val());
				}
			})
			layer.close(index);
		});
	})

	function newsList(that){
		//渲染数据
		function renderDate(data,curr){
			var dataHtml = '';
			if(!that){
				currData = newsData.concat().splice(curr*nums-nums, nums);
			}else{
				currData = that.concat().splice(curr*nums-nums, nums);
			}
			if(currData.length != 0){
				for(var i=0;i<currData.length;i++){
					dataHtml += '<tr>'
			    	+'<td><input type="checkbox" name="checked" lay-skin="primary" lay-filter="choose"></td>'
			    	
			    	+'<td>'+currData[i].name+'</td>';
					dataHtml += '<td style="color:#f00">'+currData[i].m+'</td>';
//			    	if(currData[i].newsStatus == "待审核"){
//			    		dataHtml += '<td style="color:#f00">'+currData[i].newsStatus+'</td>';
//			    	}else{
//			    		dataHtml += '<td>'+currData[i].newsStatus+'</td>';
//			    	}
					var isshow="";
					if(currData[i].display==1){
						isshow="checked";
					}
			    	dataHtml += '<td>'+currData[i].img+'</td>'
			    	+'<td><input type="checkbox" name="show" lay-skin="switch" lay-text="是|否" lay-filter="isShow"'+isshow+'></td>'
			    	//+'<td>'+currData[i].newsTime+'</td>'
			    	+'<td>'
					+  '<a class="layui-btn layui-btn-mini news_edit" data-id="'+data[i].menu_id+'"><i class="iconfont icon-edit"></i> 编辑</a>'
					+  '<a class="layui-btn layui-btn-normal layui-btn-mini news_collect"><i class="layui-icon">&#xe600;</i> 收藏</a>'
					+  '<a class="layui-btn layui-btn-danger layui-btn-mini news_del" data-id="'+data[i].menu_id+'"><i class="layui-icon">&#xe640;</i> 删除</a>'
			        +'</td>'
			    	+'</tr>';
				}
			}else{
				dataHtml = '<tr><td colspan="8">暂无数据</td></tr>';
			}
		    return dataHtml;
		}

		//分页
		var nums = 13; //每页出现的数据量
		if(that){
			newsData = that;
		}
		$(".news_content").html(renderDate(newsData));
		$('.news_list thead input[type="checkbox"]').prop("checked",false);
		form.render('checkbox');
		form.render();
	}
})
