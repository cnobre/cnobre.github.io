		
		
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
		
		/*
var scale = 1500; 
		var circle_size = 6; 
*/


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
/* 		    .domain([8, 6, 4, 2, 1, 0, -1, -1.2, -1.5, -1.7, -2]) */
		    .domain([-2, -1.7,-1.5, -1.2, -1, 0, 1, 2, 4, 6, 8]) 
		   /*  .range(["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"]) */
		    .range(["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#f7f7f7", "#fddbc7", "#f4a582", "#d6604d" , "#b2182b", "#67001f"])

	  /* Salinity  Color Scale */
		var color2 = d3.scale.linear()
			.domain([27.5, 29, 30, 31, 32, 33.5])
		    .range(["#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"])

	// Distance color scale for debugging dist2path		
	     var distcolor =   d3.scale.linear()
			.domain([0, 30])
		    .range(["white", "blue"])	

		var colorbar = Colorbar()
		    .origin([15,60])
		    .scale(color)
		    .orient("horizontal")
		    .thickness(10)
		    .barlength(width)
		
		placeholder = "#cmap"
		
		var colorbarObject = d3.select(placeholder)
		    .call(colorbar)


		// set projection
		var projection = d3.geo.mercator();

		//To store data
		var user_data = [];
		
		depth_range = [0,30];
		selected_var = 0;



		
		//Set callback functions for buttons and dropdown menus 
		
		//Dropdown menu for Y Axis
	    d3.select("#select_y_axis").on("change", function() {
	        if (this.value == 0) {
	
	           data_range = get_min_max(user_data,'depth');
	           selected_var = 0;
	            
	        }
	
			if (this.value == 1) {
		        data_range = get_min_max(user_data,'value');		
		        selected_var = 1;
	        }
	        
    		if (this.value == 2) {
		        data_range = get_min_max(user_data,'sal');		
		
		        selected_var = 2;
	        }
	        
	        
	        
	        apply_pathway();
	
	
	    });
	    
			
		//Dropdown menu for Dataset Option
		 d3.select("#select_dataset").on("change", function() {
		 
		 return;
			 
			 if (this.value == 0) {
			 
			 			//Default to cruise dataset
			user_data = cruise_data;
			scale = 1500;
			circle_size = 6;
			
  			//Once data is loaded, render page
			render_page();
			
			 }
			  if (this.value == 1) {
			  
			  			//Default to cruise dataset
			user_data = gridded_data;
			
			scale =300;
			circle_size = 4;
			
  			//Once data is loaded, render page
			render_page();
			 }
			 
			 
			 		     	
	    });
	    

		//Dropdown menu for Color Axis
		 d3.select("#select_color_axis").on("change", function() {
			 apply_color_scale()		     	
	    });
	    
	    