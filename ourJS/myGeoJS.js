//张恺部分
Array.prototype.minY = function () {
    let min = this[0].y;
    let len = this.length;
    for (let i = 1; i < len; i++) {
        if (this[i].y < min) min = this[i].y
    }
    return min
}
Array.prototype.maxY = function () {
    let max = this[0].y;
    let len = this.length;
    for (let i = 1; i < len; i++) {
        if (this[i].y > max) max = this[i].y
    }
    return max
}
var entries =await d3.csv("./data/terrorismNum-CountryYear.csv", function(d) {
    return {
        year: +d.year, // use new Date(+d.Year, 0, 1) to convert "year" to Date
        entity: d.country,
        num: +d.num
    };
});
var countries=await d3.json("./data/world.geojson")
const world = await d3.json("./data/110m.json");
setTimeout(()=>{
    var data = new Map([...d3.rollup(entries, v => d3.sum(v, d => d.num), d => d.year, d => d.entity)])
    var arrayObj=Array.from(data);
    arrayObj.sort(function(a,b){return a[0]-b[0]})
    var data = new Map(arrayObj.map(i => [i[0], i[1]]));

    var years=Array.from(data,d=>d[0])
    var width = 1600
    var colorScaleWidth=500,colorScalePadding=50
    var height = 700
    var myColorScaleData=[NaN,1,10, 50, 100, 500,1000,5000]
    var myColorScaleDataWithoutNan=[1,10, 50, 100, 500,1000,5000]
    const colorScale = d3.scaleThreshold()
        .domain(myColorScaleDataWithoutNan)
        .range(['#efdfdf','#dfbfbf','#cf9f9f','#c08080', '#b06060', '#a04040', '#902020','#800000'])
        .unknown('#ccc');

    var myNumScaleX=d3.scaleBand().domain(d3.range(myColorScaleData.length)).range([0,colorScaleWidth-colorScalePadding])
    let svg1=d3.select('#my-color-scale').attr('style:width',colorScaleWidth).attr('height',50)
    svg1.selectAll('rect')
        .data(myColorScaleData)
        .enter()
        .append('rect')
        .transition()
        .attr('width',(colorScaleWidth-colorScalePadding)/8)
        .attr('height',15)
        .attr("transform", "translate(10, 0)")
        .attr('x',(d,i)=>myNumScaleX(i))
        .attr('y',10)
        .attr('fill',d => colorScale(d))
    var myScaleX=d3.scaleThreshold()
        .domain(myColorScaleData)
        .range(Array.from([0,1,2,3,4,5,6,7,8],v =>(450/8*v)))
    var xAxis=d3.axisBottom(myScaleX)
    svg1.append('g')
        .attr('class','axis')
        .attr('transform','translate(10,25)')
        .call(xAxis)


    var projection = d3.geoEqualEarth()
    var path = d3.geoPath(projection)
    var outline = ({type: "Sphere"})


    var subLinePlot=d3
        .select(".tooltip-plot")
        .append("svg")
        .attr("width", 150)
        .attr("height", 60);
    var request = new XMLHttpRequest();
    var dataByCountry,country_name;
    var drawLinePlot=function(country_name,data,isFirstTime=false){
        let margin=30,marginTop=15
        d3.select(".tooltip-head").text(country_name)
        try{
            let tmp_data=data[country_name].map(data=>({x:data[0],y:data[1]}))
            //tooltip右侧文字部分
            let terroristNum=dataByCountry[country_name][user.preYear-1970][1]
            d3.select(".tooltip-explanation .content-main")
                .html(terroristNum+" terrorist attacks happened in <span style='color:black'>"+user.preYear+"</span>" )
                .style('color',()=>{
                    if(colorScale(terroristNum)=='#fee5d9'){
                        return 'grey'
                    }else{
                        return(colorScale(terroristNum))
                    }
                })

            //tooltip左侧图片部分
            let max=tmp_data.maxY()
            let height=40
            let width=120
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
                }).curve(d3.curveCardinal)
            if(!isFirstTime){
                subLinePlot.remove()
                subLinePlot=d3
                    .select(".tooltip-plot")
                    .append("svg")
                    .attr("width", 150)
                    .attr("height", 60);
            }
            const xAxis = d3.axisBottom(xScale).ticks(0).tickValues([1970,2021]).tickFormat(d=>String(d)) ;
            const yAxis = d3.axisLeft(yScale).ticks(0).tickValues([0,max]).tickFormat(d=>String(d)) ;

            subLinePlot.append('g').attr('class','x-axis').attr('transform',function(){
                return `translate(${margin}, ${ height-4 })`
            }).call(xAxis);
            subLinePlot.append('g').attr('class','y-axis').attr('transform',function(){
                return `translate(${margin+7}, ${ 15})`
            }).call(yAxis);
            //添加path
            subLinePlot.append("linearGradient")
                .attr("id", "line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", 0)
                .attr("y1", yScale(0))
                .attr("x2", 0)
                .attr("y2", yScale(3934))
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "#dbb6b6"},
                    {offset: "5%", color: "#c99292"},
                    {offset: "10%", color: "#b66d6d"},
                    {offset: "20%", color: "#a44949"},
                    {offset: "40%", color: "#922424"},
                    {offset: "100%", color: "#800000"},
                ])
                .enter().append("stop")
                .attr("offset", function(d) { return d.offset; })
                .attr("stop-color", function(d) { return d.color; });

            subLinePlot.append('path')
                .datum(tmp_data)
                .attr('class','line')
                .attr('d',line)
                .attr('stroke',"url(#line-gradient)")
                .attr('fill', 'none')
                .attr('stroke-width',3)
                .attr('transform', `translate(${margin}, ${marginTop})`)
            //参考线
            subLinePlot.append('path')
                .datum([{x:1970,y:max},{x:2021,y:max}])
                .attr('class','line')
                .attr('d',line)
                .attr('stroke', 'rgba(42,50,55,0.47)')
                .attr('stroke-dasharray', '2')
                .attr('fill', 'none')
                .attr('stroke-width',1)
                .attr('transform', `translate(${margin}, ${marginTop})`)
            //点
            subLinePlot.append('circle')
                .attr('cx',xScale(tmp_data[user.preYear-1970].x))
                .attr('cy',yScale(tmp_data[user.preYear-1970].y))
                .attr('r',3.5)
                .attr('fill','url(#line-gradient)')
                .attr('stroke','maroon')
                .attr('stroke-width','0.8px')
                .attr('transform', `translate(${margin}, ${marginTop})`)
            return true;
        }
        catch (e) {
            subLinePlot.remove()
            d3.select(".tooltip-explanation .content-main")
                .text('')

            d3.select(".tooltip-explanation .content-plain")
                .text("" )
        }

    }
    request.open("get","./data/terrorismNum-CountryYear.json");
    request.send(null);
    request.responseType = "json";
    request.onload = function(){
        dataByCountry=request.response
        country_name='USA'
        drawLinePlot(country_name,dataByCountry,true)
    }
    var tooltip = d3.select(".tooltip").attr("opacity",0);

    let mouseOver = function(d,i) {
        d3.selectAll(".country")
            .transition()
            .duration(0)
            .style("opacity", .8)
        d3.select(this)
            .transition()
            .duration(0)
            .style("stroke", "black")
            .style("stroke-width", 0.1)
        country_name = i.properties.name;
        //这里获取鼠标坐标
        var p = d3.pointer(d);
        tooltip
            //设置显示位置
            .style("left",(d3.select('#choropleth-map').node().getBoundingClientRect().left+p[0])+"px")
            //要注意顶部距离，如果遮盖住了鼠标就会导致无法选中路径，此处设置了正右侧显示
            .style("top", (1400+p[1] )+"px")
            //设置为可见
            .style("opacity",1.0)
            .style('z-index',10)
        d3.select(".tooltip-head").text(country_name)
        drawLinePlot(country_name,dataByCountry)

    }
    let mouseLeave = function(d) {
        d3.selectAll(".country")
            .transition()
            .duration(0)
            .style("opacity", 1)
        d3.select(this)
            .transition()
            .duration(0)
            .style("stroke", "transparent")
            .style("stroke-width", 0.5)
        tooltip.style("opacity",0.0).style('z-index',-200)
        ;
    }
    var worldmap = function (preYear){
        var yearData=data.get(preYear)
        var svg = d3.select("#my-dataviz")
            .style("display", "block")
            .attr("viewBox", "0 0 960 480")
            .attr("transform", "translate(0, 20) scale(1)"); // move down, make bigger

        var defs = svg.append("defs");

        // set up outline, clipping and background of map
        defs.append("path")
            .attr("id", "outline")
            .attr("d", path(outline));

        defs.append("clipPath")
            .attr("id", "clip")
            .append("use")
            .attr("xlink:href", new URL("#outline", location));

        const g = svg.append("g")
            .attr("clip-path", `url(${new URL("#clip", location)})`);

        g.append("use")
            .attr("xlink:href", new URL("#outline", location))
            .attr("fill", "white");

        // fill entities according to values
        g.append("g")
            .selectAll("path")
            .data(countries.features)
            .join("path")
            // .attr('class','country')
            .filter(function(d) { return d.properties.name != "Antarctica"; })
            .attr("fill", d => colorScale(yearData.get(d.properties.name)))
            .on("mouseover", mouseOver )
            .on("mouseleave", mouseLeave )
            .attr("d", path)
            // tooltip
            .append("title")
            .text(d => `${d.properties.name} ${yearData.has(d.properties.name) ? yearData.get(d.properties.name) : "N/A"}`);

        g.append("path")
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "#470909")
            .style("stroke-width", 0.5)
            .attr("stroke-linejoin", "round")
            .attr("d", path);
        // draw borders

        return svg.node();
    }
    const handler = {
        get: function(target, attribute){
            return attribute in target ? target[attribute] : 'no prop!'
        },
        set: function(target, prop, value, receiver) {
            target[prop] = value;
            worldmap(user.preYear)
            try{
                subLinePlot.remove()
                let max=dataByCountry[country_name].maxY
                let margin=30,marginTop=15,height=40,width=120
                var padding = {top : 10 , right : 5 , bottom : 10 , left : 10};
                var xScale = d3.scaleLinear()                                  //定义一个比例尺
                    .domain([1970,2021])                              //设定x轴的值域
                    .range([0,width-padding.left - padding.right])  //设定x轴的定义域
                var yScale = d3.scaleLinear()                                  //定义一个比例尺
                    .domain([0,max])                         //设定y轴的值域
                    .range([height-padding.top-padding.bottom,0])
                subLinePlot.append('circle')
                    .attr('cx',xScale(dataByCountry[country_name][user.preYear-1970].x))
                    .attr('cy',yScale(dataByCountry[country_name][user.preYear-1970].y))
                    .attr('r',3.5)
                    .attr('fill','url(#line-gradient)')
                    .attr('stroke','white')
                    .attr('stroke-width','0.5px')
                    .attr('transform', `translate(${margin}, ${marginTop})`)
            }catch (e) {
                console.log(e)
            }
            return true;
        }
    };
    var user = new Proxy({}, handler)
    user.preYear = 1970

    worldmap(user.preYear)
    var sliderSimple = d3
        .sliderBottom()
        .min(d3.min(years))
        .max(d3.max(years))
        .width(800)
        .ticks(5)
        .default(1970)
        .step(1)
        .handle(d3.symbol().type(d3.symbolCircle).size(200)())
        .on('onchange', val => {
            user.preYear=val;
            d3.select("#map-title")
                .html( "&nbsp&nbsp"+val+' 年全球各国遭受恐怖袭击的次数');

        });
    var gSimple = d3
        .select('div#slider-simple')
        .append('svg')
        .attr('width', 900)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(40,30)');
    gSimple.call(sliderSimple);
    function sleep(delay) {
        var start = (new Date()).getTime();
        while((new Date()).getTime() - start < delay) {
            continue;
        }
    }
    var isMoving=false
    d3.select('.icon-play').on('click',()=>{
        if(isMoving===true){
            console.log('case1')
        }
        else if (user.preYear!=2021){
            isMoving=true
            console.log('case2')
            for(let i=user.preYear;i<=2021;i++){
                setTimeout(()=>{
                    sliderSimple.value(i)
                },500*(i-1970))
            }
            setTimeout(()=>{
                isMoving=false
            },500*(2022-1970))
        }
        else{
            isMoving=true
            user.preYear=1970
            console.log('case3')
            for(let i=user.preYear;i<=2021;i++){
                setTimeout(()=>{
                    sliderSimple.value(i)
                },500*(i-1970))
            }
            setTimeout(()=>{
                isMoving=false
            },500*(2022-1970))
        }
        console.log('finish')
    })

},500)



