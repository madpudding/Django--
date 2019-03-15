/*
* description：index.js 是首页index独有的js
* author： fcj
* time： 2019-02-17
* dependence： 依赖有 echarts、 boostrap组件、 jquery
* es-version： es6
* */

/*全局变量*/
let topNum = 10; /*top榜默认数字*/
let balanceTime = 'day'; /*默认环比参数时间为天*/
let timeChoose = true;  /*top榜 未选择时间默认7天*/
let tableJson = {}; /*表格排序数据*/
let upDown = false; /*表格排序默认false为倒序*/
let round = 0; /*爬虫今天运行轮数*/
let allNum = 0;  /*结果总数，用于柱状图百分比计算*/

function upOrDown() {
    if(upDown){
        upDown = false;
    }else {
        upDown = true;
    }
}

function thisWeek(){  /*最近一周*/
    let endStamp = new Date().getTime();
    let startStamp = endStamp - 518400000;
    let recentData = rencentDay(startStamp, endStamp);
    return recentData
}

function zeroClock() {  /*返回当天零点、与当前时间*/
    let resultJson = {};
    let start = new Date(new Date(new Date().toLocaleDateString()).getTime());
    let end = new Date().getTime();
    start = start.getTime();
    resultJson['start_time'] = start;
    resultJson['end_time'] = end;
    return resultJson;
}

function rencentDay(start, end) {
    // TODO: 此处以后应该去掉 / 1000 精确到毫秒 已经完成！
    let startStamp = Number(start);
    let endStamp = Number(end);
    let timeJson = {"start_time": startStamp, "end_time": endStamp};
    return timeJson;
}

setInterval("crawlerStatus()", 6000);
function crawlerStatus(){
    $.ajax({  /*加载爬虫状态数据*/
        url: "crawler_status",
        type: "GET",
        data: zeroClock(),
        dataType:"json",
        async: false,
        success: function (data) {
            let status = data.data;  /*爬虫运行状态*/
            if (status.stage > 0){
                let spiderStatus = document.getElementById('spider_status');
                let h1 = document.getElementById('spider_status_h1');
                h1.innerText = '正常';
                h1.setAttribute('style', 'margin-top:15%;color:white');
                spiderStatus.setAttribute('style', 'text-align:right');
            }
            else {
                let spiderStatus = document.getElementById('spider_status');
                let h1 = document.getElementById('spider_status_h1');
                h1.innerText = '暂未运行';
                h1.setAttribute('style', 'margin-top:15%;color:white');
                spiderStatus.setAttribute('style', 'text-align:right');
            }

            if (status.stage < 2){  /*爬虫运行阶段*/
                let spiderStage = document.getElementById('spider_stage');
                let h1 = document.getElementById('spider_stage_h1');
                h1.innerText = status.status.toString().replace('开始', '');
                h1.setAttribute('style', 'margin-top:15%;color:white');
                spiderStage.setAttribute('style', 'text-align:right');
            }
            else{
                let spiderStage = document.getElementById('spider_stage');
                let h1 = document.getElementById('spider_stage_h1');
                h1.innerText = status.status.toString().replace('开始', '');
                h1.setAttribute('style', 'margin-top:15%;color:white');
                spiderStage.setAttribute('style', 'text-align:right');
            }

            let spiderNums = document.getElementById('spider_nums');  /*爬虫运行轮数*/
            let h1 = document.getElementById('spider_nums_h1');
            round = status.id;/*赋予具体轮数数字*/
            h1.innerText = '第'+status.id+'轮';
            h1.setAttribute('style', 'margin-top:15%;color:white');
            spiderNums.setAttribute('style', 'text-align:right');
        }
});
}


