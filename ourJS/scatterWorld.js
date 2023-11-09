// 经纬度数据
var dataLatLng =await d3.csv("./data/terrorismNum-LatLng.csv", function(d) {
    return {
        name: d.city, // use new Date(+d.Year, 0, 1) to convert "year" to Date
        latitude: d.latitude,
        longitude: d.longitude,
        num:d.num
    };
});
setTimeout(()=>{

    var request = new XMLHttpRequest();
    var dataByCountryAsia
    request.open("get","./data/terrorismNum-CountryYear-Asia.json");
    request.send(null);
    request.responseType = "json";
    request.onload = function(){
        dataByCountryAsia=request.response

        drawCountriesLine(dataByCountryAsia)
        drawChinaLine(dataByCountryAsia)
    }

// 创建投影函数
    var projection = d3.geoMercator()
        .center([100, 35]) // 地图中心点的经纬度
        .scale(300) // 缩放比例
        .translate([400, 300]); // 画布中心点的坐标

// 创建路径生成器
    var path = d3.geoPath()
        .projection(projection);

// 创建SVG容器
    var scatterWorld = d3.select("#scatter-map")
        .attr("viewBox", "0 0 800 600")
        .attr("transform", "translate(100, 0) scale(1)");
// 加载地图数据
    d3.json("./data/custom.geo.json").then(
        function(asia) {
            // 绘制地图路径
            scatterWorld.selectAll("path")
                .data(asia.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#e0e0e0")
                .attr("stroke", "#777");
            // 绘制散点
            scatterWorld.selectAll("circle")
                .data(dataLatLng)
                .enter()
                .append("circle")
                .attr("cx", function(d) { return projection([d.longitude, d.latitude])[0]; })
                .attr("cy", function(d) { return projection([d.longitude, d.latitude])[1]; })
                .attr("r", 0.25)
                .attr("fill", "maroon");
        }).catch(function(error) {
        console.log(error);
    });
},3000);

var drawCountriesLine=function(data){
    let margin=30,marginTop=15
    let max=4500
    let height=200
    let width=400
    var padding = {top : 10 , right : 5 , bottom : 10 , left : 10};
    var xScale = d3.scaleLinear()                                  //定义一个比例尺
        .domain([1970,2021])                              //设定x轴的值域
        .range([0,width-padding.left - padding.right])  //设定x轴的定义域
    var yScale = d3.scaleLinear()                                  //定义一个比例尺
        .domain([0,max])                         //设定y轴的值域
        .range([height-padding.top-padding.bottom,0])   //设定y轴的定义域

    let line = d3.line()
        .x(function(d){return xScale(d.x)})
        .y(function(d){
            return yScale(d.y)
        })
    let asiaCountries= [
        "Armenia",
        "Azerbaijan",
        "Bahrain",
        "Bangladesh",
        "Bhutan",
        "Brunei",
        "Cambodia",
        "Cyprus",
        "East Timor",
        "Georgia",
        "India",
        "Indonesia",
        "Iran",
        "Israel",
        "Japan",
        "Jordan",
        "Kazakhstan",
        "Kuwait",
        "Kyrgyzstan",
        "Laos",
        "Lebanon",
        "Malaysia",
        "Maldives",
        "Myanmar",
        "Nepal",
        "North Korea",
        "Philippines",
        "Qatar",
        "Saudi Arabia",
        "Singapore",
        "South Korea",
        "Sri Lanka",
        "Syria",
        "China-Taiwan",
        "Tajikistan",
        "Thailand",
        "Turkey",
        "Turkmenistan",
        "United Arab Emirates",
        "Uzbekistan",
        "Vietnam",
        "Yemen",
        "Afghanistan",
        "Iraq",
        "Pakistan",
        'Palestine',
        "China",
    ]

    let LinePlot=d3
        .select("#aisa-countries-line")
        .append("svg")
        .attr("width",500)
        .attr("height", 220);

    const xAxis = d3.axisBottom(xScale).tickValues([1970,1980,1990,2000,2010,2020]) ;
    const yAxis = d3.axisLeft(yScale).tickValues([500,1500,2500,3500,4500]).tickFormat(d=>String(d)) ;

    LinePlot.append('g').attr('class','x-axis').attr('transform',function(){
        return `translate(${margin+5}, ${ height-4 })`
    }).call(xAxis);
    LinePlot.append('g').attr('class','y-axis').attr('transform',function(){
        return `translate(${margin+5}, ${ 15})`
    }).call(yAxis);
    //添加path
    for(let i=0;i<asiaCountries.length;i++){
        let country_name=asiaCountries[i]
        let lineColor= "grey",opacity=0.5
        switch (country_name){
            case 'China':
                lineColor='maroon'
                opacity=1
                break;
            case 'India':
                lineColor='steelblue'
                opacity=1
                break;
            case 'Afghanistan':
                lineColor='green'
                opacity=1
                break;
            case 'Iraq':
                lineColor='Orange'
                opacity=1
                break;
            case 'Philippines':
                lineColor='red'
                opacity=1
                break;
            case 'Pakistan':
                lineColor='purple'
                opacity=1
                break;
            // case 'Syria':
            //     lineColor='purple'
            //     opacity=1
            //     break;
        }

        let tmp_data=data[country_name].map(data=>({x:data[0],y:data[1]}))
        LinePlot.append('path')
            .datum(tmp_data)
            .attr('class','line')
            .attr('d',line)
            .attr('stroke',lineColor)
            //.attr('stroke-dasharray', '5')
            .attr('fill', 'none')
            .attr('stroke-width',2)
            .attr('transform', `translate(${margin+5}, ${marginTop})`)
            .attr('opacity',opacity)
    }

    LinePlot.append("circle").attr("cx",80).attr("cy",20).attr("r", 3).style("fill", "maroon")
    LinePlot.append("circle").attr("cx",80).attr("cy",80).attr("r", 3).style("fill", "steelblue")
    LinePlot.append("circle").attr("cx",80).attr("cy",40).attr("r", 3).style("fill", "green")
    LinePlot.append("circle").attr("cx",80).attr("cy",100).attr("r", 3).style("fill", "orange")
    LinePlot.append("circle").attr("cx",80).attr("cy",60).attr("r", 3).style("fill", "red")
    LinePlot.append("circle").attr("cx",80).attr("cy",120).attr("r", 3).style("fill", "purple")
    LinePlot.append("text").attr("x", 100).attr("y", 20).text("China").style("font-size", "12px").attr("alignment-baseline","middle")
    LinePlot.append("text").attr("x", 100).attr("y", 80).text("India").style("font-size", "12px").attr("alignment-baseline","middle")
    LinePlot.append("text").attr("x", 100).attr("y", 40).text("Afghanistan").style("font-size", "12px").attr("alignment-baseline","middle")
    LinePlot.append("text").attr("x", 100).attr("y", 100).text("Iraq").style("font-size", "12px").attr("alignment-baseline","middle")
    LinePlot.append("text").attr("x", 100).attr("y", 60).text("Philippines").style("font-size", "12px").attr("alignment-baseline","middle")
    LinePlot.append("text").attr("x", 100).attr("y", 120).text("Pakistan").style("font-size", "12px").attr("alignment-baseline","middle")
}
var drawChinaLine=function(data){
    let margin=30,marginTop=15
    //tooltip右侧文字部分
    //tooltip左侧图片部分
    let max=70
    let height=200
    let width=400
    var padding = {top : 10 , right : 5 , bottom : 10 , left : 10};
    var xScale = d3.scaleLinear()                                  //定义一个比例尺
        .domain([1970,2021])                              //设定x轴的值域
        .range([0,width-padding.left - padding.right])  //设定x轴的定义域
    var yScale = d3.scaleLinear()                                  //定义一个比例尺
        .domain([0,max])                         //设定y轴的值域
        .range([height-padding.top-padding.bottom,0])   //设定y轴的定义域

    let line = d3.line()
        .x(function(d){return xScale(d.x)})
        .y(function(d){
            return yScale(d.y)
        })

    let LinePlot=d3
        .select("#china-line")
        .append("svg")
        .attr("width",500)
        .attr("height", 220);

    const xAxis = d3.axisBottom(xScale).tickValues([1970,1980,1990,2000,2010,2020]) ;
    const yAxis = d3.axisLeft(yScale).tickValues([0,10,20,30,40,50,60,70]).tickFormat(d=>String(d)) ;

    LinePlot.append('g').attr('class','x-axis').attr('transform',function(){
        return `translate(${margin+5}, ${ height-4 })`
    }).call(xAxis);
    LinePlot.append('g').attr('class','y-axis').attr('transform',function(){
        return `translate(${margin+5}, ${ 15})`
    }).call(yAxis);
    //添加path
    let country_name='China'
    let lineColor= "grey",opacity=0.5

    let tmp_data=data[country_name].map(data=>({x:data[0],y:data[1]}))
    LinePlot.append('path')
        .datum(tmp_data)
        .attr('class','line')
        .attr('d',line)
        .attr('stroke','maroon')
        //.attr('stroke-dasharray', '5')
        .attr('fill', 'none')
        .attr('stroke-width',2)
        .attr('transform', `translate(${margin+5}, ${marginTop})`)
        .attr('opacity',1)
    console.log(data[country_name])
    LinePlot.selectAll('.text')
        .data(tmp_data)
        .enter()
        .append('text')
        .attr('class','text')
        .attr('x',d=>xScale(d.x))
        .attr('y',d=>yScale(d.y))
        .text(d=> d.y>15? d.y: "")
        .attr('transform', `translate(${margin+5}, ${marginTop})`)

}



