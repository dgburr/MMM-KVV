/* Magic Mirror
 * Module: MMM-KVV
 *
 * By yo-less
 * MIT Licensed.
 */

Module.register("MMM-KVV", {

    defaults: {
		apiBase: 'http://live.kvv.de/webapp/departures/bystop/',
		apiKey: '377d840e54b59adbe53608ba1aad70e8',
		stopID: 'de:8212:89',
		maxConn: '8',
		lines: '',
		direction: '',
		labelRow: true,
		stopName: 'KVV',
        reload: 1 * 60 * 1000       // every minute
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        };
    },

    getStyles: function () {
        return ["MMM-KVV.css"];
    },

    start: function () {
		var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
		setInterval(
			function()
			{self.sendSocketNotification("CONFIG", self.config);}
			,this.config.reload);
    },

		
    socketNotificationReceived: function (notification, payload) {
		if (notification === "TRAMS" + this.config.stopID) {
			this.kvv_data = payload;
			this.config.stopName = payload.stopName;
			this.updateDom();			
	    }
	},

    getDom: function () {
					
		// Auto-create MagicMirror header

		var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        wrapper.appendChild(header);
	
		// Loading data notification
		
	    if (!this.kvv_data) {
            var text = document.createElement("div");
            text.innerHTML = this.translate("LOADING");
            text.className = "small dimmed";
            wrapper.appendChild(text);
        
		} else {
			
		// Create connection table once data is received
			
			var table = document.createElement("table");
			table.classList.add("small", "table");
			table.border='0';
			
			if (this.config.labelRow) {
				table.appendChild(this.createLabelRow());
			}
			
			table.appendChild(this.createSpacerRow());
				
		// Listing selected connections
			var counter = 0;
			
			for (var f in this.kvv_data.departures){
				
				var tram = this.kvv_data.departures[f];
				
				if(this.config.lines !== '' ) {
				
					if(this.kvv_lines(tram.route, this.config.lines)) {
																	
								if (this.config.direction === '1') {
									if (tram.direction === '1') {
											table.appendChild(this.createDataRow(tram));
											counter = counter + 1;
									}
								} else if (this.config.direction === '2') {
									if (tram.direction === '2') {
											table.appendChild(this.createDataRow(tram));
											counter = counter + 1;
									}
								} else {
									table.appendChild(this.createDataRow(tram));
									counter = counter + 1;
								}
					} 
				
				} else {
					
					if (this.config.direction === '1') {
							if (tram.direction === '1') {
									table.appendChild(this.createDataRow(tram));
									counter = counter + 1;
							}
						} else if (this.config.direction === '2') {
							if (tram.direction === '2') {
									table.appendChild(this.createDataRow(tram));
									counter = counter + 1;
							}
						} else {
							table.appendChild(this.createDataRow(tram));
							counter = counter + 1;
						}
				}
				
				}
								
			if (counter == 0) {
				this.hide();
			} else {
				wrapper.appendChild(table);
			}
				
		}
					
		return wrapper; 
		
	},
	
	// Function checking whether a line is wanted by the user
	
	kvv_lines: function(queried_line, lines_config) {
	
		//Remove spaces in the config parameter (if any)
		var lines_clean = lines_config.replace(/\s+/g,'');
		
		//Create a line array from the config parameter
		var lines_array = lines_clean.split(",");
		
		//Check if the line in question is in the config
		
		for (var i=0;i<lines_array.length;i++) {
			if(lines_array[i] == queried_line)
			{return true;}
		}
	return false;
	},

    createLabelRow: function () {
        var labelRow = document.createElement("tr");
		
        var lineLabel = document.createElement("th");
		lineLabel.className = "line";
        lineLabel.innerHTML = this.translate("LINE");
        labelRow.appendChild(lineLabel);

        var destinationLabel = document.createElement("th");
		destinationLabel.className = "destination";
        destinationLabel.innerHTML = this.translate("DESTINATION");
        labelRow.appendChild(destinationLabel);

        var departureLabel = document.createElement("th");
		departureLabel.className = "departure";
        departureLabel.innerHTML = this.translate("DEPARTURE");
        labelRow.appendChild(departureLabel);
		
		return labelRow;
    },

    createSpacerRow: function () {
        var spacerRow = document.createElement("tr");
		
		var spacerHeader = document.createElement("th");
		spacerHeader.className = "spacerRow";
		spacerHeader.setAttribute("colSpan", "3");
		spacerHeader.innerHTML = "";
		spacerRow.appendChild(spacerHeader); 
      	
		return spacerRow;
    },

    createDataRow: function (data) {
        var row = document.createElement("tr");

        var line = document.createElement("td");
		line.className = "line";
        line.innerHTML = data.route;
        row.appendChild(line);

        var destination = document.createElement("td");
        destination.innerHTML = data.destination;
        row.appendChild(destination);

        var departure = document.createElement("td");
		departure.className = "departure";
        if (data.time == "0"){
		departure.innerHTML = this.translate("NOW");
		} else if (data.time.charAt(2)==":"){
		departure.innerHTML = data.time + this.translate("TIME");
		} else {
		departure.innerHTML = data.time;
		}
        row.appendChild(departure);

        return row;
    }

});