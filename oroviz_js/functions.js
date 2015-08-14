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


//CREATE MAP and range sliders 

function create_map() {


    // Add Range Sliders
    var time_range = [d3.min(data, function(d) {
        return d.date
    }), d3.max(data, function(d) {
        return d.date
    })];
    var depth_range = [d3.min(data, function(d) {
        return d.prs
    }), d3.max(data, function(d) {
        return d.prs
    })];


    tscale = d3.time.scale().domain([time_range]);


/*
    d3.select('#slider3').call(d3.slider()
        .axis(d3.svg.axis().orient("bottom").ticks(5))
        .scale(tscale)
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

    d3.select('#slider3textmin').text(time_range[0].toDateString());
    d3.select('#slider3textmax').text(time_range[1].toDateString());

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

    d3.select('#slider4textmin').text(Math.round(depth_range[0]));
    d3.select('#slider4textmax').text(Math.round(depth_range[1]));
    
    //Update color scale
    var start = Math.floor(d3.min(all_data, cValue));
    var stop = d3.max(all_data, cValue);
    var step = Math.round((stop - start) / 10)

    lin_logscale
        .domain([start, stop])
		
    //Setup Map
    source_measurements = new ol.source.Vector({});
    source_pathway = new ol.source.Vector({
	    //features: collection
    });
    path_marker = new ol.source.Vector({});
    
    var path_style = function(feature, resolution) {
		var geometry = feature.getGeometry();
		var styles = [
		  /*
 new ol.style.Style({
		    stroke: new ol.style.Stroke({
		      color: '#073A68',
		      width: -1
		    })
		  }),
*/
		  new ol.style.Style({
		    image: new ol.style.Circle({
		      radius: 5,
		      stroke: new ol.style.Stroke({
		      color: '#073A68',
		      width: 3
		    }),

		      fill: new ol.style.Fill({
		        color: 'orange'
		      })
		    }),
		    geometry: function(feature) {
		      var coordinates = feature.getGeometry().getCoordinates();
		      coordinates.pop(); //remove last coordinate
		      return new ol.geom.MultiPoint(coordinates);
		    }
		  })
		];

	    geometry.forEachSegment(function(start, end) {
	    //console.log(i)
	    var dx = end[0] - start[0];
	    var dy = end[1] - start[1];
	    var rotation = Math.atan2(dy, dx);
	    
	    
	    //Only add arrow to last segment
	    if (end[0] == geometry.getLastCoordinate()[0]){
	    styles.push(new ol.style.Style({
	      geometry: new ol.geom.Point(end),
	      image: new ol.style.Icon({
	        src: 'arrow_blue.png',
	        anchor: [0.75, 0.5],
	        scale:.5,
	        rotateWithView: false,
	        rotation: -rotation
	      })
	    }));
	    }
	  });
	
	  return styles;
	};
	    
    
    

    
    //Background Layer
    var ocean_floor = new ol.layer.Tile({
        source: new ol.source.XYZ({
            //attributions: [attribution],
            url: 'http://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
            //wrapX: false //not doing anything?
        }),
         
    })


    //Map Controls
    var controls = [
        new ol.control.Attribution(),
        new ol.control.MousePosition({
            undefinedHTML: 'outside map',
            projection: 'EPSG:4326',
            coordinateFormat: function(coordinate) {
                return ol.coordinate.toStringHDMS(coordinate);
            },
            className: ['ol-mouse-position', 'white_label']
        }),

        new ol.control.Zoom(),
        new ol.control.ScaleLine(),
    ];



    //Create Map Object
    var map = new ol.Map({
        layers: [ocean_floor],
        controls: controls,
        renderer: 'canvas',
        target: 'map',
        interactions: ol.interaction.defaults({
            mouseWheelZoom: false,
            /*             DragZoom:false, */
            /*             dragPan: false */
        }),
        view: new ol.View({
            center: ol.proj.transform([-160, 42], 'EPSG:4326', 'EPSG:3857'),
/* 			center: ol.proj.transform([-40, 36], 'EPSG:4326', 'EPSG:3857'), */
            zoom: 3
        })
    });

    //When user zooms in, redraw "selected" points on map (to account for clustering)
    map.getView().on('change:resolution', function() {
        calculate_distances()
/*         update_map() */
    })

    var selected_style = [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            stroke: new ol.style.Stroke({
                color: 'white',
                width: 2
            })
        }),
    })];

    // a select interaction to handle points within pathways
    var select = new ol.interaction.Select({
	        style: selected_style 
        })

    map.addInteraction(select);
    
    
    var mainStyle = [new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 6
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
];
  var otherStyle = [new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#073A68',
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
];


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

    
    var collection = new ol.Collection();
    var collection2 = new ol.Collection();



	bezierLayer =new ol.layer.Vector({source: new ol.source.Vector()});
	map.addLayer(bezierLayer); 
	
	
	
	  
	  

	bezierOverlay = new ol.layer.Vector({
	  map: map,
	  source: new ol.source.Vector({
	    features: collection2,
	    useSpatialIndex: false // optional, might improve performance
	  }),
	  //style: overlayStyle,
	  updateWhileAnimating: true, // optional, for instant visual feedback
	  updateWhileInteracting: true // optional, for instant visual feedback
	});
	
		featureOverlay = new ol.layer.Vector({
	  map: map,
	  source: new ol.source.Vector({
	    features: collection,
	    useSpatialIndex: false // optional, might improve performance
	  }),
	  style: path_style,
	  updateWhileAnimating: true, // optional, for instant visual feedback
	  updateWhileInteracting: true // optional, for instant visual feedback
	});
	
	//featureOverlay.getSource().addFeature(feature);
	//featureOverlay.getSource().removeFeature(feature);


    var modify = new ol.interaction.Modify({
        features: collection,
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function(event) {
            return ol.events.condition.shiftKeyOnly(event) &&
                ol.events.condition.singleClick(event);
        }
    });

    map.addInteraction(modify);

	//Whenever a feature is added to the pathway layer
	source_pathway.on('addfeature', function(evt) {
	
			//Defaults to true, check for false later in this function
			new_branch = true;

			var new_branch_linestring = evt.feature.getGeometry();
			var new_branch_start_node = new ol.geom.Point(new_branch_linestring.getFirstCoordinate());
			var new_branch_end_node = new ol.geom.Point(new_branch_linestring.getLastCoordinate());
					
			++branch_no;
			
			//Create a feature id for new branch
			evt.feature.setId(branch_no);

				
		   
			evt.feature.set('order',branch_no); // for now, later sort by geographic location
			 
			
			if (branch_no == 0)
				evt.feature.set('color','red')
			else
			    evt.feature.set('color','black');
				
			evt.feature.source=[]; //list of branch ids that branch from this one
			
			//Defaults settings. Will be overriden if necessary within the loop below	
			evt.feature.starting_distance = 0; 
			evt.feature.max_distance =formatLength(new_branch_linestring)
			evt.feature.origin_id = evt.feature.getId(); //itself		
			
			//check to see if new feature is branching off or continuing an existing feature
			source_pathway.getFeatures().every(function(existing_branch_feature,i){	
						
				//Reached last added feature, which is the new_branch		
				if (i == source_pathway.getFeatures().length-1){
					//console.log ( 'reached itself!',i)
					return false;
				}
					
				
				
				existing_branch_linestring = existing_branch_feature.getGeometry();
				
				//If start node of new branch does not intersects with the existing branch, return true to skip to the next branch
				if (!existing_branch_linestring.intersectsExtent(new_branch_start_node.getExtent()))
					return true
					
						
				
				//Check if new branch is simply a continuation of the existing branch
				if (new_branch_linestring.getFirstCoordinate()[0] == existing_branch_linestring.getLastCoordinate()[0] &&
				new_branch_linestring.getFirstCoordinate()[1] == existing_branch_linestring.getLastCoordinate()[1])
				{
					--branch_no;
					
					//Remove existing branch from featureOverlay 
					featureOverlay.getSource().removeFeature(existing_branch_feature);
					
					//Remove new branch from featureOverlay, and source_pathway
					featureOverlay.getSource().removeFeature(evt.feature);
					
					
					//find  bezier feature for original branch
					bezier_feature = bezierLayer.getSource().getFeatureById(existing_branch_feature.getId());
									
				
					//bezierOverlay.getSource().removeFeature()
					source_pathway.removeFeature(evt.feature);
												
					
					//Transfer each coordinate from new branch to the existing branch
					new_branch_linestring.getCoordinates().map(function(c,i){
						if (i>0) //don't duplicate the first node 
							existing_branch_linestring.appendCoordinate(c);
					})
					
					//Update branch max_distance
					existing_branch_feature.max_distance = 
					    existing_branch_feature.starting_distance + formatLength(existing_branch_linestring);
					
					//Add new, longer branch back to the featureOverlay
					featureOverlay.getSource().addFeature(existing_branch_feature);	
					
					
			        var line = turf.linestring(existing_branch_linestring.getCoordinates());
		            
		            var curved = turf.bezier(line);					
					curve_feature = (new ol.format.GeoJSON()).readFeature(curved);
					curve_feature.setId(existing_branch_feature.getId());	
					
					
					if (evt.feature.getId()==0)
					    curve_feature.setStyle(mainStyle)
					else
						curve_feature.setStyle(otherStyle)
					
					bezier_feature.getGeometry().setCoordinates(curve_feature.getGeometry().getCoordinates());
													
					
					new_branch = false;
					
					return false;	//this breaks out of the iteration through all the features				
					
				}
				
				//Otherwise, add new branch to the list of branches originate from this existing branch
				existing_branch_feature.source.push(evt.feature.getId());
				//console.log ( 'adding to source list');
						
				//Calculate distance of first node along the line it is branching off of
				start_dist = formatLength(existing_branch_linestring, new_branch_start_node);
				
					
				evt.feature.starting_distance = start_dist + existing_branch_feature.starting_distance;
				evt.feature.max_distance = evt.feature.starting_distance + formatLength(new_branch_linestring);
				evt.feature.origin_id = existing_branch_feature.getId();

				return false //this breaks out of the iteration through all the features	
					
								
			}) //end iteration through source_pathway features
			
			
			order_branches();
						
			//Calculate distances of each measurement to line;     
            calculate_distances();
            update_scatter();
            
			//Continuation of existing branch
			if 	(!new_branch)			     
				return;
				
            
            var line = turf.linestring(evt.feature.getGeometry().getCoordinates());
            
            var curved = turf.bezier(line);
			//curved.properties = { stroke: '#0f0' };
			
			curve_feature = (new ol.format.GeoJSON()).readFeature(curved);
			curve_feature.setId(evt.feature.getId());	
			
			
			if (evt.feature.getId()==0)
			    curve_feature.setStyle(mainStyle)
			else
				curve_feature.setStyle(otherStyle)
			
			console.log('adding bezier curve with id ', curve_feature.getId())
			//bezierOverlay.getSource().addFeature(curve_feature)
			bezierLayer.getSource().addFeature(curve_feature);
			
			//console.log('retrieving  bezier curve with id ', curve_feature.getId())
			
		
				
			//Set listener for changes to this feature
			evt.feature.on('change',function(evt){
			
				curr_branch_linestring = evt.target.getGeometry();
				curr_branch_start_node = new ol.geom.Point(curr_branch_linestring.getFirstCoordinate());
				
				origin_branch_feature = source_pathway.getFeatureById(evt.target.origin_id);			    
				origin_branch_linestring = origin_branch_feature.getGeometry(); 
				
				//Cycle through existing features to see if start of new branch was appended to an existing branch
				//TO DO 
				
				
				//Recalculate starting and maximum distances of feature	
				start_dist = formatLength(origin_branch_linestring, curr_branch_start_node);
					
				evt.target.starting_distance = start_dist + origin_branch_feature.starting_distance;
				evt.target.max_distance = evt.target.starting_distance + formatLength(curr_branch_linestring);
									
				//order_branches();
						
				calculate_distances()
				update_scatter()
				
				var line = turf.linestring(evt.target.getGeometry().getCoordinates());
            
	            var curved = turf.bezier(line);
				
				curve_feature = (new ol.format.GeoJSON()).readFeature(curved);
				//modified_feature = collection2.item(evt.target.getId());
				modified_feature = bezierLayer.getSource().getFeatureById(evt.target.getId())
				modified_feature.getGeometry().setCoordinates(curve_feature.getGeometry().getCoordinates());
				
			});
			
			 //console.log('Main branch has ' , source_pathway.getFeatureById(0).getGeometry().getCoordinates().length , 'nodes');
			
            
        });
        

    var draw; // global so we can remove it later
    function addInteraction() {
        draw = new ol.interaction.Draw({
            source: source_pathway,
            snapTolerance: 20,
            features: collection,
            wrapX: true,
            type: /** @type {ol.geom.GeometryType} */ ('LineString'),
            condition: ol.events.condition.Click,
            freehandCondition: ol.events.condition.noModifierKeys,
            style: new ol.style.Style({
             
             stroke: new ol.style.Stroke({
                 color: '#ffcc33',
                 width: 5
             }),
             image: new ol.style.Circle({
                 radius: 2,
                 fill: new ol.style.Fill({
                     color: '#ffcc33'
                 })
             })
         })

        });


        draw.on('drawstart',
            function(evt) {
            
           // set sketch
                sketch = evt.feature;
            }, this);

        map.addInteraction(draw);
    }


    addInteraction();



    function calculate_distances() {
        
        //No pathway has been drawn 
        if (source_pathway.getFeatures().length < 1) 
            return;
       
        selectedFeatures.clear();
        selected_data_points = [];


        var closest_feature, geometry, closestPoint;
        
        //cycle through all the datapoints and find closest feature
        
        source_measurements.getFeatures().map(function(feature, i) { //source_measurements or clusterSource
        	
                coordinate = feature.getGeometry().getCoordinates();
                closestPath = source_pathway.getClosestFeatureToCoordinate(coordinate);
                geometry = closestPath.getGeometry();
                
                closestPoint = geometry.getClosestPoint(coordinate);

                var feature_to_path_line = new ol.geom.LineString([coordinate, closestPoint]);
                var output = formatLength(feature_to_path_line)

                if (output < dist_threshold) {
/*                     selectedFeatures.push(feature); */
                    d = feature.get('data');
                    d.along_track_distance = 
                    	formatLength(geometry, new ol.geom.Point(closestPoint))+ closestPath.starting_distance ;
                    d.branch = closestPath;
                    selected_data_points.push(d)
                    
                }

            })

			
    clusterSource.getFeatures().map(function(feature, i) { //source_measurements or clusterSource
        	
                coordinate = feature.getGeometry().getCoordinates();
                closestPath = source_pathway.getClosestFeatureToCoordinate(coordinate);
                geometry = closestPath.getGeometry();
                
                closestPoint = geometry.getClosestPoint(coordinate);

                var feature_to_path_line = new ol.geom.LineString([coordinate, closestPoint]);
                var output = formatLength(feature_to_path_line)

                if (output < dist_threshold) {
                    selectedFeatures.push(feature);                   
                }

            })
       
        

        if (selected_data_points.length > 1)
            data = selected_data_points;
        
        //update();


    }

    var wgs84Sphere = new ol.Sphere(6378137);

    //Function that returns length from start of line to predetermined point
    // or, if no point is defined, to the end of the line. 
    var formatLength = function(line, point) {
        point = point || new ol.geom.Point(line.getLastCoordinate());

        var length;
        var coordinates = line.getCoordinates();
        length = 0;
        var sourceProj = map.getView().getProjection();
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');

            //Check if point is in this segment
            var segment = new ol.geom.LineString([coordinates[i], coordinates[i + 1]]);


            if (segment.intersectsExtent(point.getExtent())) {
                var c2 = ol.proj.transform(point.getCoordinates(), sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
                break
            } else {
                var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
                length += wgs84Sphere.haversineDistance(c1, c2);
            }


        }

        return (Math.round(length / 1000 * 100) / 100);;

    };



    var selectedFeatures = select.getFeatures();




    var displayFeatureInfo = function(pixel) {

        var feature = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return feature;
        });
        if (feature) {
            var mean_value = feature.get('features').reduce(function(prev, curr, index, array) {
                if (cValue(curr.get('data')))
                    return (prev + cValue(curr.get('data')))
                else
                    return (prev);
            }, 0) / feature.get('features').length;


            map_tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            map_tooltip.html(
                    '<b>Mean Value:</b> ' + Math.round(mean_value * 10) / 10

                )
                .style('left', (pixel[0]) + 60 + 'px')
                .style('top', (pixel[1] + 60) + 'px');

        } else {
            map_tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        }
    };


    map.on('pointermove', function(evt) {
        if (evt.dragging) {
            return;
        }
        //  displayFeatureInfo(map.getEventPixel(evt.originalEvent));  TO FIX (tooltip for map markers)
    });

    //Clustering
    var clusterSource = new ol.source.Cluster({
        distance: 10,
        source: source_measurements
    });

    var styleCache = {};
    var clusters = new ol.layer.Vector({
        source: clusterSource,
        style: function(feature, resolution) {
            var size = feature.get('features').length;

            //Find mean value for the property in each cluster.
            var mean_value = feature.get('features').reduce(function(prev, curr, index, array) {
                if (cValue(curr.get('data')))
                    return (prev + cValue(curr.get('data')))
                else
                    return (prev)

                ;
            }, 0);


            mean_value = mean_value / size;

            style = [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),

                    fill: new ol.style.Fill({
                        color: cMap(mean_value)

                    })
                }),
            })];


            return style;
        }

    });


    map.addLayer(clusters);
    

    var snap = new ol.interaction.Snap({
        //source: source_pathway;
        features: collection        
    });

    map.addInteraction(snap);
    
    update_map()
    

};

