Array.prototype.maxNum = function () {
    let max = this[0].num;
    let len = this.length;
    for (let i = 1; i < len; i++) {
        if (this[i].num > max) max = this[i].num
    }
    return max
}
Array.prototype.maxDeath= function () {
    let max = this[0][1];
    let len = this.length;
    for (let i = 1; i < len; i++) {
        if (this[i][1] > max) max = this[i][1]
    }
    return max
}
Array.prototype.maxWound= function () {
    let max = this[0][1];
    let len = this.length;
    for (let i = 1; i < len; i++) {
        if (this[i][1] > max) max = this[i][1]
    }
    return max
}
// 示例数据
var groupsAttackRegions={'Taliban': ['South Asia', 12934],
    'ISIS': ['Middle East & North Africa', 8240],
    'Shining Path (SL)': ['South America', 4566],
    'Al-Shabaab': ['Sub-Saharan Africa', 4547],
    'Houthi extremists (Ansar Allah)': ['Middle East & North Africa', 3516],
    'Boko Haram': ['Sub-Saharan Africa', 3459],
    "New People's Army (NPA)": ['Southeast Asia', 3439],
    'Farabundo Marti National Liberation Front (FMLN)': ['Central America & Caribbean',
        3351],
    'Irish Republican Army (IRA)': ['Western Europe', 2667],
    'Revolutionary Armed Forces of Colombia (FARC)': ['South America', 2487],
    "Kurdistan Workers' Party (PKK)": ['Middle East & North Africa', 2431],
    'Maoists': ['South Asia', 2159],
    'Communist Party of India - Maoist (CPI-Maoist)': ['South Asia', 2113],
    'Basque Fatherland and Freedom (ETA)': ['Western Europe', 2022],
    'National Liberation Army of Colombia (ELN)': ['South America', 1842],
    'Liberation Tigers of Tamil Eelam (LTTE)': ['South Asia', 1600],
    'Tehrik-i-Taliban Pakistan (TTP)': ['South Asia', 1508],
    'Fulani extremists': ['Sub-Saharan Africa', 1280],
    'Nicaraguan Resistance': ['Central America & Caribbean', 1125],
    'Al-Qaida in the Arabian Peninsula (AQAP)': ['Middle East & North Africa',
        1117],
    'Khorasan Chapter of the Islamic State': ['South Asia', 663],
    "Lord's Resistance Army (LRA)": ['Sub-Saharan Africa', 341],
    'Al-Nusrah Front': ['Middle East & North Africa', 276],
    'Hutu extremists': ['Sub-Saharan Africa', 167],
    'Al-Qaida': ['South Asia', 40]}
var request = new XMLHttpRequest();
var dataTop20,lastID,lastGroup
setTimeout(()=>{
    request.open("get","./data/terrorismNum-top20groups.json");
    request.send(null);
    request.responseType = "json";
    request.onload = function(){
        var dataTop20=request.response
        let groups=Object.getOwnPropertyNames(dataTop20)
        let curGroup=groups[22]
        var container = d3.select("#small-charts-container");
        let maxNums=get3Characters(dataTop20,groups)

        var elements = container.selectAll("svg")
            .data(groups)
            .enter()
            .append("svg")
            .attr('class','small-chart')
            .attr('group',d=>d)
        elements.on("click", function(d) {
            curGroup=(d3.select(this).attr("group")); // 将属性值作为参数传递
            drawChart(dataTop20[curGroup],maxNums,curGroup,group2Id)

        });
        var group2Id={}
        console.log(group2Id)

        d3.selectAll('.small-chart')
            .data(d3.range(groups.length)) // 根据需求指定需要创建的元素数量
            .attr("id", function(d) { return "chart-" + d; }) // 分配
        for (let i=0;i<groups.length;i++){
            let preId="chart-"+i
            let curGroup=groups[i]
            group2Id[curGroup]=preId
            let tmpData=dataTop20[curGroup]
            drawSmallChart(tmpData,maxNums,preId,curGroup)
        }
        drawChart(dataTop20[curGroup],maxNums,curGroup,group2Id)
    }
},5000)

