		    //For depth range implementation
		    
		    d3.select("#depth_range").on("input", function() {
		        selected_depth = +this.value;
		    });
		    
		    
		    	    function mousemoved() {
		        if (branches.length > 0 && paths[curr_path].length > 1) {
		            var m = d3.mouse(this),
		                p = closestPoint(path_handles[curr_path].node(), m);
		            /*             console.log(p); */
		        }
		    }



		    
		    
		//Function to merge nodes, not currently being used! (Apr9 2015)
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
		    
		    
		    
		    /*
		//Apply Pathway Button
	    d3.select("#apply_path").on("click", function() {
	        if (branches.length < 1)
	            return
	        apply_pathway();
	    });
*/


		        
		        
/* 		        if (d.lon <= lon_range[1] & d.lon >= lon_range[0] & ) */
		        
		        /*
var pathNode;

								
				if (i==1){
				console.log(p1,p2);
				console.log(lon_range,lat_range);
				
				node_xy= projection([d.lon,d.lat]);
				node_dist = Math.sqrt(Math.pow(n1.x - node_xy[0],2) + Math.pow(n1.y - node_xy[1],2)); 
				console.log(node_dist);
				}
				
*/

	 		
	 		/*
p1 = projection.invert([n1.x,n1.y]);
			p2 = projection.invert([n2.x,n2.y]);
			
			
			
			lon_range = [(Math.min(p1[0],p2[0])), (Math.max(p1[0],p2[0]))];
			lat_range= [(Math.min(p1[1],p2[1])),(Math.max(p1[1],p2[1]))];
*/


		        /*
if (i==1){
		        console.log(pathNode.pathSegList); 
		        console.log(projection.invert([pathNode.pathSegList[0].x, pathNode.pathSegList[0].y]))
		        }
*/



//Iterate through all data points and find "selected" points 
		    
		    
		    	
				/*
data2 = user_data.filter(function(d) {
		        
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
	
	
			        if (d.dist2path < path_tolerance) {
			            return true;
			        }
			        	return false
			});
*/



data_nodes = axes.selectAll(".data_node")
		        .data(slice_user_data.filter(function(d) {
		            return d.selected
		        }));
		        

		    if (data_nodes.length < 1)
		        return;
		    
		    var val = d3.select('#select_color_axis')[0][0].value;
		     
		    data_nodes
		        .enter()
		        .append("circle")
		        .attr("class", 'data_node')
		        .attr("cx", function(d) {
		            return width;
		        })
		        .attr("cy", function(d) {
		         console.log(y_scales[d.branch].domain(), y_scales[d.branch].range(), y_scales[d.branch](0));
		         
		            if (selected_var == 0)
		            	return y_scales[d.branch](d.depths[0].depth);
		            	
	            	if (selected_var == 1)
		            	return y_scales[d.branch](d.value);
		            	
	            	if (selected_var == 2)
		            	return y_scales[d.branch](d.sal);
		            
		          
		        })
		        .attr("r", "5px")
		        .attr("fill", function(d) {
			        if (val == 0)
		            	return color(d.value)
		            	
	            	if (val == 1)
		            	return color2(d.sal)		            	
	            		            	
		            
		        })