function update_scatter(){

    //Update color scale
    var start = Math.floor(d3.min(all_data, cValue));
    var stop = d3.max(all_data, cValue);
    var step = Math.round((stop - start) / 10)

    lin_logscale
        .domain([start, stop])


    //Create padding for the x and y axis on the scatter plot
    var xbuffer = (d3.max(data, xValue) - d3.min(data, xValue)) / 10;
    var ybuffer = (d3.max(data, yValue) - d3.min(data, yValue)) / 10;

    xScale.domain([d3.min(data, xValue) - xbuffer, d3.max(data, xValue) + xbuffer]);
    yScale.domain([d3.min(data, yValue) - ybuffer, d3.max(data, yValue) + ybuffer]);

    xAxis.scale(xScale)
    //yAxis.scale(yScale)

    //grid_axis.scale(yScale)

    //Update scatter plot axis
    selectValue = d3.select('#select_y_axis').property('value');
    ylabel = d3.select('#select_y_axis').node().options[selectValue].text;
    d3.select(".ylabel")
        .transition()
        .duration(750)
        .text(ylabel);

    selectValue = d3.select('#select_x_axis').property('value');
    xlabel = d3.select('#select_x_axis').node().options[selectValue].text;
    d3.select(".xlabel")
        .transition()
        .duration(750)
        .text(xlabel);


    scatterplot.selectAll(".y.axis")
        .call(yAxis);

    scatterplot.selectAll(".x.axis")
        .call(xAxis);

    scatterplot.selectAll(".y.axis.grid")
        .call(grid_axis
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )
        .attr("opacity", .2)
        .attr("stroke", "lightgrey")


	max_dist = 0;	

    // If x is along track distance 
    
	//Find maximum branch dist
	source_pathway.getFeatures().map(function(feature){
		if (feature.max_distance > max_dist)
			max_dist = feature.max_distance	
	})

  
  if (xlabel == 'Along Track Distance (km)' ){
	  xScale.domain([0, max_dist])
	  xAxis.scale(xScale)
  }
 
  branch_yScale.domain([0,source_pathway.getFeatures().length ]);
    
      	
		scatterplot.selectAll(".track").remove();
		

		    
		scatterplot.selectAll(".x.axis")
		.transition().duration(1500).ease("sin-in-out")
		.call(xAxis);
		        		        
	    //Iterate through branches/features and draw svg path lines 						
	    source_pathway.getFeatures().map(function(branch, i) {
	        
	        //console.log('branch.order is ', branch.get('order'));
	        var branch_line = [{
	            'x': branch.starting_distance,
	            'y': branch.get('order')+0.1
	        }, {
	            'x': branch.max_distance,
	            'y': branch.get('order')+0.1
	        }];

			//console.log('branch.order is', branch.order);
	        scatterplot.append("path")
	            .datum(branch_line)
		        .attr("class", "track")
	            .attr("id", function() {
	                return ('t_' + branch.get('order'))
	            })
	            .attr("d", branch_line_function)
	            .style('stroke', branch.get('color'))

	    });
	    
	    
	     //create subaxis for each branch
		    y_scales = [];
		    var y_axis = [];

		    source_pathway.getFeatures().map(function(branch,i){

		        ys = d3.scale.linear()
		            .range([branch_yScale(branch.get('order') + 0.1), branch_yScale(branch.get('order') + 0.8)])
		            .domain(yScale.domain())
		            .clamp(true);
		            

		        y_scales[branch.get('order')]=ys;

		        yax = d3.svg.axis()
		            .scale(ys)
		            .orient("left")
		            .ticks(4)
		            .tickSize(-xScale(branch.max_distance - branch.starting_distance), 0, 0)

		        y_axis.push({
		            "axis": yax,
		            "branch": branch
		        })

		    });

		
            //Update position of all yaxis.    
		    yaxes = scatterplot.selectAll(".branch_y").data(y_axis);
		    
		    yaxes.exit().remove();

		    yaxes
		        .enter()
		        .append("g")
		        .attr("class", "axis axis--y branch_y grid")
		        .attr("transform", function(d) {
		            return "translate(" + xScale(d.branch.starting_distance) + ",0)"
		        })
		        .each(function(d) {
		            d3.select(this).call(d.axis)
		        })


			yaxes
		        .transition()
		        .duration(500).ease("sin-in-out")
		        .attr("transform", function(d) {
		            return "translate(" + xScale(d.branch.starting_distance) + ",0)"
		        })
		        .each(function(d) {
		            d3.select(this).call(d.axis)
		        });
		        
	        axes_rect = scatterplot.selectAll(".axes_background").data(y_axis);

		    axes_rect.exit().remove()

		    axes_rect
		        .enter()
		        .append("rect")
		        .attr("class", "axes_background")
		        .attr("x", function(d) {
		            return xScale(d.branch.starting_distance)
		        })
		        .attr("y", function(d) {
		            return d.axis.scale().range()[1]
		        })
		        .attr("width", function(d) {
		            return xScale(d.branch.max_distance) - xScale(d.branch.starting_distance)
		        })
		        .attr("height", function(d) {
		            return (d.axis.scale().range()[0] - d.axis.scale().range()[1])
		        })
		        .on("mousemove", function(d, i) {
		            xx = xScale.invert(d3.mouse(this)[0]);
		            yy = Math.floor(branch_yScale.invert(d3.mouse(this)[1]));
		            
		            
		            console.log( 'branch level ', yy);
					
		        })
		        .on("mouseout", function() {
		           		        });




		    axes_rect
		        .transition()
		        .duration(500).ease("sin-in-out")
		        .attr("x", function(d) {
		            return xScale(d.branch.starting_distance)
		        })
		        .attr("y", function(d) {
		            return d.axis.scale().range()[1]
		        })
		        .attr("width", function(d) {
		            return xScale(d.branch.max_distance) - xScale(d.branch.starting_distance)
		        })
		        .attr("height", function(d) {
		            return (d.axis.scale().range()[0] - d.axis.scale().range()[1])
		        })

		//Append "connectors" between connected branches
		
			scatterplot.selectAll(".connector").remove();
			    clines = [];
	
			    connectors = source_pathway.getFeatures().filter(function(feature) {
			        return feature.origin_id != feature.getId() //Branch has an origin other than itself
			         })
	
				
			    connectors.map(function(c) {
			    
		            clines.push([{
			                'x': c.starting_distance,
			                'y': c.get('order')+0.1
			            }, {
			                'x': c.starting_distance,
			                'y': source_pathway.getFeatureById(c.origin_id).get('order')+0.1
			            }])

			    })
	
	
				
			    clines.map(function(cl) {
			        scatterplot.append("path")
			            .datum(cl)
			            .attr("class", "connector")
			            .attr("d", branch_line_function)
	
			    })
					
		    
		    //Update old elements 
    dot = scatterplot.selectAll(".dot")
        .data(selected_data_points.filter(function(d) {
            return !isNaN(yMap(d)) & !isNaN(xMap(d)) & !isNaN(cValue(d))
        }));

    dot
        .transition()
        .duration(750)
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy",  function(d) {
		            	return y_scales[d.branch.get('order')](yValue(d));
		 })
        .style("fill", function(d) {
            return cMap(cValue(d));
        })


    dot.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", function(d) {
		            	return y_scales[d.branch.get('order')](yValue(d));
		 })
		        
		        
        .style("fill", function(d) {
            return cMap(cValue(d));
        })
        //.on('mouseover',function(d){console.log (d.branch.get('order'))});
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)


    dot.exit()
        .transition()
        .duration(750)
        .style("fill-opacity", 1e-6)
        .remove();



		//Update Legend

    legend.remove();

    legend_box.remove();

    selectValue = d3.select('#select_color_axis').property('value');
    clabel = d3.select('#select_color_axis').node().options[selectValue].text;

    legend_box = scatterplot.append("g");

    legend_box.append("text")
        .attr("transform", "rotate(90), translate(120,-970)")
        .style("text-anchor", "middle")
        .text(clabel)
        .attr("class", "ylabel");


    legend = legend_box
        .attr("transform", "translate(80,80)")


    .selectAll(".legend")
        .data(d3.range(0, 1.1, .1))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 22 + ")";
        });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", cScale);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {


            if (Math.round(lin_logscale.invert(d)) > 1) {
                return Math.round(lin_logscale.invert(d))

            } else {
                return (Math.round(lin_logscale.invert(d) * 100) / 100)
            };
        })


		     
		   
	
}