var drawChart=function(data,maxNums,curGroup,group2Id){
    let deathMax=Math.ceil(maxNums.deathMax/1000)*1000
    let woundMax=Math.ceil(maxNums.woundMax/1000)*1000
    let eventMax=Math.ceil(maxNums.eventMax/50)*50
    let deaths=[],wounds=[],i=0,deathAll=0,eventAll=0,woundAll=0
    for(let year=1970;year<2022;year++){
        let deathCurrentYear=0
        let woundCurrentYear=0
        for(let month=1;month<13;month++){
            let nevent=data[i].num
            deathCurrentYear+=data[i].nkill
            woundCurrentYear+=data[i].nwound
            eventAll+=nevent
            i+=1
        }
        deathAll+=deathCurrentYear
        woundAll+=woundCurrentYear
        deaths.push([year,deathCurrentYear])
        wounds.push([year,woundCurrentYear])
    }
    d3.select('#group-name').html(curGroup)
    d3.select('#event-num .exact-number').text(eventAll)
    d3.select('#death-num .exact-number').text(deathAll)
    d3.select('#wound-num .exact-number').text(woundAll)
    d3.select('#group-attack-region').text("主要袭击地区："+groupsAttackRegions[curGroup][0])
    d3.select('#group-attack-region-num').text("次数："+groupsAttackRegions[curGroup][1])
    // 改变选中的小图字颜色
    let curId=group2Id[curGroup]
    d3.select("#"+curId+" g text")
        .text(curGroup.split(' ')[0])
        .style('font-size','20')
        .style('fill','maroon')
    d3.select("#"+lastID+" g text")
        .text(lastGroup)
        .style('font-size','10')
        .style('fill','black')
    lastID=curId
    lastGroup=curGroup


// 设置图表尺寸和边距
    var width = 330,height = 620,squaresHeight=200;
    var margin = {top: 10, right: 20, bottom: 10, left: 15};
    var chartWidth = width - margin.left - margin.right;
    var chartHeight = height - margin.top - margin.bottom;
    var squareTranslation={x:0,y:(height-squaresHeight)/2}

// 创建一个SVG容器
    var svg = d3.select("#myChart")
        .attr("width", width)
        .attr("height", height);

    d3.select("#myGroupChart").remove()
// 创建一个图表组
    var chart = svg.append("g").attr('id','myGroupChart')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 提取年份和月份
    var years = d3.range(1970, 2022);
    var months = d3.range(1, 13);

// 计算每个正方形的尺寸
    var squareSize = Math.min(chartWidth / years.length, squaresHeight / months.length);

// 设置颜色比例尺
    let myColorScaleData=[0,10,50,100,eventMax]
    var colorScale = d3.scaleLinear()
        .domain(myColorScaleData)
        .range(["#f2eae0", "#d6b0a8","#b97570","#9d3b38","#800000"]);
    var deathScale = d3.scaleLinear()
        .domain([0,deathMax])
        .range([0,(height-squaresHeight)/2]);
    var woundScale = d3.scaleLinear()
        .domain([0,woundMax])
        .range([0,(height-squaresHeight)/2]);
    //绘制条形图1
    var bars = chart.selectAll(".bar4")
        .data(deaths)
        .enter()
        .append("rect")
        .attr("class", "bar4")
        .attr("x", function(d) {
            return (d[0] - years[0]) * squareSize; })
        .attr("width", squareSize)
        .attr("height", function(d) { return deathScale(d[1]); })
        .attr('fill','rgba(107,104,93,0)')

        .attr("y", d=>squareTranslation.y-deathScale(d[1]) )
        .transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr('fill','#6b685d')

    //绘制条形图2
    var bars2 = chart.selectAll(".bar5")
        .data(wounds)
        .enter()
        .append("rect")
        .attr("class", "bar5")
        .attr("x", function(d) {
            return (d[0] - years[0]) * squareSize; })
        .attr("width", squareSize)
        .attr("y", d=>squareTranslation.y+squareSize*12 )
        .attr("height", function(d) { return woundScale(d[1]); })
        .attr('fill','rgba(209,142,53,0)')

        .transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr('fill','#d18e35')

// 绘制正方形
    var squares = chart.selectAll(".square")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("transform", "translate(" + margin.left + "," + squareTranslation.y + ")")
        .attr("x", function(d) { return (d.year - years[0]) * squareSize; })
        .attr("y", function(d) { return (d.month - 1) * squareSize; })
        .attr("width", squareSize)
        .attr("height", squareSize)
        .style("fill", 'rgba(255,255,255,0)' )
        .attr('stroke',function(d) { return colorScale(d.num); })
        .attr('stroke-width',1)
        .transition()
        .duration(500)
        .delay(function(d, i) { return Math.floor((i+1)/12) ; })
        .style("fill", function(d) { return colorScale(d.num); })
    //画图例

    var svg = d3.select("#legend");

    var legend = svg.selectAll(".legend-item")
        .data(myColorScaleData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function(d, i) { return "translate(10," + (i * 10) + ")"; });

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d) { return colorScale(d); });

    legend.append("text")
        .attr("x", 20)
        .attr("y", 8)
        .text(function(d) { return d; })
        .attr('font-size','10')
        .attr('font-weight','bold');
