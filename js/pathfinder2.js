
	
	
	d3.json("scatter_temp.json", function(error, data) {
	

		
	    var margin = {
	        top: 60.5,
	        right: 40.5,
	        bottom: 50.5,
	        left: 60.5
	    };

	    var width = 1140 - margin.left - margin.right,
	        height = 500 - margin.top - margin.bottom;

	    var axis_height = 300;

	    var sc = Math.min(width, height) * 1


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

	    //Axis Variables 
	    var x = d3.scale.linear()
	        .range([20, width]);

	    var y = d3.scale.linear()
	        .range([axis_height, 0]);

	    //Variables to store individual y_scales for each branch 
	    var y_scales = [];


		var line_function = d3.svg.line()
	            .x(function(d) {
	                return x(d.x);
	            })
	            .y(function(d) {
	                return y(d.y);
	            })

	    var xAxis = d3.svg.axis()
	        .scale(x)
	        .orient("bottom");

	    var yAxis = d3.svg.axis()
	        .scale(y)
	        .orient("left")
	        .ticks(1)
	        //.tickFormat(function(d) { return "e" + formatPower(Math.round(Math.log(d))); });

	    //Non linear color scale
	   /*
 var color = d3.scale.linear()
	        .domain([-1.9, -1.75, -1.7, -1.65, -1.6, -1.4, -1.2, -1, -0.8, -0.4, 0, 1, 1.5, 2, 4, 6, 8])
	        .range(["#b02d9c", "#8c2a9d", "#3c259d", "#188ffb", "#22bcfb", "#27dcfc", "#7bf88b", "#b8f854", "#f5f937", "#fdda31", "#feae2b", "#fb9025", "#fb6620", "#e72518", "#9e160d", "#3b0402"]);

*/
	    // set projection
	    var projection = d3.geo.mercator();

	    //To store user inputed data
	    var user_data = [];
	    
	    
	    
		 data.lon.map(function(d, i) {
		 
		 
	    
user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i],
	            "depth": 0,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	        user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i] * 0.7,
	            "depth": 20,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	        user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i] * 0.5,
	            "depth": 40,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	        user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i] * 0.9,
	            "depth": 60,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	        user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i] * 0.3,
	            "depth": 80,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	        user_data.push({
	            "lon": d,
	            "lat": data.lat[i],
	            "value": data.temp[i] * 0.2,
	            "depth": 100,
	            "level": 0, //for depth dependent data, this would be another col of data. 
	            "dist2path": 0, //distance to the closest path
	            "distalongpath": -1, //distance along path the projection of this point falls
	            "branch": -1, //indicates which branch this data point falls on;
	            "selected": false //flag for data points on a path
	        })

	    
		
	        
	        
	    })
	    
	    	    
	    //Find domain of data (user definable)
	    value_min = user_data.reduce(function(p, v) {
	        if (v.value < p) return v.value;
	        return p;
	    }, 1000000);

	    value_max = user_data.reduce(function(p, v) {
	        if (v.value > p) return v.value;
	        return p;
	    }, -1000000);
	    

	   var colors= ["#b02d9c", "#8c2a9d", "#3c259d", "#188ffb", "#22bcfb", "#27dcfc", "#7bf88b", "#b8f854", "#f5f937", "#fdda31", "#feae2b", "#fb9025", "#fb6620", "#e72518", "#9e160d", "#3b0402"];
	   
		var heatmap = d3.scale.linear()
		  .domain(d3.range(0, 1, 1.0 / (colors.length - 1)))
		  .range(colors);
		
		// dynamic bit...
		var c = d3.scale.linear().domain([value_min, 10]).range([0,1]);

			console.log(value_min);

 /*
var colors= ["#fc2bfc", "#4124fb", "#19a961", "#79fd30", "#fd9426", "#fc2e34"];
	   
		var heatmap = d3.scale.linear()
		  .domain(d3.range(0, 1, 1.0 / (colors.length - 1)))
		  .range(colors);
		
		// dynamic bit...
		var c = d3.scale.linear().domain([0,30]).range([0,1]);
*/

  
	    
				     
     	    

	    d3.select("#depth_range").on("input", function() {
	        selected_depth = +this.value;
	    });

	    d3.select("#select_axis").on("change", function() {
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
	        
	    /*
    data_max = 0;
	        data_min = 30;
*/

	        selected_var = 1;
	        apply_pathway();


	    });


	    selected_depth = 0;
	    selected_var = 0;



	    // Calculate mean lat and lon values
	    var mean_lat = user_data.reduce(function(p, v) {
	        return p + v.lat;
	    }, 0) / user_data.length;
	    var mean_lon = user_data.reduce(function(p, v) {
	        return p + v.lon;
	    }, 0) / user_data.length;


		    
	    // set projection parameters
	    projection
	        .scale(1200)
	        .center([mean_lon, mean_lat])
