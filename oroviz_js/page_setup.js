//Setup Map and Scatter Plot divs
var margin = {
        top: 40,
        right: 120,
        bottom: 100,
        left: 120
    },
    width = $(window).width() - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;



//Variables to store data to be accessed by functions outside the load function

var all_data; //All original data as loaded in 
var map_data; //Data filtered geographically
var data; //Data after all filters (geographic and with range sliders) have been applied 

var selected_data_points = [];

var branch_no = -1;
var max_dist = 0;

branch_level = -1;

var mainStyle, otherstyle, selectedStyle;

//Variables to store individual y_scales for each branch 
var y_scales = [];

//pathway width 
var dist_threshold = 100;

var format = new ol.format.GeoJSON();

//Tooltip for points on scatter plot
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return " <strong>CS137:</strong> <span style='color:red'>" + d.cs137 + "</span> </br>" +
            "<strong>CS134:</strong> <span style='color:red'>" + d.cs134 + "</span> </br>" +
            "<strong>Cruise:</strong> <span style='color:red'>" + d.cruise + "</span> </br>" +
            "<strong>Temp:</strong> <span style='color:red'>" + d.temp + "</span> </br>" +
            "<strong>Sal:</strong> <span style='color:red'>" + d.sal + "</span> </br>" +
            "<strong>Source:</strong> <span style='color:red'>" + d.source + "</span> </br>" +
            "<strong>Date:</strong> <span style='color:red'>" + d.date.toDateString() + "</span> ";
    })

//Add tooltip to Map
var map_tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
    

//Set up colors for color encoding in scatter plot and map
var brewer_colors = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"];


// Deafult accessor functions 
var xValue = function(d) {
        //return d.date.valueOf();
        return d.along_track_distance;
    }; 
    
var yValue = function(d) {
        return d.cs137;
    };    

var cValue = function(d) {
       return d.cs137;
    }; 
 
// Scales    
var xScale = d3.scale.linear()
    .range([0, width]);       
    
var yScale = d3.scale.pow()
	.exponent(.5)
	.range([height, 0]); 
	
	
var branch_yScale = d3.scale.linear()
	.range([height, 0]);

//map each color to a value between 0 and 1 (to enable both linear and logarithmic color coding) 
var cScale = d3.scale.quantize()
    .range(brewer_colors)
    .domain([0, 1]); 

//Inverse log scale to map values to a value betweeen 0 and 1    
var lin_logscale = d3.scale.pow()
	.exponent(.2)
    .range([1, 0])

    
//Map data to pixels/color on relevant scale
var xMap = function(d) {
        return xScale(xValue(d));
    };
    
var yMap = function(d) {
        return yScale(yValue(d));
    }
   
var cMap = function(d) {
    return cScale(lin_logscale(d))
}
 
 var featureOverlay;   

//Create axis objects    
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

//Axis for grid lines on scatter plot
var grid_axis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

//Line function for branch level yscale
var branch_line_function = d3.svg.line()
    .x(function(d) {
        return xScale(d.x);
    })
    .y(function(d) {
        return branch_yScale(d.y);
    })


//Set radius of markers to 0 when there is no value for chosen attribute 
var map_radius = function(d) {
    if (cValue(d)) return 5;
    else return 0
};
var scatter_radius = function(d) {
    if (yValue(d)) return 5;
    else return 0
};



// add the scatter svg to the body of the webpage
var scatterplot = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

scatterplot.call(tip);

// add the tooltip 
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)


//Legend for scatter colorbar
var legend, legend_box;