// x\y axis
    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + squareTranslation.y + ")")
        .call(d3.axisTop().scale(d3.scaleLinear()
            .domain([years[0], years[years.length - 1]])
            .range([0, chartWidth]))
            .tickValues([1970,1980,1990,2000,2010,2020])
            .tickFormat(d3.format("d")))
        .append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Year")
        .attr('font-size',12)
    let translate2=parseFloat(squareTranslation.y)+parseFloat(squareSize*12)
    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + translate2  + ")")
        .call(d3.axisBottom().scale(d3.scaleLinear()
            .domain([years[0], years[years.length - 1]])
            .range([0, chartWidth]))
            .tickValues([1970,1980,1990,2000,2010,2020])
            .tickFormat(d3.format("d")))


    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + squareTranslation.y + ")")
        .call(d3.axisLeft().scale(d3.scaleLinear()
            .domain([months[0], months[months.length - 1]])
            .range([0, 12*squareSize]))
            .tickValues([1,12])
            .tickFormat(function(d) {
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[d - 1];
        })
        )
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -6*squareSize)
        .attr("y", -15)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Month")
        .attr('font-size',12);

    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(d3.axisRight()
            .scale(d3.scaleLinear()
                .domain([0,deathMax])
                .range([(height-squaresHeight)/2,0]))
            .ticks(1)
            .tickValues([deathMax])
        )

    chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + translate2 + ")")
        .call(d3.axisRight()
            .scale(woundScale)
            .ticks(1)
            .tickValues([woundMax])
        )



}

