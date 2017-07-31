$(function(){
        var options = {
            currentPage: 1,//当前页
            totalPages: 3,//总页数
            numberofPages: 5,//显示的页数
            
            itemTexts: function(type, page, current) { //修改显示文字
                switch (type) {
                case "first":
                    return "第一页";
                case "prev":
                    return "上一页";
                case "next":
                    return "下一页";
                case "last":
                    return "最后一页";
                case "page":
                    return page;
                }
            }, onPageClicked: function (event, originalEvent, type, page) { //异步换页
            		$('table tr:gt(0)').hide();	
                  	$.post('/searchLibjs',{page:page,take:2},function(data){
						data.forEach(function(value,index){
							
								var tr = "<tr>"+"<td>"+((index+1)+(Number(page)-1)*10)+"</td>"+"<td>"+value.name+"</td>"+"<td>"+value.num+"</td>"+"</tr>";
								$(tr).insertAfter($('table tr:last'));			
							
						})
					})
            },
                    
    };
        $("#example").bootstrapPaginator(options);

//	//页面加载时输出前十条数据
	$.post('/searchLibjs',{page:1},function(data){
		data.forEach(function(value,index){
			if(index<10){
				var tr = "<tr>"+"<td>"+(index+1)+"</td>"+"<td>"+value.name+"</td>"+"<td>"+value.num+"</td>"+"</tr>";
				$(tr).insertAfter($('table tr:last'));			
			}
		})
	})

	//搜索含有输入框内容的数据
	$('#search_btn').click(function(){
		var searchUrl = $('#searchurl').val();
		$.post('/searchUrl',
			{
				searchUrl : searchUrl
			},
			function(data){
				$('table tr:gt(0)').hide();
				$('.pagination').hide();
					data.forEach(function(value,index){
						var tr = "<tr>"+"<td>"+value.rank+"</td>"+"<td>"+value.name+"</td>"+"<td>"+value.num+"</td>"+"</tr>";
						$(tr).insertAfter($('table tr:last'));			
					})
			}
		)
		return false;
	})
	

	
})
