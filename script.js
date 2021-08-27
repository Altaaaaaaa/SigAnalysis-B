// D3로 그래프 그리기

let count = 0;
$.ajax({
  url: "./data/TableMat_Sig0.csv",
  dataType: "text",
}).done(successFunction);

$.ajax({
  url: "./data/TableMat_Sig1.csv",
  dataType: "text",
}).done(successFunction);

$.ajax({
  url: "./data/NewMat_S1_Sig2.csv",
  dataType: "text",
}).done(successFunction);

$.ajax({
  url: "./data/NewMat_S2_Sig0.csv",
  dataType: "text",
}).done(successFunction);

$.ajax({
  url: "./data/NewMat_S2_Sig1.csv",
  dataType: "text",
}).done(successFunction);

$.ajax({
  url: "./data/NewMat_S2_Sig2.csv",
  dataType: "text",
}).done(successFunction);

function successFunction(data) {
  var allRows = data.split(/\r?\n|\r/);
  var table = '<table frame="void" width="500px">';
  for (var singleRow = 0; singleRow < allRows.length - 1; singleRow++) {
    if (singleRow === 0) {
      table += "<thead>";
      table += '<tr class="fixed1">';
      table += "<th></th>";
      table += '<th colspan="5">Mutation count</th>';
      table += '<th colspan="5">DESeq Fold Change</th>';
      table += '<th colspan="2"></th>';
      table += "</tr>";
      table += '<tr class="fixed2">';
    } else {
      table += "<tr>";
    }
    var rowCells = allRows[singleRow].split(",");
    for (var rowCell = 1; rowCell < rowCells.length; rowCell++) {
      if (singleRow === 0) {
        table += "<th>";
        table += rowCells[rowCell];
        table += "</th>";
      } else {
        table += "<td>";
        table += rowCells[rowCell];
        table += "</td>";
      }
    }
    if (singleRow === 0) {
      table += "</tr>";
      table += "</thead>";
      table += "<tbody>";
    } else {
      table += "</tr>";
    }
  }
  table += "</tbody>";
  table += "</table>";
  $(`.table${count}`).append(table);
  count++;
}

// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 , gleft: 60},
  width = 480 - margin.left - margin.right,
  height = 420 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg0 = d3
  .select("#my_dataviz0")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