setInterval("crawlerSeed()", 800);
function crawlerSeed() {
    $.ajax({  /*实时数字呈现*/
    url: "crawler_seed",
    type: "GET",
    dataType:"json",
    async: false,
    success: function (data) {
        // TODO: 计算逻辑存在问题
        let allParseTotal = data.all.content_input_total - data.all.content_download_fail_total;  /*全部解析总数*/
        let allParseSuccess = data.all.content_success_total;  /*全部解析成功总数*/
        let allDownloadTotal = data.all.content_input_total;  /*全部采集总数*/
        let allDownloadSuccess = allParseTotal;  /*全部下载成功总数*/

        let parseTotal = data.list[0].content_input_total - data.list[0].content_download_fail_total; /*解析总数*/
        let parseSuccess = data.list[0].content_success_total;  /*解析成功总数*/
        let downloadTotal = data.list[0].content_input_total;  /*采集总数*/
        let downloadSuccess = parseTotal;  /*下载成功总数*/

        let allParsePer = allParseSuccess / allParseTotal; /*解析成功率*/
        allParsePer = allParsePer.toFixed(3);
        allParsePer = Number(allParsePer*100).toFixed(1);
        allParsePer += "%";

        let allDownloadPer = allDownloadSuccess / allDownloadTotal;  /*下载成功率*/
        allDownloadPer = allDownloadPer.toFixed(3);
        allDownloadPer = Number(allDownloadPer*100).toFixed(1);
        allDownloadPer += "%";

        let parsePer = "0.0%"; /*默认成功率为0.0%*/
        if(parseTotal !== 0){
            parsePer = parseSuccess / parseTotal; /*解析成功率*/
            parsePer = parsePer.toFixed(3);
            parsePer = Number(parsePer*100).toFixed(1);
            parsePer += "%";
        }

        let downloadPer = '0.0%';
        if(downloadTotal !==0){
            downloadPer = downloadSuccess / downloadTotal;  /*下载成功率*/
            downloadPer = downloadPer.toFixed(3);
            downloadPer = Number(downloadPer*100).toFixed(1);
            downloadPer += "%";
        }

        let parseTotalDiv = document.getElementById('parse-total'); /*所有轮数*/
        parseTotalDiv.innerHTML = allParseTotal;
        parseTotalDiv.setAttribute('style','color:#1c466d');

        let parseTotalH5 = document.getElementById('parse_bottom');  /*具体轮数*/
        parseTotalH5.innerHTML = '&nbsp;'+parseTotal+' / 第'+round+'轮';
        parseTotalH5.setAttribute('style','font-size:15px;color: #1c466d;');

        let parsePerDiv = document.getElementById('parse-per'); /*所有轮数*/
        parsePerDiv.innerHTML = allParsePer;
        parsePerDiv.setAttribute('style','color:#1c466d');

        let parsePerH5 = document.getElementById('parse_per_bottom');  /*具体轮数*/
        parsePerH5.innerHTML = '&nbsp;'+parsePer+' / 第'+round+'轮';
        parsePerH5.setAttribute('style','font-size:15px;color: #1c466d;');

        let downloadTotalDiv = document.getElementById('download-total'); /*所有轮数*/
        downloadTotalDiv.innerHTML = allDownloadTotal;
        downloadTotalDiv.setAttribute('style','color:#1c466d');

        let downloadTotalH5 = document.getElementById('download_total_bottom');  /*具体轮数*/
        downloadTotalH5.innerHTML = '&nbsp;'+downloadTotal+' / 第'+round+'轮';
        downloadTotalH5.setAttribute('style','font-size:15px;color: #1c466d;');

        let downloadPerDiv = document.getElementById('download-per'); /*所有轮数*/
        downloadPerDiv.innerText = allDownloadPer;
        downloadPerDiv.setAttribute('style','color:#1c466d');

        let downloadPerH5 = document.getElementById('download_per_bottom');  /*具体轮数*/
        downloadPerH5.innerHTML = '&nbsp;'+downloadPer+' / 第'+round+'轮';
        downloadPerH5.setAttribute('style','font-size:15px;color: #1c466d;');

        }
    });
}