/*
			.center([144,36])
			.rotate([-30,0])
*/
	        

	    // create path variable
	    var path = d3.geo.path()
	        .projection(projection);

	    var path_tolerance = 10; //user changeable (add slider or something) 

	    var graticule = d3.geo.graticule();

	    var svg = d3.select("#map").append("svg")
	        //var svg = d3.select("svg")
	        .attr("width", width)
	        .attr("height", height)
	        .on("click", add_node)
	        /* 	    .on("dbclick",function(){console.log ('double clicked');}) */
	        /* 	    .call(zoom); */
	        
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
		.attr("class","marker")
		.attr('cx',-30)
    	.attr('cy',-30)
    	.attr("r",8)

		
		
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
	        .attr("r", "4px")
	        .attr("fill", function(d) {
	            return heatmap(c(d.value));
	        })
	        


	    d3.select("button").on("click", function() {

	        if (branches.length < 1)
	            return

	        apply_pathway();


	    });


	    function apply_pathway() {

			
			if (nodes.length<2) return; 
	        //Calculate distance from each data node to closest branch
	        user_data.map(function(d, i) {

	            d.dist2path = 10000;

	            path_handles.map(function(path_handle, i) {
	                p = closestPoint(path_handle.node(), [projection([d.lon, d.lat])[0],
	                    projection([d.lon, d.lat])[1]
	                ]);

	                if (p.distance < d.dist2path) {
	                    d.dist2path = p.distance;
	                    d.distalongpath = p.scanLength + branches[i].min_dist;;
	                    d.branch = i;
	                }

	            });
	    

	            if (d.dist2path < path_tolerance){
/* 	            	console.log('selected node with dist2path of ', d.dist2path); */
	                d.selected = true;
	                }

	        })

	        //Assign selected or unselected node classes according to calculated dist2path
	        g.selectAll(".data_node")
	            .data(slice_user_data)
	            .classed("selected_node", function(d) {
	                if (d.dist2path < path_tolerance) return true;
	                return false;
	            })
	            .classed("unselected_node", function(d) {
	                if (d.dist2path > path_tolerance) return true;
	                return false;
	            })
	            .attr("r", function(d) {
	                if (d.dist2path < path_tolerance) return 6;
	                return 4
	            })



	       
			update_scatter_plot();


	    }




	    function update_scatter_plot() {

	        //Update x_axis
            d3.select(".axis.axis--x")
	            .transition().duration(1500).ease("sin-in-out")
	            .call(xAxis);

          
	        //Iterate through branches and draw svg path lines						
	        branches.map(function(branch, i) {

	            var branch_line = [{
	                'x': branch.min_dist,
	                'y': branch.level
	            }, {
	                'x': branch.max_dist,
	                'y': branch.level
	            }];


	            axes.append("path")
	                .datum(branch_line)

	            .attr("class", "track")
	                .attr("id", function() {
	                    return ('t_' + branch.level)
	                })
	                .attr("d", line_function)



	        });

	        //Append "connectors" between connected branches
	        clines = [];

	        connectors = sources.filter(function(s) {
	            return nodes[s.node].incoming.length > 0
	        })

	        connectors.map(function(c) {
	            c.branches.map(function(cc, i) {
	                clines.push([{
	                    'x': nodes[c.node].dist,
	                    'y': c.source_branch
	                }, {
	                    'x': nodes[c.node].dist,
	                    'y': branches[cc].level
	                }])


	            })

	        })


	        clines.map(function(cl) {
	            axes.append("path")
	                .datum(cl)
	                .attr("class", "connector")
	                .attr("d", line_function)

	        })



			

	        //Compress all branch nodes into a single vector	          
	        all_nodes = [];

	        branches.map(function(b) {
	            b.nodes.map(function(n) {
	                all_nodes.push({
	                    ind: nodes[n].index,
	                    dist: nodes[n].dist,
	                    order: b.order,
	                    level: b.level
	                })


	            })

	        })


	        //Update path nodes on  bottom plot 
	        
	         //create subaxis for each branch
	        y_scales = [];
	        var y_axis=[];




	        branches.map(function(branch, i) {

	            ys = d3.scale.linear()
	                .range([y(branch.level + 0.1), y(branch.level + 0.8)])
	                .domain([data_max, data_min])
	                .clamp(true);

/* 					console.log(ys.domain()) */

	            y_scales.push(ys);

	            yax = d3.svg.axis()
	                .scale(ys)
	                .orient("left")
	                .ticks(4)
	                .tickSize(-x(branch.max_dist - branch.min_dist), 0, 0)
	                
	            y_axis.push({"axis":yax,
		            "branch":branch}
	            )
	            
     
   
	        });
	        
		         
		     //Update position of all yaxis.    
	         yaxes = axes.selectAll(".branch_y").data(y_axis);
	            
	            
	         yaxes
	            .enter()
               	.append("g")
                .attr("class", "axis axis--y branch_y grid")
                .attr("transform", function(d){ return "translate(" + x(d.branch.min_dist) + ",0)"})
                .each(function(d){d3.select(this).call(d.axis)});
                
            
            axes_rect = axes.selectAll(".axes_background").data(y_axis); 
            
            
            axes_rect
            	.enter()
            	.append("rect")
            	.attr("class","axes_background")
            	.attr("x",function(d){return x(d.branch.min_dist)})
            	.attr("y",function(d){return d.axis.scale().range()[1]})
            	.attr("width",function(d){return x(d.branch.max_dist) - x(d.branch.min_dist)})
            	.attr("height",function(d){return (d.axis.scale().range()[0] - d.axis.scale().range()[1])})
				.on("mousemove", function(d,i){				
			    	xx = x.invert(d3.mouse(this)[0]);
	                yy = Math.round(d.axis.scale().invert(d3.mouse(this)[1]));
	            	
	            	point = path_handles[i].node().getPointAtLength(xx - d.branch.min_dist); //getPointAtLength
	            	marker_x = point.x; marker_y = point.y;
	            	
	            	//Update marker position
	            	marker
	            	.attr('cx',marker_x)
	            	.attr('cy',marker_y);
            	
				})
				.on("mouseout",function(){
					marker.attr('cx',-30)
	            	.attr('cy',-30);
				});
            	
            	          	
            	
            	
            axes_rect
            	.transition()
            	.duration(500).ease("sin-in-out")
            	.attr("x",function(d){return x(d.branch.min_dist)})
            	.attr("y",function(d){return d.axis.scale().range()[1]})
            	.attr("width",function(d){return x(d.branch.max_dist) - x(d.branch.min_dist)})
            	.attr("height",function(d){return (d.axis.scale().range()[0] - d.axis.scale().range()[1])})
                	
           yaxes
        	.transition()
        	 .duration(500).ease("sin-in-out")
            .attr("transform", function(d){return "translate(" + x(d.branch.min_dist) + ",0)"})
            .each(function(d){
            d3.select(this).call(d.axis)
            });
                
                
				 		
	        path_nodes = axes.selectAll(".path_node")
	            .data(all_nodes);

	        path_nodes
	            .enter()
	            .append("circle")

	        .attr("cx", function(d) {
	                return x(width)
	            })
	            .attr("cy", function(d) {
	                return y(d.level)
	            })
	            .attr("r", 5)
	            .attr("class", "circle")
	            .attr("class", "path_node")




	        path_nodes.transition()
	            .duration(500).ease("sin-in-out")
	            .attr("cx", function(d) {
	                return x(d.dist)
	            })
	            .attr("cy", function(d) {
	                return y(d.level)
	            })


	        //Update data nodes on bottom plot

	        // add points circles to bottom plot
	        data_nodes = axes.selectAll(".data_node")
	            .data(user_data.filter(function(d) {
	                return d.selected
	            }));

	        data_nodes
	            .enter()
	            .append("circle")
	            .attr("class", 'data_node')
	            .attr("cx", function(d) {
	                return width;
	            })
	            .attr("cy", function(d) {
/* 	            	console.log('d.branch for selected d is ', d.branch, d.depth); */
	                if (selected_var == 0)
	                    return y_scales[d.branch](d.depth);

	                return y_scales[d.branch](d.value) //y_scales[d.branch](d.value);
	            })
	            .attr("r", "5px")
	            .attr("fill", function(d) {
	                return heatmap(c(d.value));
	            })


	        data_nodes.transition()
	            .duration(500).ease("sin-in-out")
	            .attr("cx", function(d) {
	                return x(d.distalongpath);
	            })
	            .attr("cy", function(d) {
	                if (selected_var == 0)
	                    return y_scales[d.branch](d.depth);

	                return y_scales[d.branch](d.value) //y_scales[d.branch](d.value);
	            })




	    }


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


	    var drag = d3.behavior.drag()
	        .on("drag", dragmove)
	        .on("dragstart", function() {
	            d3.event.sourceEvent.stopPropagation(); // silence other listeners
	        })
