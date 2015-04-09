  d3.select("button").on("click", function() {
	
	        if (branches.length < 1)
	            return
         
	        update_bottom_plot();
	
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
	            
	            if (d.dist2path < path_tolerance)
	            	d.selected = true;
	
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
	            
	            
	              
		    //create subaxis for each branch
	          y_scales =[];
	          
/* 	          console.log('data min and max are', data_min, data_max); */
	
			

	          branches.map(function(branch,i){
	          
/* 	            branch_data = user_data.filter(function(d){return d.selected && d.branch == i}) */

				ys = d3.scale.linear()
	           			.range([y(branch.level+0.2), y(branch.level+0.8)])
	           			.domain([data_max, data_min])
	           			
	             console.log('new y scale range for branch ', branch ,'is ', ys.range());
		           			
		         y_scales.push(ys); 
		           			
		         yax= d3.svg.axis()
				    .scale(ys)
				    .orient("left")
				    .ticks(3)
				    .tickSize(-x(branch.max_dist - branch.min_dist), 0,0)
				    
		        axes.append("g")
			        .attr("class", "axis axis--y branch_y grid")			        
			        .attr("transform", "translate(" +  x(branch.min_dist) + ",0)")
			        .call(yax);	
		           		          
	          });
	          	         
	       
	         
		    // add points circles to bottom plot
		    axes.selectAll(".data_node")
		        .data(user_data.filter(function(d){return d.selected})).enter()
		        .append("circle")
		        .attr("class", 'data_node')
		        .attr("cx", function(d) {
		            return x(d.distalongpath);
		        })
		        .attr("cy", function(d) {
		            return y_scales[d.branch](d.depth);//y_scales[d.branch](d.value);
		        })
		        .attr("r", "4px")
		        .attr("fill", function(d) {
		            return color(d.value);
		        })
		

	         
	
	    });
	    