function init() {  /*日历汉化控件*/
    //定义locale汉化插件
    let locale = {
        "format": 'YYYY-MM-DD',
        "separator": " -222 ",
        "applyLabel": "确定",
        "cancelLabel": "取消",
        "fromLabel": "起始时间",
        "toLabel": "结束时间'",
        "customRangeLabel": "自定义",
        "weekLabel": "W",
        "daysOfWeek": ["日", "一", "二", "三", "四", "五", "六"],
        "monthNames": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        "firstDay": 1
    };
    //初始化显示当前时间
    $('#report-range span').html(moment(). /*曲线图日历*/
    subtract('hours', 1).format('YYYY-MM-DD') + ' - ' + moment().format('YYYY-MM-DD'));
    $('#report-range-amount span').html(moment().  /*饼图日历*/
    subtract('hours', 1).format('YYYY-MM-DD') + ' - ' + moment().format('YYYY-MM-DD'));
    $('#report-range-table span').html(moment().  /*表格日历*/
    subtract('hours', 1).format('YYYY-MM-DD') + ' - ' + moment().format('YYYY-MM-DD'));

    //曲线图日期控件初始化
    $('#report-range').daterangepicker(
        {
            'locale': locale,
            //汉化按钮部分
            ranges: {
                "今日": [moment(), moment()],
                '昨日': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '最近7日': [moment().subtract(6, 'days'), moment()],
                '最近30日': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
           },
            startDate: moment().subtract(29, 'days'),
            endDate: moment()
        },
        function (start, end) {
            $('#report-range span').
            html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); /*获取选择时间*/
            let postData = rencentDay(start, end);
            crawlerStatistics(postData); /*提交数据*/
        }
   );

   //饼图日期控件初始化
   $('#report-range-amount').daterangepicker(
        {
            'locale': locale,
            //汉化按钮部分
            ranges: {
                "今日": [moment(), moment()],
                '昨日': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '最近7日': [moment().subtract(6, 'days'), moment()],
                '最近30日': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
           },
            startDate: moment().subtract(29, 'days'),
            endDate: moment()
        },
        function (start, end) {
            $('#report-range-amount span').
            html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); /*获取选择时间*/
            timeChoose = false;
            let postData = rencentDay(start, end);
            postData['top_num'] = topNum;
            crawlerAmount(postData); /*提交数据*/
        }
   );

   //表格日期控件初始化
   $('#report-range-table').daterangepicker(
        {
            'locale': locale,
            //汉化按钮部分
            ranges: {
                "今日": [moment(), moment()],
                '昨日': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '最近7日': [moment().subtract(6, 'days'), moment()],
                '最近30日': [moment().subtract(29, 'days'), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
           },
            startDate: moment().subtract(29, 'days'),
            endDate: moment()
        },
        function (start, end) {
            $('#report-range-table span').
            html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); /*获取选择时间*/
            let postData = rencentDay(start, end);
            hideSort();
            crawlerTable(postData); /*提交数据*/
        }
   );
}
function hideSort(){  /*禁止点击*/
    $('#download-suc-growth').css('pointer-events','none');
    $('#parse-suc-growth').css('pointer-events','none');
    $('#storage-suc-growth').css('pointer-events','none');
    $('#download-per-growth').css('pointer-events','none');
    $('#parse-per-growth').css('pointer-events','none');
    $('#storage-per-growth').css('pointer-events','none');
}
function autoSort(){ /*启用点击*/
    $('#download-suc-growth').css('pointer-events','auto');
    $('#parse-suc-growth').css('pointer-events','auto');
    $('#storage-suc-growth').css('pointer-events','auto');
    $('#download-per-growth').css('pointer-events','auto');
    $('#parse-per-growth').css('pointer-events','auto');
    $('#storage-per-growth').css('pointer-events','auto');
}

function getCookie() {  /*从cookie提取用户信息*/
    let name = '';
    if(document.cookie.length > 0){
        let cookieStr = document.cookie.toString();
        name = cookieStr.split(';')[1];
        name = name.replace('name=', '');
        showName(name);
    }
}

function showName(name){  /*显示用户名方法*/
    let nameOne = document.getElementById('user_name');
    let nameTwo = document.getElementById('user_name_1');
    nameOne.innerText = name;
    nameTwo.innerText = name;
}
$(document).ready(function() {  /*加载完执行*/
    init();
    hideSort();
    crawlerStatus();
    crawlerSeed();
    // getCookie();

    let postData = thisWeek();  /*最近七天*/
    crawlerStatistics(postData); /*提交数据*/
    postData['top_num'] = 10;
    crawlerAmount(postData);
    crawlerTable(postData);

    $('#table').DataTable({
        scrollY:"570",
        scrollX:false,
        "paging": false,//禁止分页
        "bAutoWidth": false,
        "info":false,//取消显示行数信息的功能Showing 1 to 10 of 57 entries
        "searching": false,//禁止搜索
        "ordering": false,
        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
                        leftColumns : 1
                    },
    });
});

