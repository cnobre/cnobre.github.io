		 /* 		For Demo Purposes, pre load two datasets into the browser */
		
		//Variables to store the two datasets
		var cruise_data =[];
		var gridded_data = [];
		
		//Variable for dataset being currently used
		var user_data =[];
		
		//Load in gridded data set		
		d3.csv("gridded_data.csv", function(error, data) {
		
		console.log(data)
		 
		    		data.map(function(d, i) {
						for (var property in d) {
						
						  if (Number(property)<1000){
						
					      
					       gridded_data.push({
					            "lon": Number(d.lon),
					            "lat": Number(d.lat),
					            "value": Number(eval("d["+ eval(property)+ "]")),
					            "depth": Number(eval(property)),
/* 					            "level": 0, //for depth dependent data, this would be another col of data.  */
					            "dist2path": 0, //distance to the closest path
					            "distalongpath": -1, //distance along path the projection of this point falls
					            "branch": -1, //indicates which branch this data point falls on;
					            "selected": false //flag for data points on a path
					        })
					        
				        }
					   }
					   });
					   

		    		    
		    
		});
		
		
		//Load in cruise data set
		d3.json("cruise_data.json", function(error, data) {
			
			console.log(data)
			data.lat.map(function(d, i) {

		        cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]),
		            "sal": Number(data.sal[i]*0.9),
		            "depth": 0,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.),
		            "sal": Number(data.sal[i]*0.95),
		            "depth": 10,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.5),
		            "sal": Number(data.sal[i]*0.92),
		            "depth": 15,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.4),
		            "sal": Number(data.sal[i]*0.95),
		            "depth": 20,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.3),
		            "sal": Number(data.sal[i]),
		            "depth": 25,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })


				cruise_data.push({
		            "lon": Number(data.lon[i]),
		            "lat": Number(data.lat[i]),
		            "value": Number(data.tmp[i]*0.2),
		            "sal": Number(data.sal[i]*0.9),
		            "depth": 30,
/* 		            "level": 0, //for depth dependent data, this would be another col of data.  */
		            "dist2path": 0, //distance to the closest path
		            "distalongpath": -1, //distance along path the projection of this point falls
		            "branch": -1, //indicates which branch this data point falls on;
		            "selected": false //flag for data points on a path
		        })



		    })
					
			//Default to cruise dataset
			user_data = cruise_data;
			
									
			parse_user_data()
			

		});
		
		
		//Function that processes data after it is loaded by d3.json upon page load			
		function parse_user_data(){
		    /* 	    map.call(zoom); */
		    
		    
		    //Find domain of data 
		    
		    
		    data_min = user_data.reduce(function(p, v) {
		        if (v.depth < p) return v.depth;
		        return p;
		    }, 1000000);

		    data_max = user_data.reduce(function(p, v) {
		        if (v.depth > p) return v.depth;
		        return p;
		    }, -1000000);
		    
		
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


			
		    // Calculate mean lat and lon values for this dataset
		    var mean_lat = user_data.reduce(function(p, v) {
		        return p + v.lat;
		    }, 0) / user_data.length;
		    var mean_lon = user_data.reduce(function(p, v) {
		        return p + v.lon;
		    }, 0) / user_data.length;


		    // set projection parameters
		    projection
		        .scale(scale)
		        .center([mean_lon+2, mean_lat-.6])


		    
			//Option to use a subset of the data by depth	
		    slice_user_data = user_data.filter(function(d) {
		        return d.depth == selected_depth
		    });
		    
		    
		    render_page();
		    
		    };
		    
		       function render_page(){


		    		  	// create path variable
		    var path = d3.geo.path()
		        .projection(projection);

		    var graticule = d3.geo.graticule();

		    var g = svg.append("g")
			    .attr("id", "mapgroup")

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
		       
		     //add marker to map, later used to link paths and map view   	 
		    marker = g.append('circle')
		        .attr("class", "marker")
		        .attr('cx', -30)
		        .attr('cy', -30)
		        .attr("r", 8)

		    pathgroup = g.append("g")
		        .attr("id", "pathgroup")
		        
		        console.log('creating bottom plot');
		        
		         //Bottom Plot Setup
		    axes = d3.select(".container").append("svg")
		        .attr("width", width + margin.right)
		        .attr("height", axis_height + margin.top + margin.bottom)
		        .append("g")
		        .attr("transform", "translate(20," + margin.top + ")");

		    axes.append("g")
		        .attr("class", "axis axis--x")
		        .attr("transform", "translate(0," + (axis_height + 10) + ")")
		        .call(xAxis);

		    axes.append("text") // text label for the x axis
		        .attr("transform", "translate(" + (width / 2) + " ," + (axis_height + margin.bottom / 1.2) + ")")
		        .style("text-anchor", "middle")
		        .text("Along Track Distance");
		        
			//Once data is loaded, render page
/* 			render_page(); */
			
			// add circles to map svg
		    
		    g.selectAll("circle")
		        .data(slice_user_data)
		        .enter()
		        .append("circle")
		        .attr("class", 'data_node')
		        .on("click", function(d, i) {
/*
		            if (d3.select(this).classed("selected_node")) {
		                //user_data[i].selected = false;
		                d3.select(this)
		                    .classed("selected_node", false)
		                    .classed("unselected_node", true)
		                    //.attr("r", "4px")
		            } else {
		                //user_data[i].selected = true;
		                d3.select(this)
		                    .classed("selected_node", true)
		                    .classed("unselected_node", false)
		                    //.attr("r", "6px")

		            }
*/
		            d3.event.stopPropagation();
		        })
		        /*
.on("mouseover",function(d) {
		        	colorbarObject.pointTo(d.value)})
*/
		        .attr("cx", function(d,i) {
		            return projection([d.lon, d.lat])[0];
		        })
		        .attr("cy", function(d) {
		            return projection([d.lon, d.lat])[1];
		        })
		        .attr("r", circle_size)
		        .attr("fill", function(d) {
		            return color(d.value); 
		        })
		        
		        };
	    		
		
			
				