var svg1 = d3
  .select("#my_dataviz1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

var svg2 = d3
  .select("#my_dataviz2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

var svg_0 = d3
  .select("#my_dataviz_0")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

var svg_1 = d3
  .select("#my_dataviz_1")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

var svg_2 = d3
  .select("#my_dataviz_2")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.gleft + "," + margin.top + ")");

drawPlot("./data/NewMat_S1_Sig0_data.csv", svg0);
drawPlot("./data/NewMat_S1_Sig1_data.csv", svg1);
drawPlot("./data/NewMat_S1_Sig2_data.csv", svg2);
drawPlot("./data/NewMat_S2_Sig0_data.csv", svg_0);
drawPlot("./data/NewMat_S2_Sig1_data.csv", svg_1);
drawPlot("./data/NewMat_S2_Sig2_data.csv", svg_2);

function drawPlot(name, svg) {
  d3.csv(name, function (data) {
    // console.log(data);
    // List of groups (here I have one group per column)
    var allGroup = ["mutation", "DESeq"];

    //DESeq.domain(d3.extent(data, function(d){ console.log(d); console.log(data); return d.DESeq}));
    //mutation.domain(d3.extent(data, function(d){ return d.mutation}));

    // Reformat the data: we need an array of arrays of {x, y} tuples
    var dataReady = allGroup.map(function (grpName) {
      // .map allows to do something for each element of the list
      return {
        name: grpName,
        values: data.map(function (d) {
          return {value: +d[grpName] };
        }),
      };
    });
     console.log(dataReady);
    // I strongly advise to have a look to dataReady with
    mergeData1 = [];
    mergeData2 = [];
    dataReady[0].values.map((d) => mergeData1.push(d.value));
    dataReady[1].values.map((d) => mergeData2.push(d.value));

    maxValue1 = Math.max.apply(null, mergeData1);
    minValue1 = Math.min.apply(null, mergeData1);
    maxValue2 = Math.max.apply(null, mergeData2);
    minValue2 = Math.min.apply(null, mergeData2);

    // A color scale: one color for each group
    var myColor = d3
      .scaleOrdinal()
      .range(d3.schemePastel1);

    /*var myColor2 = d3
      .scaleOrdinal()
      .domain(allGroup)
      .range([d3.schemeCategory10[0], d3.schemeCategory10[4]]);*/

    // Add X axis --> it is a date format
    var x = d3
      .scaleLinear()
      .domain([minValue1 - 1, maxValue1 + 1])
      .range([0, width])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .style("font-size", 12)

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)).style("font-size", 13);

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([minValue2 - 1, maxValue2 + 1])
      .range([height, 0])
    svg.append("g")
      .call(d3.axisLeft(y))
      .style("font-size", 12)

    // Add X axis label:
    svg.append("text")
      .attr('class', 'axis-label')
      .attr("x", width + margin.left)
      .attr("y", height + 20)
      .style('text-anchor', 'middle')
      .text("mutation");

    // Y axis label:
    svg.append("text")
      .attr('class', 'axis-label')
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left - 10)
      .attr("x", - height/2 + margin.bottom)
      .style('text-anchor', 'middle')
      .text("DESeq");

    // Add the points
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.mutation); } )
          .attr("cy", function (d) { return y(d.DESeq); } )
          .attr('fill', myColor(2))
          .attr('fill-opacity', 0.5)
          .attr("r", 5)
          .attr("stroke", "white");
    
    //  see below for an explanation of the calcLinear function
    var lg = calcLinear(data, "mutation", "DESeq", d3.min(data, function(d){ return d.mutation}), d3.min(data, function(d){ return d.DESeq}));
    
    // linear regression line
    svg.append("line")
        .attr("class", "regression")
        .attr("x1", x(lg.ptA.x))
        .attr("y1", y(lg.ptA.y))
        .attr("x2", x(lg.ptB.x))
        .attr("y2", y(lg.ptB.y));
    /*var svg = d3.legendColor()
      .scale(myColor)
      .shape("circle")*/
  });

  // Calculate a linear regression from the data

  // Takes 5 parameters:
  // (1) Your data
  // (2) The column of data plotted on your x-axis
  // (3) The column of data plotted on your y-axis
  // (4) The minimum value of your x-axis
  // (5) The minimum value of your y-axis

  // Returns an object with two points, where each point is an object with an x and y coordinate

  function calcLinear(data, x, y, minX, minY){
    /////////
    //SLOPE//
    /////////

    // Let n = the number of data points
    var n = data.length;

    // Get just the points
    var pts = [];
    data.forEach(function(d,i){
      var obj = {};
      obj.x = d[x];
      obj.y = d[y];
      obj.mult = obj.x*obj.y;
      pts.push(obj);
    });

    // Let a equal n times the summation of all x-values multiplied by their corresponding y-values
    // Let b equal the sum of all x-values times the sum of all y-values
    // Let c equal n times the sum of all squared x-values
    // Let d equal the squared sum of all x-values
    var sum = 0;
    var xSum = 0;
    var ySum = 0;
    var sumSq = 0;
    pts.forEach(function(pt){
      sum = sum + pt.mult;
      xSum = xSum + pt.x;
      ySum = ySum + pt.y;
      sumSq = sumSq + (pt.x * pt.x);
    });
    var a = sum * n;
    var b = xSum * ySum;
    var c = sumSq * n;
    var d = xSum * xSum;

    // Plug the values that you calculated for a, b, c, and d into the following equation to calculate the slope
    // slope = m = (a - b) / (c - d)
    var m = (a - b) / (c - d);

    /////////////
    //INTERCEPT//
    /////////////

    // Let e equal the sum of all y-values
    var e = ySum;

    // Let f equal the slope times the sum of all x-values
    var f = m * xSum;

    // Plug the values you have calculated for e and f into the following equation for the y-intercept
    // y-intercept = b = (e - f) / n
    var b = (e - f) / n;

    // Print the equation below the chart
    document.getElementsByClassName("equation")[0].innerHTML = "y = " + m + "x + " + b;
    document.getElementsByClassName("equation")[1].innerHTML = "x = ( y - " + b + " ) / " + m;

    // return an object of two points
    // each point is an object with an x and y coordinate
    return {
      ptA : {
        x: minX,
        y: m * minX + b
      },
      ptB : {
        y: minY,
        x: (minY - b) / m
      }
    }

  }
}

function Show_hidden(e){
  var menu = new Array("tab-x","tab-1","tab-2","tab-3"); // 객체 배열로 지정
  for(var i=0;i < menu.length;i++){
   if("tab-"+e==menu[i]){
    document.all[menu[i]].style.display="block";
   }else{
    document.all[menu[i]].style.display="none";
   }
  }
 }  

// 기존 버튼형 슬라이더
$('.slider-1 > .page-btns > div').click(function(){
    var $this = $(this);
    var index = $this.index();
    
    $this.addClass('active');
    $this.siblings('.active').removeClass('active');
    
    var $slider = $this.parent().parent();
    
    var $current = $slider.find(' > .slides > div.active');
    var $current2 = $slider.find(' > .figure-ex > div.active');

    var $post = $slider.find(' > .slides > div').eq(index);
    var $post2 = $slider.find(' > .figure-ex > div').eq(index);
    
    $current.removeClass('active');
    $current2.removeClass('active');
    $post.addClass('active');
    $post2.addClass('active');
});

// 좌/우 버튼 추가 슬라이더
$('.slider-1 > .side-btns > div').click(function(){
    var $this = $(this);
    var $slider = $this.closest('.slider-1');
    
    var index = $this.index();
    var isLeft = index == 0;
    
    var $current = $slider.find(' > .page-btns > div.active');
    var $post;
    
    if ( isLeft ){
        $post = $current.prev();
    }
    else {
        $post = $current.next();
    };

    if ( $post.length == 0 ){
        if ( isLeft ){
            $post = $slider.find(' > .page-btns > div:last-child');
        }
        else {
            $post = $slider.find(' > .page-btns > div:first-child');
        }
    };
    
    $post.click();
});

//figure 설명
/*$('.slider-1 > .figure-ex').click(function(){
    var $this = $(this);
    var index = $this.index();
    
    $this.addClass('active');
    $this.siblings('.active').removeClass('active');
    
    var $slider = $this.parent().parent();
    
    var $current = $slider.find(' > .slides > div.active');
    
    var $post = $slider.find(' > .slides > div').eq(index);
    
    $current.removeClass('active');
    $post.addClass('active');
});*/