function crawlerStatistics(getData){  /*爬虫每日数据统计*/
    $.ajax({
        url: "crawler_statistics",
        type: "GET",
        data: getData,
        dataType:"json",
        success: function (data) {
            let staData = data.list;
            let dataJson = dataStatistics(staData);
            let numChart = echarts.init(document.getElementById('chart_plot_01'),'macarons');
            numChart.setOption({
                title: {
                    text: '成功数/成功率'
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    },  /*a1:说明第一条， c1:数据第一条， 以此类推*/
                    formatter: '{a1}:{c1}<br/>{a0}:{c0}<br />{a3}:{c3}%<br/>{a2}:{c2}%',
                },
                legend: {
                    data:['下载总数','解析总数','下载成功率','解析成功率']
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false}, /*数据显示*/
                        saveAsImage : {show: true} /*下载为图片*/
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : dataJson.dateTime
                    }
                ],
                yAxis : [
                    {
                        name : '成功数',
                        type : 'value'
                    },
                    {
                        name: '成功率',
                        type : 'value',
                        axisLabel: {
                            show: true,
                            interval: 'auto',
                            formatter: '{value}%'
                        },
                        show: true
                    }
                ],
                series : [
                    {
                        name:'解析总数',
                        type:'line',
                        yAxisIndex:0,
                        data:dataJson.parseTotal
                    },
                    {
                        name:'下载总数',
                        type:'line',
                        yAxisIndex:0,
                        // label: {
                        //     normal: {
                        //         show: true,
                        //         position: 'top'
                        //     }
                        // },  /*上方提示数字，暂时关闭*/
                        data:dataJson.downloadTotal
                    },
                    {
                        name:'解析成功率',
                        type:'line',
                        yAxisIndex:1,
                        data:dataJson.parsePer
                    },
                    {
                        name:'下载成功率',
                        type:'line',
                        yAxisIndex:1,
                        data:dataJson.downloadPer
                    }
                ]
            });
        },
        error: function () {

        }
    })
}

function dataStatistics(listData){  /*处理统计数据*/
    let downloadData = []; /*下载成功数list*/
    let parseData = [];  /*解析成功数list*/
    let downloadSuc = [];  /*下载成功率list*/
    let parseSuc = [];  /*解析成功率list*/
    let dateData = [];  /*日期list*/
    let totalData = []; /*总数*/

    for (let i = 0; i < listData.length; i++){

        let parseTotal = listData[i].content_input_total - listData[i].content_download_fail_total; /*解析总数*/
        let parseSuccess = listData[i].content_success_total;  /*解析成功总数*/
        let downloadTotal = listData[i].content_input_total;  /*采集总数*/
        let downloadSuccess = parseTotal;  /*下载成功总数*/
        let dateTime = listData[i].start_time;  /*具体日期*/

        let specificDay = new Date(dateTime); /*时间格式转换*/
        let year = specificDay.getFullYear()+'年';
        let month = specificDay.getMonth()+1+'月';
        let date = specificDay.getDate()+'日';
        specificDay = year+month+date;
        if (dateData.indexOf(specificDay) > -1){  /*将同一日的数据放在一起*/
            let indexNum = dateData.indexOf(specificDay);

            let dIndex = downloadData[indexNum];
            downloadData[indexNum] = downloadSuccess + dIndex;

            let pIndex = parseData[indexNum];
            parseData[indexNum] = pIndex + parseSuccess;

            let cIndex = totalData[indexNum];
            totalData[indexNum] = cIndex + downloadTotal;

        }
        else{
            dateData.push(specificDay);
            downloadData.push(downloadTotal);
            parseData.push(parseTotal);
            totalData.push(downloadTotal);
        }

    }
    for(let index=0; index<totalData.length; index++){
        let parsePer = (parseData[index] / totalData[index]) * 100; /*解析成功率*/
        parsePer = parsePer.toFixed(1);
        parseSuc.push(parsePer);

        let downloadPer = (downloadData[index] / totalData[index]) * 100;  /*下载成功率*/
        downloadPer = downloadPer.toFixed(1);
        downloadSuc.push(downloadPer);
    }
    let allJson = {'downloadTotal':downloadData, 'downloadPer':downloadSuc,
        'parseTotal':parseData, 'parsePer':parseSuc, 'dateTime': dateData};

    return allJson
}