var drawSmallChart=function(data,maxNums,chartElementId,curGroup){
    let deathMax=maxNums.deathMax,woundMax=maxNums.woundMax,eventMax=maxNums.eventMax
    let deaths=[],wounds=[],i=0

    for(let year=1970;year<2022;year++){
        let deathCurrentYear=0
        let woundCurrentYear=0
        for(let month=1;month<13;month++){
            deathCurrentYear+=data[i].nkill
            woundCurrentYear+=data[i].nwound
            i+=1
        }
        deaths.push([year,deathCurrentYear])
        wounds.push([year,woundCurrentYear])
    }
// 设置图表尺寸和边距
    var width = 150,height = 140,squaresHeight=60;
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    var chartWidth = width - margin.left - margin.right;
    var chartHeight = height - margin.top - margin.bottom;
    var squareTranslation={x:0,y:(height-squaresHeight)/2}

// 创建一个SVG容器
    var svg = d3.select("#"+chartElementId)
        .attr("width", width)
        .attr("height", height);

// 创建一个图表组
    var chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 提取年份和月份
    var years = d3.range(1970, 2022);
    var months = d3.range(1, 13);

// 计算每个正方形的尺寸
    var squareSize = Math.min(chartWidth / years.length, squaresHeight / months.length);
// 设置颜色比例尺
    let myColorScaleData=[0,10,50,100,eventMax]
    var colorScale = d3.scaleLinear()
        .domain(myColorScaleData)
        .range(["#f2eae0", "#d6b0a8","#b97570","#9d3b38","#800000"]);
    var deathScale = d3.scaleLinear()
        .domain([0,deathMax])
        .range([0,(height-squaresHeight)/2]);
    var woundScale = d3.scaleLinear()
        .domain([0,woundMax])
        .range([0,(height-squaresHeight)/2]);
    //绘制条形图1
    var bars = chart.selectAll(".bar4")
        .data(deaths)
        .enter()
        .append("rect")
        .attr("class", "bar4")
        .attr("x", function(d) {
            return (d[0] - years[0]) * squareSize; })
        .attr("width", squareSize)
        .attr('fill','#6b685d')
        // .attr("y", 0)
        // .attr("height", 0)
        // .transition()
        // .duration(500)
        // .delay(function(d, i) { return i * 10; })
        .attr("y", d=>squareTranslation.y-deathScale(d[1]) )
        .attr("height", function(d) { return deathScale(d[1]); });

    //绘制条形图2
    var bars2 = chart.selectAll(".bar5")
        .data(wounds)
        .enter()
        .append("rect")
        .attr("class", "bar5")
        .attr("x", function(d) {
            return (d[0] - years[0]) * squareSize; })
        .attr("width", squareSize)
        .attr('fill','#d18e35')
        // .attr("y", 0)
        // .attr("height", 0)
        // .transition()
        // .duration(500)
        // .delay(function(d, i) { return i * 10; })
        .attr("y", d=>squareTranslation.y+squareSize*12 )
        .attr("height", function(d) { return woundScale(d[1]); });


// 绘制正方形
    var squares = chart.selectAll(".square")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("transform", "translate(0," + squareTranslation.y + ")")
        .attr("x", function(d) { return (d.year - years[0]) * squareSize; })
        .attr("y", function(d) { return (d.month - 1) * squareSize; })
        .attr("width", squareSize)
        .attr("height", squareSize)
        .style("fill", function(d) { return colorScale(d.num); })
        .attr('stroke',function(d) { return colorScale(d.num); })
        .attr('stroke-width',1);

    chart.append("text").attr("x", 0).attr("y", squareTranslation.y+squareSize*15).text(curGroup).style("font-size", "10px").attr("alignment-baseline","middle")

}

var get3Characters=function (data,groups){
    console.log('data',data)
    let deathMax=0,woundMax=0, eventMax=0
    for(let i=0;i<groups.length;i++){
        let groupName=groups[i],curData=data[groupName]
        let deaths=[],wounds=[],j=0
        for(let year=1970;year<2022;year++){
            let deathCurrentYear=0
            let woundCurrentYear=0
            for(let month=1;month<13;month++){
                deathCurrentYear+=curData[j].nkill
                woundCurrentYear+=curData[j].nwound
                j+=1
            }
            deaths.push([year,deathCurrentYear])
            wounds.push([year,woundCurrentYear])
        }
        let preDeathMax=deaths.maxDeath(),preWoundMax=wounds.maxWound(),preEventMax=curData.maxNum();
        deathMax=preDeathMax>deathMax ? preDeathMax : deathMax;
        woundMax=preWoundMax>woundMax ? preWoundMax : woundMax;
        eventMax=preEventMax>eventMax ? preEventMax : eventMax;
    }
    return {"deathMax":deathMax,"woundMax":woundMax,"eventMax":eventMax}
}

var changeCurGroup=function (curGroup){
    console.log(curGroup)
}

