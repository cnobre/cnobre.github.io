//CREATE SCATTER PLOT 
function create_scatter() {

    //Create padding for the x and y axis on the scatter plot
    var xbuffer = (d3.max(data, xValue) - d3.min(data, xValue)) / 10;
    var ybuffer = (d3.max(data, yValue) - d3.min(data, yValue)) / 10;

    //Set Domains for the x an y scales

    xScale.domain([d3.min(data, xValue) - xbuffer, d3.max(data, xValue) + xbuffer]);
    yScale.domain([d3.min(data, yValue) - ybuffer, d3.max(data, yValue) + ybuffer]);


    // x-axis
    scatterplot.append("g")
        .attr("class", "x axis ")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width / 2)
        .attr("y", 50)
        .style("text-anchor", "end")
        .text("Along Track Distance (km)")
        .attr("class", "xlabel");

    // y-axis
    scatterplot.append("g")
/*         .attr("class", "y axis") */
/*         .call(yAxis) */
        .append("text")
        .attr("transform", "rotate(-90)")
        //.attr("y", 0 – margin.left)
        .attr("x", 0 - (height / 2))
        .attr("y", -90)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("cs137 (decay corrected)")
        .attr("class", "ylabel");


    /*
//Grid lines for scatter plot	
    scatterplot.append("g")
        .attr("class", "y axis grid")
        .call(grid_axis
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )
        .attr("opacity", .2)
        .attr("stroke", "lightgrey")
*/




    // draw legend
    legend = scatterplot.append("g")
        .attr("transform", "translate(100,100)")

    legend_box = scatterplot.append("g");


};


   /*
 d3.select('#slider4').call(d3.slider()
        .axis(d3.svg.axis().orient("bottom"))
        .min(depth_range[0])
        .max(depth_range[1])
        .value(depth_range)
        .orientation("horizontal")
        .on("slide", function(evt, value) {
            d3.select('#slider4textmin').text(Math.round(value[0]));
            d3.select('#slider4textmax').text(Math.round(value[1]));

            selectedFeatures.clear();
            map_data = all_data;

            data = map_data.filter(function(el) {
                return el.prs >= +d3.select('#slider4textmin').text() && el.prs <= +d3.select('#slider4textmax').text() && el.date >= new Date(d3.select('#slider3textmin').text()) && el.date <= new Date(d3.select('#slider3textmax').text())

            });

			//calculate_distances();
            //update();

        }))
*/

/*
    d3.select('#slider3').call(d3.slider()
        .axis(d3.svg.axis().orient("bottom").ticks(5))
        .scale(tScale)
        .min(time_range[0])
        .max(time_range[1])
        .value(time_range)
        .orientation("horizontal")
        .on("slide", function(evt, value) {
            d3.select('#slider3textmin').text(new Date(value[0]).toDateString());
            d3.select('#slider3textmax').text(new Date(value[1]).toDateString());

            selectedFeatures.clear();
            map_data = all_data;

            data = map_data.filter(function(el) {
                return el.prs >= +d3.select('#slider4textmin').text() && el.prs <= +d3.select('#slider4textmax').text() && el.date >= new Date(d3.select('#slider3textmin').text()) && el.date <= new Date(d3.select('#slider3textmax').text())

            });

			//calculate_distances();
            //update();


        }))
*/


 var overlayStyle = (function() {
    return function(feature, resolution) {
  	console.log(sketch.getId())
    if (sketch.getId() === 0) {
    	console.log('main branch style');
      return someStyle;
    } else {
      return otherStyle;
    }
  };
}())



    
    var overlayStyle2 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })

    