$('#ch-top5').click(function () {
    crawlerTop(5);
    topNum = 5;
});
$('#ch-top10').click(function () {
    crawlerTop(10);
    topNum = 10;
});
$('#ch-top20').click(function () {
    crawlerTop(20);
    topNum = 20;
});
$('#ch-top50').click(function () {
    crawlerTop(50);
    topNum = 50;
});
$('#ch-top100').click(function () {
    crawlerTop(100);
    topNum = 100;
});

function crawlerTop(num) {  /*top榜方法*/
    let timesChoice = getTime('#report-range-amount span');
    if (timeChoose === true){
        let postData = thisWeek();
        postData['top_num'] = num;
        crawlerAmount(postData);
    }else{
        let st = timesChoice[0];
        let en = timesChoice[1];
        let postData = rencentDay(st, en);
        postData['top_num'] = num;
        crawlerAmount(postData);
    }

}

function getTime(id){
    let timeText = $(id).html(); /*获取选择时间*/
    timeText = timeText.split(' - ');

    let myDate = new Date();
    let hour = myDate.getHours().toString();
    let min = myDate.getMinutes().toString();
    let sec = myDate.getSeconds().toString();

    let start = timeText[0] + ' '+hour+':'+min+':'+sec ;
    let end = timeText[1] + ' '+hour+':'+min+':'+sec;

    start = new Date(start);
    start = start.getTime();
    end = new Date(end);
    end = end.getTime();
    return [start, end];
}

$('#ch-day').click(function () {
    balanceTime = 'day';
    let chooseSort = document.getElementById('sort-menu');
    chooseSort.innerHTML = '&nbsp;'+'以天对比'+'&nbsp;';
    let en = new Date().getTime();
    let st = en - 24*60*60*1000;
    crawlerBalance(balanceTime, st, en);
});
$('#ch-week').click(function () {
   balanceTime = 'week';
   let chooseSort = document.getElementById('sort-menu');
   chooseSort.innerHTML = '&nbsp;'+'以周对比'+'&nbsp;';
   let en = new Date().getTime();
   let st = en - 7*24*60*60*1000;
   crawlerBalance(balanceTime, st, en);
});
$('#ch-month').click(function () {
    balanceTime = 'month';
    let chooseSort = document.getElementById('sort-menu');
    chooseSort.innerHTML= '&nbsp;'+'以月对比'+'&nbsp;';
    let en = new Date().getTime();
    let st = en - 30*24*60*60*1000;
    crawlerBalance(balanceTime, st, en);
});



function crawlerBalance(balance, st, en) {  /*点击传入balance参数*/
    autoSort();
    let postData = rencentDay(st, en);
    postData['balance_time'] = balance;
    crawlerTable(postData);
}

