 
/*
 d3.select("#clear_button").on("click", function() { 
	featureOverlay.getSource().clear();
    source_pathway.clear();
   
    var selected_data_points = [];
	var branch_no = -1;
	var max_dist = 0;
 
 });
*/

 
 
 
 //Dropdown menu for X Axis
	    d3.select("#select_x_axis").on("change", function() {
	        if (this.value == 0) {
	
	            xValue = function(d) { return d.along_track_distance;}, // data -> value
				xScale = d3.scale.linear().range([0, width]);
 
	        }
	        
	          if (this.value == 1) {
	
	            xValue = function(d) { return d.lat;}, // data -> value
				xScale = d3.scale.linear().range([0, width]);
				 
	        }
	        
	          if (this.value == 2) {
	
	            xValue = function(d) { return d.lon;}, // data -> value
				xScale = d3.scale.linear().range([0, width]);
   
	        }
	        
	          if (this.value == 3) {
	
	            xValue = function(d) { return d.temp;}, // data -> value
				xScale = d3.scale.linear().range([0, width]);
    
	        }
	        
	        
	        if (this.value == 4) {
	
	            xValue = function(d) { return d.sal;}, // data -> value
				xScale = d3.scale.linear().range([0, width]);
				
    
	        }
	        
	        
	        update_scatter()

	        
	        });
	        
	        		 
			 //Dropdown menu for Y Axis
	    d3.select("#select_y_axis").on("change", function() {
	    
	    
	     if (this.value == 0) {
	
	            yValue = function(d) { return d.cs137;}, // data -> value
				yScale = d3.scale.pow().exponent(.5).range([height, 0]);
				 
	        }
	        
	         if (this.value == 1) {
	
	            yValue = function(d) { return d.cs134;}, // data -> value
				yScale = d3.scale.pow().exponent(.5).range([height, 0]);
				 
	        }


	    
	        if (this.value == 2) {
	
	            yValue = function(d) { return d.date.valueOf();}, // data -> value
				yScale = d3.time.scale().range([height, 0]);
 
	        }
	        
	         if (this.value == 3) {
	
	            yValue = function(d) { return d.lat;}, // data -> value
				yScale = d3.scale.linear().range([height, 0]);
   
	        }

	        
	         	        
	          if (this.value == 4) {
	
	            yValue = function(d) { return d.lon;}, // data -> value
				yScale = d3.scale.linear().range([height, 0]);
   
	        }
	        
	          if (this.value == 5) {
	
	            yValue = function(d) { return d.temp;}, // data -> value
				yScale = d3.scale.linear().range([height, 0]);
    
	        }
	        
             if (this.value == 6) {
	
	            yValue = function(d) { return d.sal;}, // data -> value
				yScale = d3.scale.linear().range([height, 0]);
    
	        }
	        
	        
	        
	         if (this.value == 7) {
	
	            yValue = function(d) { return d.prs;}, // data -> value
				yScale = d3.scale.linear().range([0, height]);

    
	        }
	        
	        update_scatter()

	        
	        });



 //Dropdown menu for Color Axis
	    d3.select("#select_color_axis").on("change", function() {
	    
	     
	     lin_logscale = d3.scale.pow().exponent(.2)
		 		.range([1,0])
	    
	            if (this.value == 0) {
	
	            cValue = function(d) {return d.cs137;},
	            
				
				update_scatter()
				update_map()

				return;
				 
	        }
	    
	    	 if (this.value == 1) {
	
	            cValue = function(d) {return d.cs134;},
	           	           
				update_scatter()
				update_map()

				return;
 
	        }
	        
			// If the function gets this far, switch to a linear color scale

			lin_logscale = d3.scale.linear()
			    .range([1,0])			
	        
	        if (this.value == 2) {
	
	            cValue = function(d) {return d.lat;}
 
	        }
	        
	  
	        
	         if (this.value == 3) {
	
	            cValue = function(d) {return d.lon;}
 
	        }
	        
	         if (this.value == 4) {
	
	            cValue = function(d) {return d.temp;}
 
	        }
	        
	           if (this.value == 5) {
	
	            cValue = function(d) {return d.sal;}
 
	        }
	        
	           if (this.value == 6) {
	
	            cValue = function(d) {return d.prs;}
 
	        }
	        update_scatter()
	        update_map();

	        
	        	        
	        });






	        		     