/* 	        .on("dragend", merge_nodes); */



	    function merge_nodes(d, i) {


	        /* Find closest Node*/

	        var diff_x;
	        var diff_y;

	        closest_node = nodes.filter(function(n) {

	            diff_x = Math.abs(n.x - nodes[i].x);
	            diff_y = Math.abs(n.y - nodes[i].y)

	            return (diff_x + diff_y > 0 && diff_x + diff_y < 10)

	        });


	        if (closest_node.length < 1) {
	            return;
	        }

	        /* console.log ('@ start of merge, nodes are', nodes[4]); */
	        //Merge nodes

	        var source_node = [i, closest_node[0].ind].reduce(function(p, v) {
	            if (v < p) return v;
	            return p;
	        }, i);
	        var target_node = [i, closest_node[0].ind].reduce(function(p, v) {
	            if (v > p) return v;
	            return p;
	        }, i);

	        /*
        console.log('source node is ', source_node);
	        console.log('target node is ', target_node); 
*/


	        //Update incoming and outgoing of nodeB
	        nodes[target_node].incoming = nodes[target_node].incoming.concat(nodes[source_node].incoming);
	        nodes[target_node].outgoing = nodes[target_node].outgoing.concat(nodes[source_node].outgoing);

	        //Update outgoing list of source_nodes' incoming nodes
	        nodes[source_node].incoming.map(function(n) {
	            nodes[n].outgoing.map(function(nn, ind) {
	                if (nn.node == source_node) //replace source_node with target_node
	                    nodes[n].outgoing.splice(ind, 1, {
	                    node: target_node,
	                    visited: false
	                })
	            });

	        });

	        /* 			console.log ('@ line 312, nodes is', nodes) */
	        //Update incoming list of source_nodes' outgoing nodes
	        nodes[source_node].outgoing.map(function(n) {
	            nodes[n.node].incoming.map(function(nn, ind) {
	                if (nn == source_node) //replace source_node with target_node
	                    nodes[n.node].incoming.splice(ind, 1, target_node)
	            });

	        });


	        //Remove source_node
	        /* 	        console.log('removing source node', source_node);  */

	        nodes[source_node] = -1;


	        /* 	        console.log ('@ line 328, nodes is', nodes) */

	        //Update active node - doesn't work here
	        /* 	toggle_active(d3.select('#c_' + target_node), target_node) */


	        draw_nodes()
	            /* 	        console.log('active node is ', active_node);  */


	        /* 	console.log ('after merging, nodes is', nodes) */
	    }



	    var newlineFunction = d3.svg.line()
	        .x(function(d) {
	            return nodes[d].x;
	        })
	        .y(function(d) {
	            return nodes[d].y;
	        })
	        .interpolate("cardinal");



			
	    // Add node to end of branch/pathway
	    function add_node(d, i) {

	        if (d3.event.defaultPrevented) return; // click suppressed

	        //Grab mouse position  
	        d = d3.mouse(this);

	        //Increment node_counter
	        ++node_counter;

	        //Create new node object
	        var new_node = {
	            x: d[0],
	            y: d[1],
	            dist: -1,
	            source: false, //var to flag source nodes (nodes that start pathways)
	            ind: nodes.length, //stores index within nodes vector
	            incoming: [], //no need to store flag for visited since we only build branches forward, not backward
	            outgoing: []
	        }


	        //If pathway has at least two nodes, update incoming, outgoing	
	        if (active_node > -1) {
	            /* 	        	console.log('active node is ', active_node, nodes, nodes[active_node]); */

	            //Add the new node to the list of outgoing for the previous node. 
	            nodes[active_node].outgoing.push({
	                node: node_counter,
	                visited: false //for branch buildling, keeps track if this path segment has been visited
	            });

	            new_node.incoming = [active_node];

	        }


	        nodes.push(new_node);

	        //end_node = node_counter;

	        draw_nodes();

	        /* 	        console.log('after add_nodes, nodes is ', nodes)  */

	    }


	    function draw_nodes(d, i) {


	        cname = ["circle" + String(curr_path)];

	        if (node_handles.length > curr_path)
	            node_handles[curr_path].remove();


	        //add in current set of nodes to map
	        node_handles[curr_path] = pathgroup.selectAll(cname)
	            .data(nodes)
	            .enter().append("circle")


	        node_handles[curr_path]
	            .attr("cx", function(d) {
	                return d.x
	            })
	            .attr("cy", function(d) {
	                return d.y
	            })
	            .attr("r", 5)
	            .attr("class", "circle")
	            .attr("class", cname)
	            .attr("class", "path_node")
	            //unique id for each node
	            .attr("id", function(d, i) {
	                return ('c_' + i)
	            })
	            .call(drag)
	            .on("click", function(d, i) {
	                if (d3.event.defaultPrevented) return;
	                toggle_active(d3.select(this), i);
	                draw_path();


	                d3.event.stopPropagation();
	            })
	            .on("dblclick", function(d, i) {
	                end_node = i;
	                draw_path();
	            })


	        //Create tooltip for debugging node distances
	        d3.selectAll(".path_node")
	            .append("svg:title");


	        activate_last_node();

	        draw_path()
	    }

	    //Function to make last added node active
	    function activate_last_node() {

	        //Make last added non-empty node active
	        for (var s = nodes.length - 1; s >= 0; s--) {
	            if (nodes[s].hasOwnProperty('x')) {
	                toggle_active(d3.select('#c_' + s), s)
	                break
	            }
	        }

	    }

	    //Function to make current node active. Changes appearance of node and sets active_node variable
	    function toggle_active(selected_node, i) {

	        //Updating end_node

	        on_main_branch = false;

	        if (end_node > -1) {
	            on_main_branch = nodes[i].incoming.reduce(function(prevValue, currNode) {
	                return prevValue | currNode == end_node
	            }, false);
	        }

	        if (on_main_branch)
	            end_node = i;
	        else
	            end_node = 0;

	        //Make all nodes blue, make active node red	
	        node_handles[curr_path]
	            .classed({
	                'active_node': false
	            })

	        //Node is already active, toggle to off
	        if (active_node == i) {
	            active_node = -1;
	            return
	        }
	        //Make node active
	        active_node = i;

	        selected_node.classed({
	            'active_node': true
	        })

	    }

	    //Function to generate branch objects for a given path
	    function parse_branches() {

	        /* Check if currently active node is reachable from start_node 	 */
	        valid_end_node = nodes[start_node].outgoing.filter(function(n) {
	            return has_node(n.node, end_node);
	        });

	        //If not set end node to last node in the main branch)
	        if (valid_end_node.length < 1 & branches.length > 0)
	            end_node = branches[0].nodes[branches[0].nodes.length - 1];

	        branches = []; // empty branch vector, which will later be added to path object; 

	        // Set all path segments to unvisited and all sources to false; 
	        nodes.map(function(n) {
	            //For non empty nodes
	            if (n.hasOwnProperty('outgoing')) {
	                n.outgoing.map(function(k) {
	                    k.visited = false;
	                })
	                n.source = false;
	            }
	        });

	        //Start by building main branch 
	        curr_branch = {
	            'main': true,
	            'order': 0, // will later be modified/sorted according to relative positions in space 
	            'level': 0,
	            'nodes': [start_node],
	            'color': "black", //Color for main branch is always black
	            'visited': false //used when updating branch distances
	        };


	        var curr_node = start_node;
	        var next_node;


	        //keep building branch as long as you don't encounter end_node or end of branch
	        while (curr_node != end_node && nodes[curr_node].outgoing.length > 0) {


	            if (end_node < 0) { // user has not defined end point, select first node in outgoing list

	                nodes[curr_node].outgoing[0].visited = true; //flag this segment as visited

	                //Select next node
	                next_node = nodes[curr_node].outgoing[0].node;
	            } else {

	                next_node = nodes[curr_node].outgoing.filter(function(n) {
	                    return has_node(n.node, end_node);
	                })[0].node;

	                next_node_index = nodes[curr_node].outgoing.map(function(e) {
	                    return e.node;
	                }).indexOf(next_node);

	                nodes[curr_node].outgoing[next_node_index].visited = true; //flag this segment as visited
	            }

	            curr_node = next_node;

	            //Add node to list of nodes in branch
	            curr_branch.nodes.push(next_node);


	        }

	        branches.push(curr_branch);

	        /*     Build secondary branches */

	        //Set Sources
	        nodes.map(function(n) {
	            //For non empty nodes
	            if (n.hasOwnProperty('outgoing')) {
	                if (n.outgoing.length > 1) // nodes with more than one outgoing node
	                    n.source = true;
	                if (n.ind == end_node && n.outgoing.length > 0) //end_node has outgoing nodes
	                    n.source = true;
	                if (n.incoming.length < 1) // no incoming nodes
	                    n.source = true;
	            }
	        });


	        //Filter source nodes
	        var source_nodes = nodes.filter(function(n) {
	            return n.source;
	        });


	        //Index of source nodes
	        sources = source_nodes.map(function(n) {
	            return n.ind
	        });


	        //Filter out lone nodes (no associated path)
	        sources = sources.filter(function(b) {
	            return nodes[b].outgoing.length > 0
	        });

	        sources = sources.map(function(ss) {
	            return {
	                "node": ss,
	                "source_branch": -1,
	                "branches": []
	            }
	        });


	        //For each source, build branch
	        sources.map(function(ss) {

	            s = ss.node;


	            //While this source has unvisited outgoing nodes
	            while (nodes[s].outgoing.filter(function(n) {
	                    return !n.visited
	                }).length > 0) {


	                curr_branch = {
	                    'main': false,
	                    'order': branches.length,
	                    'nodes': [s],
	                    /* 	                    'color': colors[branches.length] */
	                };

	                var curr_node = s;
	                var next_node;



	                //While we don't reach end of branch or start of new branch
	                while (nodes[curr_node].outgoing.length > 0 && (curr_branch.nodes.length < 2 || !nodes[curr_node].source)) {

	                    visited = nodes[curr_node].outgoing.filter(function(n) {
	                        return n.visited
	                    });

	                    if (visited.length == nodes[curr_node].outgoing.length) break; //No more nodes to visit


	                    unvisited = nodes[curr_node].outgoing.filter(function(n) {
	                        return !n.visited
	                    });

	                    next_node_index = nodes[curr_node].outgoing.map(function(e) {
	                        return e.node;
	                    }).indexOf(unvisited[0].node);

	                    nodes[curr_node].outgoing[next_node_index].visited = true; //flag this segment as visited

	                    //Select next node
	                    next_node = nodes[curr_node].outgoing[next_node_index].node;

	                    curr_node = next_node;

	                    //Add node to list of nodes in branch
	                    curr_branch.nodes.push(next_node);


	                }




	                //At least two nodes required for a branch
	                if (curr_branch.nodes.length > 1) {
	                    branches.push(curr_branch);

	                    //find out which branch this node is a part of
	                    source_branch = branches.filter(function(branch) {
	                        return (branch.nodes.filter(function(n) {
	                            return n == s
	                        }).length > 0);
	                    });

	                    target_node = source_branch[0].nodes.reduce(function(p, v, ind) {
	                        if (v == s)
	                            return ind
	                        return p
	                    }, -1);

	                    ss.source_branch = source_branch[0].level;

	                    if (target_node == source_branch[0].nodes.length - 1)
	                        target_node = target_node - 1;


	                    //Fit a line between branching node and next (or previous) node in source branch
	                    lr_source_branch = linearRegression(
	                        [nodes[source_branch[0].nodes[target_node]].y, nodes[source_branch[0].nodes[target_node + 1]].y], [nodes[source_branch[0].nodes[target_node]].x, nodes[source_branch[0].nodes[target_node + 1]].x]);

	                    lr_curr_branch = linearRegression(
	                        [nodes[curr_branch.nodes[0]].y, nodes[curr_branch.nodes[1]].y], [nodes[curr_branch.nodes[0]].x, nodes[curr_branch.nodes[1]].x]);



	                    new_y = lr_source_branch.slope * nodes[curr_branch.nodes[1]].x + lr_source_branch.intercept;

	                    if (new_y < nodes[curr_branch.nodes[1]].y)
	                        branches[branches.length - 1].level = source_branch[0].level - 1;
	                    else
	                        branches[branches.length - 1].level = source_branch[0].level + 1;


	                    /*
if (lr_curr_branch.slope < lr_source_branch.slope)
			            		branches[branches.length-1].level = source_branch[0].level -1;
			            	else
			            		branches[branches.length-1].level = source_branch[0].level +1;
*/



	                    ss.branches.push(curr_branch.order)
	                }



	            }



	        }); // end sources.map 


	        return sources;
	    };

	    //Recursive function that returns true if the target_node can be found by following any paths starting @ start_node

	    function has_node(start_node, target_node) {

	        //Found node
	        if (start_node == target_node)
	            return true;

	        //Reached end of this branch
	        if (nodes[start_node].outgoing.length < 1)
	            return false

	        //Continue searching 
	        return (nodes[start_node].outgoing.reduce(function(prevValue, currNode, index, array) {
	            return prevValue | has_node(currNode.node, target_node);
	        }, false));

	    }



	    //Function to draw paths between nodes  	
	    function draw_path() {


	        //Create branch objects
	        sources = parse_branches();

	        //clear global variable path_handles
	        path_handles = [];

	        //delete existing pathway
	        d3.selectAll(".pathline").remove();
	        d3.selectAll(".mainpath").remove();
	        d3.selectAll(".track").remove();
	        d3.selectAll(".connector").remove();

	        //Iterate through branches and draw svg path objects						
	        branches.map(function(branch) {

            // build the arrow.
            svg.append("svg:defs").selectAll("marker")
                .data(["end"]) // Different link/path types can be defined here
                .enter().append("svg:marker") // This section adds in the arrows
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", 0)
                .attr("markerWidth", 3)
                .attr("markerHeight", 3)
                .attr("orient", "auto")
                /* 	                .style("stroke", branch.color) */
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            //Create path for each branch
            path_handle = pathgroup
                .append("path")
                .attr("marker-end", "url(#end)")
                .attr("d", newlineFunction(branch.nodes))
                .attr("id", function() {
                    return ('b_' + branch.order)
                })
                .attr("class", function(d) {
                    if (branch.main) {
                        return "mainpath"
                    }
                    return "pathline";
                })
                /*         .style('stroke', branch.color) */
                /*                 .style('stroke', "#616161") */


	            path_handle
	                .on("mousedown", function() {
	                    d3.event.stopPropagation();
	                })
	                //.on("click", test_callback ());

	            path_handles.push(path_handle);

	        });


				
	        //Update along path distance for all nodes
	        if (nodes.length > 1) {
	        
	            update_dist(path_handles);	       
	            
	            update_scatter_plot();
	            
	             //Move circles to front
	            var sel = d3.selectAll(".path_node")
	            sel.moveToFront();


	        };
	        
			 
	            
	    }

	    //Function that assigns new positions to nodes once they are dragged
	    function dragmove(d, i) {

	        nodes[i].x = d3.mouse(this)[0];
	        nodes[i].y = d3.mouse(this)[1];

	        d3.select(this)
	            .attr("cx", function(d) {
	                return d.x
	            })
	            .attr("cy", function(d) {
	                return d.y
	            })


	        draw_path()

	    }

	    function move() {
	        var t = d3.event.translate,
	            s = d3.event.scale;
	        t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
	        t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
	        zoom.translate(t);
	        g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
	    }

	    // Used to ensure nodes are in front of path line at all times. 
	    d3.selection.prototype.moveToFront = function() {
	        return this.each(function() {
	            this.parentNode.appendChild(this);
	        });
	    };


	    function mousemoved() {
	        if (branches.length > 0 && paths[curr_path].length > 1) {
	            var m = d3.mouse(this),
	                p = closestPoint(path_handles[curr_path].node(), m);
	            /*             console.log(p); */
	        }
	    }



	    //Will use when regressing data points onto path
	    /* from http://bl.ocks.org/mbostock/8027637  */
	    function closestPoint(pathNode, point) {
	        var pathLength = pathNode.getTotalLength(),
	            precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
	            best,
	            bestLength,
	            bestDistance = Infinity;

	        /*      console.log () */
	        // linear scan for coarse approximation
	        for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
	            /*     	console.log('loop ', scan);  */
	            if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
	                /*         	console.log ('scanDistance is ', scanDistance); */
	                best = scan, bestLength = scanLength, bestDistance = scanDistance;
	            }
	        }


	        // binary search for precise estimate
	        precision *= .5;
	        while (precision > .5) {
	            var before,
	                after,
	                beforeLength,
	                afterLength,
	                beforeDistance,
	                afterDistance;
	            if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
	                best = before, bestLength = beforeLength, bestDistance = beforeDistance;
	            } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
	                best = after, bestLength = afterLength, bestDistance = afterDistance;
	            } else {
	                precision *= .5;
	            }
	        }

	        best = [best.x, best.y];
	        //Distance to path
	        best.distance = Math.sqrt(bestDistance);
	        //Along track distance
	        best.scanLength = bestLength;
	        //console.log(best);
	        return best;

	        function distance2(p) {
	            var dx = p.x - point[0],
	                dy = p.y - point[1];
	            return dx * dx + dy * dy;
	        }
	    }


	    /* Calculate along track distance of nodes  */
	    function update_dist(pathHandle) {

	            //Cycle through all distances and set to -1
	            nodes.map(function(n) {
	                n.dist = -1;
	            })


	            //For each branch, calculate node dist values 
	            for (var j = 0; j < pathHandle.length; j++) {

	                var segments = pathHandle[j].node().pathSegList;

	                branches[j].total_distance = pathHandle[j].node().getTotalLength();

	                for (i = 0; i < nodes.length; i++) {
	                    if (nodes[i].hasOwnProperty('x')) { //Node has not been deleted
	                        p = closestPoint(pathHandle[j].node(), [nodes[i].x, nodes[i].y]);
	                        if (p.distance < 1) { //node is on path
	                            if (nodes[i].dist < 0) { // node distance has not been computed yet 
	                                nodes[i].dist = p.scanLength; // + delta
	                            } //end if nodes[i].dist < 0

	                        } // end if p.distance < 1
	                    } //end if nodes[i].hasOwnProperty('x')
	                } // end for each nodes

	            } //end for each pathHandle



	            //Calculate Relative Distance

	            if (branches.length > 1)
	                calculate_relative_distances();

	            /*         console.log('updating title');     */
	            d3.selectAll("circle")
	                .select("title")
	                .text(function(d) {
	                    return d.dist;
	                });

	            //Update branch specific min/max distances	
	            branches.map(function(d, i) {


	                /*
	                               d.min_dist = Math.min.apply(Math, d.nodes.map(function(n) {
	                	                return nodes[n].dist
	                	            }));
	                	           d.max_dist = Math.max.apply(Math, d.nodes.map(function(n) {
	                	                return nodes[n].dist
	                	                 }));	
	                */

	                d.min_dist = nodes[d.nodes[0]].dist,
	                    d.max_dist = nodes[d.nodes[d.nodes.length - 1]].dist;
	            });

	            var min_dist = nodes.reduce(function(p, v) {
	                if (v.dist < p) return v.dist;
	                return p;
	            }, 0);

	            var max_dist = nodes.reduce(function(p, v) {
	                if (v.dist > p) return v.dist;
	                return p;
	            }, 0);

	            var min_level = branches.reduce(function(p, v) {
	                if (v.level < p) return v.level;
	                return p;
	            }, 0);

	            var max_level = branches.reduce(function(p, v) {
	                if (v.level > p) return v.level;
	                return p;
	            }, 0);


	            //Update Domains

	            x.domain([min_dist, max_dist]);
	            y.domain([min_level, max_level + 1]);


	            /* 				branches.map(function(b){console.log('level for branch ', b.order , ' is ', b.level)}); */


	        } //end function 


	    /* Calculate node distances in relation to the main branch  */
	    function calculate_relative_distances() {

	            branches[0].visited = true;
	            to_update = [].concat(branches[0].nodes);

	            while (to_update.length > 0) {

	                //Find branches that start/end @ this node	
	                incoming_branches = branches.filter(function(b) {
	                    return !b.visited && b.nodes[b.nodes.length - 1] == to_update[0]
	                });
	                outgoing_branches = branches.filter(function(b) {
	                    return !b.visited && b.nodes[0] == to_update[0]
	                });

	                incoming_branches.map(function(b) {
	                    b.visited = true;
	                    //Add nodes from start to end -1 to to_update
	                    add_nodes = b.nodes.filter(function(n, i) {
	                        return (i < b.nodes.length)
	                    })

	                    to_update = to_update.concat(add_nodes);
	                })

	                outgoing_branches.map(function(b) {
	                    b.visited = true;
	                    //Add nodes from start + 1 to end
	                    add_nodes = b.nodes.filter(function(n, i) {
	                        return (i > 0)
	                    })

	                    to_update = to_update.concat(add_nodes);
	                })

	                update_node_distances(incoming_branches, outgoing_branches, to_update[0]);

	                to_update.shift();
	            }




	        } //end calculate_relative-distances

	    /*  Offsets node distances in incoming/outgoing branches */
	    function update_node_distances(incoming_branches, outgoing_branches, node_id) {


	        incoming_branches.map(function(b) {

	            offset = nodes[node_id].dist - b.total_distance;

	            b.nodes.map(function(n, i) {
	                //Start node
	                if (i == 0)
	                    nodes[n].dist = offset;
	                //All other nodes except the last (which already has a distance) 
	                else if (i < b.nodes.length - 1)
	                    nodes[n] = nodes[n].dist + offset
	            })
	        })


	        outgoing_branches.map(function(b) {
	            offset = nodes[node_id].dist
	            b.nodes.map(function(n, i) {
	                if (i > 0)
	                    nodes[n].dist = nodes[n].dist + offset
	            })
	        })



	    };

	    function linearRegression(y, x) {

	        var lr = {};
	        var n = y.length;
	        var sum_x = 0;
	        var sum_y = 0;
	        var sum_xy = 0;
	        var sum_xx = 0;
	        var sum_yy = 0;

	        for (var i = 0; i < y.length; i++) {

	            sum_x += x[i];
	            sum_y += y[i];
	            sum_xy += (x[i] * y[i]);
	            sum_xx += (x[i] * x[i]);
	            sum_yy += (y[i] * y[i]);
	        }

	        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
	        lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
	        lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

	        return lr;

	    };

	});