function crawlerAmount(getData) {  /*爬虫每日数据统计*/
    $.ajax({
        url: "crawler_amount",
        type: "GET",
        data: getData,
        async: true,
        dataType:"json",
        success: function (data) {
            allNum = 0;
            let dataJson = dataAmount(data);
            let perChart = echarts.init(document.getElementById('chart_plot_03'), 'macarons');
            perChart.setOption({
                title : {
                    text: '网站数据占比图',
                    subtext: '所选日期内所有占比',
                    x:'center'
                },
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: dataJson.nameData,
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        magicType : {
                            show: true,
                            type: ['pie', 'funnel']
                        },
                        saveAsImage : {show: true}
                    }
                },
                calculable : true,
                series : [
                    {
                        name:'爬取来源',
                        type:'pie',
                        radius : [30, 110],
                        center : ['50%', '50%'],
                        roseType : 'area',
                        label: {
                            normal: {
                                formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                                backgroundColor: '#eee',
                                borderColor: '#aaa',
                                borderWidth: 1,
                                borderRadius: 4,

                                rich: {
                                    a: {
                                        color: '#999',
                                        lineHeight: 22,
                                        align: 'center'
                                    },

                                    hr: {
                                        borderColor: '#aaa',
                                        width: '100%',
                                        borderWidth: 0.5,
                                        height: 0
                                    },
                                    b: {
                                        fontSize: 16,
                                        lineHeight: 33
                                    },
                                    per: {
                                        color: '#eee',
                                        backgroundColor: '#334455',
                                        padding: [2, 4],
                                        borderRadius: 2
                                    }
                                }
                            }
                        },
                        data: dataJson.numData,
                    }
                ]
            });

            let numChart = echarts.init(document.getElementById('chart_plot_04'), 'macarons');
            numChart.setOption({
                title: {
                    text: '爬取top榜',
                    subtext: '前'+topNum+'名'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: function (data) {
                        let barPer = ((data[0].value / allNum)*100).toFixed(2) + '%';
                        return data[0].name +'：'+data[0].value +'<br/>'+'总占比：'+barPer;  /*提示百分比*/
                    }
                },
                toolbox: {
                    show : true,
                    feature : {
                        mark : {show: true},
                        dataView : {show: true, readOnly: false},
                        saveAsImage : {show: true}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: dataJson.nameData.reverse()
                },
                series: [
                    {
                        type: 'bar',
                        data: dataJson.numData.reverse(),
                    },

                ]
            })
        }
    })
}

function dataAmount(amountData){  /*百分比统计数据处理*/
    let numData = [];
    let perData = [];
    let nameData = [];
    for (let webName in amountData){

        if (webName !== 'all_result'){
            let per = (amountData[webName] / amountData['all_result']) * 100;
            per = per.toFixed(1);
            per = parseFloat(per);
            perData.push({value:per, name:webName});
            numData.push({value:amountData[webName], name:webName});
            nameData.push(webName);
            allNum += amountData[webName]
        }
    }

    return {
        'numData': numData,
        'perData': perData,
        'nameData': nameData
    };
}

function crawlerTable(getData) {  /*爬虫每日数据统计*/
    $.ajax({
        url: "crawler_table",
        type: "GET",
        data: getData,
        dataType:"json",
        async:true,
        success: function (data) {
            tableJson = data;  //保留table json
            delete tableJson['all_result'];
            dataTable(data);
         }
    });

}

function dataTable(tableData) {
    $("#table tr:not(:first)").empty("");  /*清空表格内容*/
    let tbody = document.getElementById("crawler-table");  // 动态添加表格

    for (let webName in tableData){
        let tr = document.createElement("tr");

        if (webName !== 'all_result'){
            let tdCompany = document.createElement("td");
            tdCompany.innerText = webName;
            tr.appendChild(tdCompany);

            for (let item in tableData[webName]){
                let iconUp = document.createElement("i"); /*上下红绿*/
                iconUp.className = "success fa fa-long-arrow-up";

                let iconDown = document.createElement("i");
                iconDown.className = "success fa fa-long-arrow-down";

                let iconRed = document.createElement("i");
                iconRed.className = 'red';

                let iconGreen = document.createElement("i");
                iconGreen.className = 'green';

                iconRed.appendChild(iconDown);
                iconGreen.appendChild(iconUp);

                if (item !== 'content_suc'){
                    let tdCompanyData = document.createElement("td");
                    let plusMinus = tableData[webName][item].toString();
                    if(plusMinus.includes('+') || plusMinus.includes('-')){  /*indexOf 替换成includes方法   plusMinus.includes('+') || plusMinus.includes('-')*/
                        plusSplit = plusMinus.split('    ');/*增加空格间距，浏览器默认去掉连续空格*/
                        if(plusSplit[1].includes('-0.0%')||plusSplit[1].includes('+0.0%')){
                            plusSplit[1] = plusSplit[1].toString().substr(1,5);
                            console.info(plusSplit[1]);
                        }
                        let pNum = document.createElement("p");
                        let highContrast = document.createElement("span");
                        highContrast.innerText = plusSplit[0];
                        highContrast.setAttribute('style','color:black');

                        let lowContrast = document.createElement("span");
                        lowContrast.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;'+plusSplit[1];
                        pNum.appendChild(highContrast);
                        pNum.appendChild(lowContrast);

                        if(plusSplit[1].includes('+')){
                            pNum.appendChild(iconGreen);
                        }else if(plusSplit[1].includes('-')){
                            pNum.appendChild(iconRed);
                        }

                        tdCompanyData.appendChild(pNum);
                    }else{
                        let highContrast = document.createElement("span");
                        highContrast.innerText = plusMinus;
                        highContrast.setAttribute('style','color:black');
                        tdCompanyData.appendChild(highContrast);
                    }

                    tr.appendChild(tdCompanyData);
                }

            }
        }
        tbody.appendChild(tr);
    }
}


