		
		
		var margin = {
		    top: 60.5,
		    right: 40.5,
		    bottom: 70.5,
		    left: 60.5
		};

		var width = 1140 - margin.left - margin.right,
		    height = 500 - margin.top - margin.bottom;

		var axis_height = 500;

		var projection = d3.geo.mercator()
		    .scale((1 << 12) / 2 / Math.PI)
		    .translate([width / 2, height / 2])
		    .scale(1 / 2 / Math.PI)
		    .translate([0, 0]);

		var center = [-150, 70]; //projection([-10, 70]);

		var map = d3.select("#map")
		    .on("mousemove", mousemoved);
		    
	    var svg = d3.select("#map").append("svg")
		        .attr("width", width)
		        .attr("height", height)
		        .on("click", add_node)

		var info = map.append("div")
		    .attr("class", "info")
		    .attr("width","109px")
			.attr("height","17px");
			
		//For future use with zooming	
		var zoom = d3.behavior.zoom()
		    .scale(projection.scale() * 2 * Math.PI)
		    .scaleExtent([1 << 5, 1 << 17])
		    .translate([width - center[0], height - center[1]])   

		//Variable to store index of path currently being edited
		var curr_path = 0;

		//Variable to store branch info (no/distance)
		var branches = [];

		//Assign unique node_no for each new node;
		var node_counter = -1;

		//index of which is the active node, set to -1 for no active node (i.e new path)
		var active_node = -1;

		//index of starting node of main branch, defaults to first node created
		// (can be modified by user)
		var start_node = 0;

		//index of last node of main_branch, defaults to last one of first branch created 
		// (can be modified by user). 
		var end_node = -1;

		//Vector node info 
		var nodes = [];

		//Vars to store node and path handles (svg components)  for the individual paths
		var node_handles = [];
		var path_handles = [];
		
		 var path_tolerance = 20; //user changeable (add slider or something) 

		//Axis scales 
		var x = d3.scale.linear()
		    .range([20, width]);

		var y = d3.scale.linear()
			    .range([axis_height, 0]);

		//Variables to store individual y_scales for each branch 
		var y_scales = [];


		//Line function that applies x and y scales to the inputs x and y attributes
		var line_function = d3.svg.line()
		    .x(function(d) {
		        return x(d.x);
		    })
		    .y(function(d) {
		        return y(d.y);
		    })
		    
		//Line function that returns x and y attributes of nodes
	    var newlineFunction = d3.svg.line()
	        .x(function(d) {
	            return nodes[d].x;
	        })
	        .y(function(d) {
	            return nodes[d].y;
	        })
	        .interpolate("cardinal");

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks(1)
		    //.tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });


		/* Color Scales used for Demo Datasets */

		/* Temperature Color Scale */
		var color = d3.scale.linear()
		    .domain([8, 6, 4, 2, 1, 0, -1, -1.2, -1.5, -1.7, -2])
		    .range(["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"])

	  /* Salinity  Color Scale */
		var color2 = d3.scale.linear()
			.domain([27.5, 29, 30, 31, 32, 33.5])
		    .range(["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"])


		// set projection
		var projection = d3.geo.mercator();

		//To store data
		var user_data = [];
		
		//Set callback functions for buttons and dropdown menus 
		
		//Apply Pathway Button
	    d3.select("#apply_path").on("click", function() {
	        if (branches.length < 1)
	            return
	        apply_pathway();
	    });
		
		//Dropdown menu for Y Axis
	    d3.select("#select_y_axis").on("change", function() {
	        if (this.value < 1) {
	
	            //Find domain of data (user definable)
	            data_min = user_data.reduce(function(p, v) {
	                if (v.depth < p) return v.depth;
	                return p;
	            }, 1000000);
	
	            data_max = user_data.reduce(function(p, v) {
	                if (v.depth > p) return v.depth;
	                return p;
	            }, -1000000);
	
	            selected_var = 0;
	            apply_pathway();
	            return;
	        }
	
	        //Find domain of data (user definable)
	        data_max = user_data.reduce(function(p, v) {
	            if (v.value < p) return v.value;
	            return p;
	        }, 1000000);
	
	        data_min = user_data.reduce(function(p, v) {
	            if (v.value > p) return v.value;
	            return p;
	        }, -1000000);
	
	
	        selected_var = 1;
	        apply_pathway();
	
	
	    });
	
		//Dropdown menu for Color Axis
		 d3.select("#select_color_axis").on("change", function() {
	       
	        data_nodes = d3.selectAll(".data_node")
	            .data(user_data.filter(function(d) {
	                return d.selected
	            }));
	
	
	        data_nodes.transition()
	            .duration(500).ease("sin-in-out")
	              .attr("fill", function(d) {
					  if (this.value < 1) 
	                return color(d.value) //heatmap(c(d.value));
	                return color2(d.sal)
	            })
	            
	          data_nodes2 = d3.selectAll(".data_node")
	            .data(user_data);
	
	
	        data_nodes2.transition()
	            .duration(500).ease("sin-in-out")
	              .attr("fill", function(d) {
					  if (this.value < 1) 
	                return color(d.value) //heatmap(c(d.value));
	                return color2(d.sal)
	            })
	        		      
	
	    });


		//Function that processes data after it is loaded by d3.json upon page load			
		function render_page(){
		    /* 	    map.call(zoom); */
		
		    //Find domain of data (user definable)
		    value_min = user_data.reduce(function(p, v) {
		        if (v.value < p) return v.value;
		        return p;
		    }, 1000000);

		    value_max = user_data.reduce(function(p, v) {
		        if (v.value > p) return v.value;
		        return p;
		    }, -1000000);

			
			sal_min = user_data.reduce(function(p, v) {
		        if (v.sal < p) return v.sal;
		        return p;
		    }, 1000000);

		   sal_max = user_data.reduce(function(p, v) {
		        if (v.sal > p) return v.sal;
		        return p;
		    }, -1000000);


		    selected_depth = 0;
		    selected_var = 0;

		    // Calculate mean lat and lon values for this dataset
		    var mean_lat = user_data.reduce(function(p, v) {
		        return p + v.lat;
		    }, 0) / user_data.length;
		    var mean_lon = user_data.reduce(function(p, v) {
		        return p + v.lon;
		    }, 0) / user_data.length;

		    // set projection parameters
		    projection
		        .scale(1500)
		        .center([mean_lon+2, mean_lat-.6])

		    // create path variable
		    var path = d3.geo.path()
		        .projection(projection);

		    var graticule = d3.geo.graticule();

		    var g = svg.append("g")

		    g.append("path")
		        .datum(graticule.outline)
		        .attr("class", "background")
		        .attr("d", path);

		    g.append("g")
		        .attr("class", "graticule")
		        .selectAll("path")
		        .data(graticule.lines)
		        .enter().append("path")
		        .attr("d", path);

		    g.insert("path", ".graticule")
		        .datum(topojson.mesh(worldtopo, worldtopo.objects.countries, function(a, b) {
		            return a.id !== b.id;
		        }))
		        .attr("class", "boundary")
		        .attr("d", path);

		    g.insert("path", ".graticule")
		        .datum(topojson.object(worldtopo, worldtopo.objects.land))
		        .attr("class", "land")
		        .attr("d", path);

		    pathgroup = g.append("g")
		        .attr("id", "pathgroup")


			//Option to use a subset of the data by depth	
		    slice_user_data = user_data.filter(function(d) {
		        return d.depth == selected_depth
		    });

		    //Find domain of data (user definable)
		    data_min = user_data.reduce(function(p, v) {
		        if (v.depth < p) return v.depth;
		        return p;
		    }, 1000000);

		    data_max = user_data.reduce(function(p, v) {
		        if (v.depth > p) return v.depth;
		        return p;
		    }, -1000000);

		    /* 		console.log(data_max,data_min); */

		    //add marker to map, later used to link paths and map view

		    marker = g.append('circle')
		        .attr("class", "marker")
		        .attr('cx', -30)
		        .attr('cy', -30)
		        .attr("r", 8)



		    // add circles to svg
		    g.selectAll("circle")
		        .data(slice_user_data).enter()
		        .append("circle")
		        .attr("class", 'data_node')
		        .on("click", function(d, i) {
		            console.log(d.dist2path, d.selected);
		            if (d3.select(this).classed("selected_node")) {
		                user_data[i].selected = false;
		                d3.select(this)
		                    .classed("selected_node", false)
		                    .classed("unselected_node", true)
		                    .attr("r", "4px")
		            } else {
		                user_data[i].selected = true;
		                d3.select(this)
		                    .classed("selected_node", true)
		                    .classed("unselected_node", false)
		                    .attr("r", "6px")

		            }
		            d3.event.stopPropagation();
		        })
		        .attr("cx", function(d) {
		            return projection([d.lon, d.lat])[0];
		        })
		        .attr("cy", function(d) {
		            return projection([d.lon, d.lat])[1];
		        })
		        .attr("r", "6px")
		        .attr("fill", function(d) {
		            return color(d.value); //heatmap(c(d.value));
		        })

	    

		    //Bottom Plot Setup
		    axes = d3.select(".container").append("svg")
		        .attr("width", width + margin.right)
		        //.attr("height", height + margin.top + margin.bottom)
		        .attr("height", axis_height + margin.top + margin.bottom)
		        .append("g")
		        .attr("transform", "translate(20," + margin.top + ")");

		    /*
	    	 		 axes.append("g")
	    	        .attr("class", "axis axis--y")
	    	        .attr("transform", "translate(-15,0)")
	    	        .call(yAxis);
	    */


		    axes.append("g")
		        .attr("class", "axis axis--x")
		        .attr("transform", "translate(0," + (axis_height + 10) + ")")
		        .call(xAxis);

		    axes.append("text") // text label for the x axis
		        .attr("transform", "translate(" + (width / 2) + " ," + (axis_height + margin.bottom / 1.2) + ")")
		        .style("text-anchor", "middle")
		        .text("Along Track Distance");


		  

		   
		    
};