function update() {


    //Update color scale
    var start = Math.floor(d3.min(all_data, cValue));
    var stop = d3.max(all_data, cValue);
    var step = Math.round((stop - start) / 10)

    lin_logscale
        .domain([start, stop])


    //Create padding for the x and y axis on the scatter plot
    var xbuffer = (d3.max(data, xValue) - d3.min(data, xValue)) / 10;
    var ybuffer = (d3.max(data, yValue) - d3.min(data, yValue)) / 10;

    xScale.domain([d3.min(data, xValue) - xbuffer, d3.max(data, xValue) + xbuffer]);
    yScale.domain([d3.min(data, yValue) - ybuffer, d3.max(data, yValue) + ybuffer]);

    xAxis.scale(xScale)
    yAxis.scale(yScale)

    grid_axis.scale(yScale)



    //Update scatter plot axis
    selectValue = d3.select('#select_y_axis').property('value');
    ylabel = d3.select('#select_y_axis').node().options[selectValue].text;
    d3.select(".ylabel")
        .transition()
        .duration(750)
        .text(ylabel);

    selectValue = d3.select('#select_x_axis').property('value');
    xlabel = d3.select('#select_x_axis').node().options[selectValue].text;
    d3.select(".xlabel")
        .transition()
        .duration(750)
        .text(xlabel);


    scatterplot.selectAll(".y.axis")
        .call(yAxis);

    scatterplot.selectAll(".x.axis")
        .call(xAxis);

    scatterplot.selectAll(".y.axis.grid")
        .call(grid_axis
            .tickSize(-width, 0, 0)
            .tickFormat("")
        )
        .attr("opacity", .2)
        .attr("stroke", "lightgrey")



    //Update old elements 
    dot = scatterplot.selectAll(".dot")
        .data(data.filter(function(d) {
            return !isNaN(yMap(d)) & !isNaN(xMap(d)) & !isNaN(cValue(d))
        }));

    dot
        .transition()
        .duration(750)
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) {
            return cMap(cValue(d));
        })


    dot.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) {
            return cMap(cValue(d));
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)


    dot.exit()
        .transition()
        .duration(750)
        .style("fill-opacity", 1e-6)
        .remove();


    //Update Legend

    legend.remove();

    legend_box.remove();

    selectValue = d3.select('#select_color_axis').property('value');
    clabel = d3.select('#select_color_axis').node().options[selectValue].text;

    legend_box = scatterplot.append("g");

    legend_box.append("text")
        .attr("transform", "rotate(90), translate(120,-970)")
        .style("text-anchor", "middle")
        .text(clabel)
        .attr("class", "ylabel");


    legend = legend_box
        .attr("transform", "translate(80,30)")


    .selectAll(".legend")
        .data(d3.range(0, 1.1, .1))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 22 + ")";
        });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", cScale);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {


            if (Math.round(lin_logscale.invert(d)) > 1) {
                return Math.round(lin_logscale.invert(d))

            } else {
                return (Math.round(lin_logscale.invert(d) * 100) / 100)
            };
        })



};


function update_map() {
    //Update map
    all_points = [];

    mdata = all_data.filter(function(el) {
        return el.prs >= +d3.select('#slider4textmin').text() && el.prs <= +d3.select('#slider4textmax').text() && el.date >= new Date(d3.select('#slider3textmin').text()) && el.date <= new Date(d3.select('#slider3textmax').text())

    });

	

    //Add a point to the map for each measurement
    mdata.map(function(d) {
        if (!isNaN(yMap(d)) & !isNaN(xMap(d)) & !isNaN(cValue(d))) {
            //console.log(d[selected_var])
            var coordinate = ol.proj.transform([d.lon, d.lat], 'EPSG:4326', 'EPSG:3857');
            var point = new ol.geom.Point(coordinate, 'XY');
            all_points.push(new ol.Feature({
                geometry: point,
                name: d.ID,
                data: d
            }));
        }
    });


    source_measurements.clear();
    source_measurements.addFeatures(all_points);




}