$('#download-suc').click(function () { /*下载数排序*/
    let sortParameter = 'download_suc';
    let isGrowth = false;
    let downloadSucSort = changeThead(sortParameter, isGrowth);
    dataTable(downloadSucSort);
});
$('#download-suc-growth').click(function () {  /*下载数增长率排序*/
    let sortParameter = 'download_suc';
    let isGrowth = true;
    let downloadSucPerSort = changeThead(sortParameter, isGrowth);
    dataTable(downloadSucPerSort);
});
$('#parse-suc').click(function () {  /*解析成功数排序*/
    let sortParameter = 'parse_suc';
    let isGrowth = false;
    let parseSucSort = changeThead(sortParameter, isGrowth);
    dataTable(parseSucSort);
});
$('#parse-suc-growth').click(function () {  /*解析成功书增长率排序*/
    let sortParameter = 'parse_suc';
    let isGrowth = true;
    let parsePerSort = changeThead(sortParameter, isGrowth);
    dataTable(parsePerSort);
});
$('#storage-suc').click(function () {  /*存储成功数排序*/
    let sortParameter = 'storage_suc';
    let isGrowth = false;
    let storageSucSort = changeThead(sortParameter, isGrowth);
    dataTable(storageSucSort);
});
$('#storage-suc-growth').click(function () {  /*存储成功数增长率排序*/
    let sortParameter = 'storage_suc';
    let isGrowth = true;
    let storagePerSort = changeThead(sortParameter, isGrowth);
    dataTable(storagePerSort);
});
$('#download-per-per').click(function () {  /*下载成功率排序*/
    let sortParameter = 'download_per';
    let isGrowth = false;
    let downloadPerSort = changeThead(sortParameter, isGrowth);
    dataTable(downloadPerSort);
});
$('#download-per-growth').click(function () {  /*下载成功率增长率排序*/
    let sortParameter = 'download_per';
    let isGrowth = true;
    let downloadPerPerSort = changeThead(sortParameter, isGrowth);
    dataTable(downloadPerPerSort);
});
$('#parse-per-per').click(function () {  /*解析成功率排序*/
    let sortParameter = 'parse_per';
    let isGrowth = false;
    let parsePerSort = changeThead(sortParameter, isGrowth);
    dataTable(parsePerSort);
});
$('#parse-per-growth').click(function () {  /*解析成功率增长率排序*/
    let sortParameter = 'parse_per';
    let isGrowth = true;
    let parsePerPerSort = changeThead(sortParameter, isGrowth);
    dataTable(parsePerPerSort);
});
$('#storage-per-per').click(function () {  /*存储成功率排序*/
    let sortParameter = 'storage_per';
    let isGrowth = false;
    let storagePerSort = changeThead(sortParameter, isGrowth);
    dataTable(storagePerSort);
});
$('#storage-per-growth').click(function () {  /*存储成功率增长率排序*/
    let sortParameter = 'storage_per';
    let isGrowth = true;
    let storagePerPerSort = changeThead(sortParameter, isGrowth);
    dataTable(storagePerPerSort);
});
function changeThead(sortItem, isGrowth) { /*对选择列进行排序*/
    upOrDown();
    let download = [];
    let resultDict = {};
    let companyDict = {};
    let nameDict = {};

    if (sortItem.includes('suc')){ /*已suc结尾的参数排序*/
        resultDict = numberParameter(resultDict, download, companyDict, nameDict, sortItem, isGrowth);

    }else { /*以per结尾的参数排序*/
        resultDict = perParameter(resultDict, download, companyDict, nameDict, sortItem, isGrowth);
    }
    return resultDict
}

function numberParameter(resultDict, download, companyDict, nameDict, sortItem, isGrowth) {  /*整数类型数据填充*/
    if (isGrowth === false){
        for (let item in tableJson){ /*填入数据*/
            let num = tableJson[item][sortItem];

            if (num >= 0){
                download.push(num);
            }else{
                if(typeof num === 'string'){
                    if(num.indexOf('    ') >=0){
                        download.push(parseInt(num.split('    ')[0]))
                    }
                }
            }
            companyDict[download.length] = tableJson[item];
            nameDict[download.length] = item;
        }
        resultDict = sortParameter(download, companyDict, nameDict, resultDict);
    }else{
        let useless = {};
        for (let item in tableJson){ /*填入数据*/
            let num = tableJson[item][sortItem];
            if(typeof num === 'number'){ /*没有增长率的就不参与排序*/
                useless[item] = tableJson[item];
            }else{
                num = num.split('   ');
                if (num.length > 1){  /*百分比数据为空，则默认为0*/
                    num = parseParameter(num[1].replace('%',''));
                }else{
                    num = 0
                }

                download.push(num);
                companyDict[download.length] = tableJson[item];
                nameDict[download.length] = item;
            }
        }
        resultDict = sortParameter(download, companyDict, nameDict, resultDict);
        for (let uselessCompany in useless){
            resultDict[uselessCompany] = useless[uselessCompany];
        }
    }
    return resultDict;
}

function perParameter(resultDict, download, companyDict, nameDict, sortItem, isGrowth) { /*百分比类型数据填充*/
    if(isGrowth === false){
        for (let item in tableJson){ /*填入数据*/
            let num = tableJson[item][sortItem];
            if (typeof num=== 'string'){
                if (num.indexOf('    ')>=0){
                 num = parseParameter(num.split('    ')[0]);
                }else{
                    num = parseParameter(num);
                }
            }
            download.push(num);
            companyDict[download.length] = tableJson[item];
            nameDict[download.length] = item;
        }
        resultDict = sortParameter(download, companyDict, nameDict, resultDict);
    }else{
        let useless = {};
        for (let item in tableJson){ /*填入数据*/
            let num = tableJson[item][sortItem];
            if(num.length < 9){ /*没有增长率的就不参与排序*/
                useless[item] = tableJson[item];
            }else{
                num = num.split('   ');
                num = parseParameter(num[1].replace('%',''));
                download.push(num);
                companyDict[download.length] = tableJson[item];
                nameDict[download.length] = item;
            }
        }
        resultDict = sortParameter(download, companyDict, nameDict, resultDict);
        for (let uselessCompany in useless){
            resultDict[uselessCompany] = useless[uselessCompany];
        }
    }
    return resultDict;
}

function parseParameter(floatParameter) { /*string to float*/
    let transferFloat = parseFloat(floatParameter.replace('%',''));
    return transferFloat
}

function sortParameter(download, companyDict, nameDict, resultDict) {
    for(let i=0; i< download.length -1; i++){ /*快速排序 number类*/

        for(let j=i+1; j<download.length; j++){

            if (upDown===true){
                if(download[i] < download[j]){
                    let bigOne = download[i];
                    download[i] = download[j];
                    download[j] = bigOne;

                    let bigCompany = companyDict[i+1];
                    companyDict[i+1] = companyDict[j+1];
                    companyDict[j+1] = bigCompany;

                    let bigName = nameDict[i+1];
                    nameDict[i+1] = nameDict[j+1];
                    nameDict[j+1] = bigName
                }
            }else{
                if(download[i] > download[j]){
                    let bigOne = download[i];
                    download[i] = download[j];
                    download[j] = bigOne;

                    let bigCompany = companyDict[i+1];
                    companyDict[i+1] = companyDict[j+1];
                    companyDict[j+1] = bigCompany;

                    let bigName = nameDict[i+1];
                    nameDict[i+1] = nameDict[j+1];
                    nameDict[j+1] = bigName
                }
            }

        }
    }
    for(let index=0; index< download.length; index++){ /*组装参数*/
        resultDict[nameDict[index+1]] = companyDict[index+1]
    }
    return resultDict;
}

