/** Magic Mirror
 * Module: MMM-PimaticFloorplan
 * 
 * marcelwinh
 * MIT Licensed.
 */

Module.register("MMM-PimaticFloorplan", {
        defaults: {
		/* with the pimatic http binding, all changes can directly be pushed to the mirror. */
		/* please see documentation of this module how this works. */
		draft: false, // if true, all lights and windows and the label names are shown; if false, get states from pimatic
		pimatic: {
			host :'pimatic',
			port : 8080,
			user : '',
			passwd : '',
		},
		floorplan: {
			/* store your image as 'floorplan.png' to avoid git repository changes. */
			image: "floorplan-default.png", // located in subfolder 'images'
			width: 400, // image width
			height: 333, // image height
		},
		light: {
			imageOn: "lightOn.png", // located in subfolder 'images'
			imageOff: "lightOff.png", // located in subfolder 'images'
			width: 19, // image width
			height: 19, // image height
		},
		window: {
			defaultColor: "red", // css format, i.e. color names or color codes
		},
		label: {
			defaultColor: "grey", // css format
			defaultSize: "medium", // value of font-size style, e.g. xx-small, x-small, small, medium, large, x-large, xx-large, 1.2em, 20px
		},
		lights: {
			/* list all light items to be shown (must be of pimatic type Switch or Dimmer), examples below. */
			// Light_Kitchen: { left: 50, top: 50, pimaticId: 'lightKitchen.state'}, // name must match pimatic item name (case sensitive!)
		},
		windows: {
			/* list all window / door contacts to be shown (must be of pimatic type Switch or Contact), examples below. */
			/* name must match pimatic item name (case sensitive!) */
			/* Supported formats are rectangles, single wings, and wings with counterwindow. */
			// Window_Kueche:           { left: 220, top: 395, radius: 25, midPoint: "bottom-left", pimaticId: "fenster-kueche.contact", default: true},
			// Window_SZ_rechts:           { left: 72, top: 395, radius: 25, midPoint: "bottom-left", pimaticId: "fenster-rechts.contact", default: true},
		},
		labels: {
			/* list all strings to be shown (resonable for pimatic types String and Number), examples below. */
			// Temperature_Kitchen: { left: 200, top: 50 , pimaticId: "temperature-kitchen.temperature"}, // label with default color and size
			// Temperature_Livingroom: { left: 200, top: 100, color: "white", size: "x-small" , pimaticId: "temperature-livingroom.temperature"}, // small and white label
			// Temperature_Front_Door: { left: 200, top: 150, color: "white", decimals: 2 , pimaticId: "temperature-front-door.temperature"}, // small and show two decimal places of float value
			// Temperature_Back_Door: { left: 200, top: 200, prefix: "outside: ", postfix: "°C" , pimaticId: "temperature-back-door.temperature"}, // label with prefix and postfix
		},
        },

	start: function() {
		Log.info("Starting module: " + this.name);

		if (this.config.draft) {
			Log.info("pimatic items are not loaded because module is in draft mode");
		} else if (this.valuesExist(this.config.windows) || this.valuesExist(this.config.lights) || this.valuesExist(this.config.labels)) {
			// Log.info("Requesting initial item states...");
			this.sendSocketNotification("CONNECT", this.config); // request initial item states
		} else {
			Log.info("No items configured.");
		}
	},
	valuesExist: function(obj) { return obj !== 'undefined' && Object.keys(obj).length > 0; },

	socketNotificationReceived: function(notification, payload) {
		//
		// received notification about pimatic variables values
		// e.g. contact sensor
		if (notification === 'PIMATIC_VARIABLES' ){
			var self = this;
			variables = payload;
			variables.forEach(function(entry) {
				for(var key in self.config.windows){
					var element = self.config.windows[key];
					if (element.pimaticId === entry.name) {
						self.updateDivForItem(key, entry.value);
					}
				}
				for(var key in self.config.lights){
					var element = self.config.lights[key];
					if (element.pimaticId === entry.name) {
						self.updateDivForItem(key, entry.value);
					}
				}
				for(var key in self.config.labels){
					var element = self.config.labels[key];
					if (element.pimaticId === entry.name) {
						self.updateDivForItem(key, entry.value);
					}
				}
			});
		}
		//
		// received a notification about changed pimatic values
		// e.g. temperature
		if(notification === 'PIMATIC_ATTRIBUTE_CHANGED') {
			var self = this;
            var attrEvent = payload;
            var receivedDeviceAttribute = attrEvent.deviceId + '.' + attrEvent.attributeName
			for(var key in self.config.windows){
				var element = self.config.windows[key];
				if (element.pimaticId === receivedDeviceAttribute) {
					self.updateDivForItem(key, attrEvent.value);
				}
			}
			for(var key in self.config.lights){
				
				var element = self.config.lights[key];
				if (element.pimaticId === receivedDeviceAttribute) {
					self.updateDivForItem(key, attrEvent.value);
				}
			}
			for(var key in self.config.labels){
				var element = self.config.labels[key];
				if (element.pimaticId === receivedDeviceAttribute) {
					self.updateDivForItem(key, attrEvent.value);
				}
			}
		};
	},
	updateDivForItem: function(item, state) {
		if (item in this.config.lights) {
			var visible = state;
			this.setVisible("pimatic_" + item, visible);
			this.setVisible("pimatic_" + item + '_off', !visible);
		} else if (item in this.config.windows) {
			var visible = state === !this.config.windows[item].default;
			this.setVisible("pimatic_" + item, visible);
			if (this.config.windows[item].counterwindow !== 'undefined' && this.config.windows[item].radius !== 'undefined') {
				this.setVisible("pimatic_" + item + "_counterwindow", visible);
			}
		} else if (item in this.config.labels) {
			var element = document.getElementById("pimatic_" + item);
			if (element != null) {
				element.innerHTML = this.config.labels[item].image ? "<img src='" + this.file("/images/" + this.config.labels[item].image) + "'/> " + this.formatLabel(state, this.config.labels[item]) : this.formatLabel(state, this.config.labels[item]);
			}
		}
	},
	setVisible: function(id, value) {
		var element = document.getElementById(id);
		if (element != null) {
			element.style.display = value ? "block" : "none";
		}
	},
	formatLabel: function(value, config) {
		var formattedValue = value;
		if (!isNaN(config.decimals) && !isNaN(value)) {
			formattedValue = parseFloat(value).toFixed(config.decimals);
		}
		return (typeof config.prefix !== 'undefined' ? config.prefix : "") + formattedValue + (typeof config.postfix !== 'undefined' ? config.postfix : "");
	},

	getDom: function() {
		var floorplan = document.createElement("div");
		
		floorplan.style.cssText = "background-image:url(" + this.file("/images/" + this.config.floorplan.image) + ");"
			+ "top:-" + this.config.floorplan.height + "px;width:" + this.config.floorplan.width + "px;height:" + this.config.floorplan.height + "px;";
		this.appendWindows(floorplan);
		this.appendLights(floorplan);
		this.appendLabels(floorplan);
		return floorplan;
	},

	appendLights: function(floorplan) {
		for (var item in this.config.lights) {
			var position = this.config.lights[item];
			if(this.config.light.imageOff){
				floorplan.appendChild(this.getLightOffDiv(item, position));
			}
			floorplan.appendChild(this.getLightDiv(item, position));
		}
	},
	getLightDiv: function(item, position) {
		// set style: location
		var style = "margin-left:" + position.left + "px;margin-top:" + position.top + "px;position:absolute;"
			+ "height:" + this.config.light.height + "px;width:" + this.config.light.width + "px;";
		if (!this.config.draft)
			style += "display:none;"; // hide by default, do not hide if all items should be shown

		var image = position.imageOn ? position.imageOn : this.config.light.imageOn;
		// create div, set style and text
		var lightDiv = document.createElement("div");
		lightDiv.id = 'pimatic_' + item;
		lightDiv.style.cssText = style;
		
		lightDiv.innerHTML = "<img src='" + this.file("/images/" + image) + "' style='"
			+ "height:" + this.config.light.height + "px;width:" + this.config.light.width + "px;'/>";
		return lightDiv;
	},
	getLightOffDiv: function(item, position) {
		// set style: location
		var style = "margin-left:" + position.left + "px;margin-top:" + position.top + "px;position:absolute;"
			+ "height:" + this.config.light.height + "px;width:" + this.config.light.width + "px;";
		// if (!this.config.draft)
		// 	style += "display:none;"; // hide by default, do not hide if all items should be shown
		var image = position.imageOff ? position.imageOff : this.config.light.imageOff;
		// create div, set style and text
		var lightDiv = document.createElement("div");
		lightDiv.id = 'pimatic_' + item + '_off';
		lightDiv.style.cssText = style;
		lightDiv.innerHTML = "<img src='" + this.file("/images/" + image) + "' style='"
		+ "height:" + this.config.light.height + "px;width:" + this.config.light.width + "px;'/>";
		return lightDiv;
	},

	appendLabels: function(floorplan) {
		for (var item in this.config.labels) {
			var labelConfig = this.config.labels[item];
			floorplan.appendChild(this.getLabelDiv(item, labelConfig));
		}
	},
	getLabelDiv: function(item, labelConfig) {
		// default color and size, but may be overridden for each label
		var color = this.getSpecificOrDefault(labelConfig.color, this.config.label.defaultColor);
		var size  = this.getSpecificOrDefault(labelConfig.size,  this.config.label.defaultSize);

		// set style: location, color, font size
		var style = "margin-left:" + labelConfig.left + "px;margin-top:" + labelConfig.top + "px;position:absolute;";
		style += "color:" + color + ";font-size:" + size + ";";

		// create div, set style and text
		var labelDiv = document.createElement("div");
		labelDiv.id = 'pimatic_' + item;
		labelDiv.style.cssText = style;
		labelDiv.innerHTML = labelConfig.image ? "<img src='" + this.file("/images/" + labelConfig.image) + "'/>" + "&lt;" + item  + "&gt;" : "&lt;" + item  + "&gt;" ;
		return labelDiv;
	},

	appendWindows: function(floorplan) {
		for (var item in this.config.windows) {
			// get config for this window, create div, and append it to the floorplan
			var windowConfig = this.config.windows[item];
			floorplan.appendChild(this.getWindowDiv(item, windowConfig));

			// if 'counterwindow' is set, we must append another one according to given direction
			if (windowConfig.counterwindow !== 'undefined' && windowConfig.radius !== 'undefined') {
				// clone given window config for other wing of counterwindow: http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
				var counterwindowConfig = JSON.parse(JSON.stringify(windowConfig));
				if (windowConfig.counterwindow == 'horizontal') {
					counterwindowConfig.left += windowConfig.radius
					counterwindowConfig.midPoint = this.getMirroredMidPoint(windowConfig.midPoint, true);
					floorplan.appendChild(this.getWindowDiv(item + "_counterwindow", counterwindowConfig));
				} else if (windowConfig.counterwindow == 'vertical') {
					counterwindowConfig.top += windowConfig.radius
					counterwindowConfig.midPoint = this.getMirroredMidPoint(windowConfig.midPoint, false);
					floorplan.appendChild(this.getWindowDiv(item + "_counterwindow", counterwindowConfig));
				}
			}
		}
	},
	getMirroredMidPoint: function(midPoint, horizontal) {
		if (horizontal  && midPoint.endsWith  ("left"))   return midPoint.slice(0, midPoint.indexOf('-')) + "-right";
		if (horizontal  && midPoint.endsWith  ("right"))  return midPoint.slice(0, midPoint.indexOf('-')) + "-left";
		if (!horizontal && midPoint.startsWith("top"))    return "bottom" + midPoint.slice(midPoint.indexOf('-'));
		if (!horizontal && midPoint.startsWith("bottom")) return "top"    + midPoint.slice(midPoint.indexOf('-'));
	},
	getWindowDiv: function(item, windowConfig) {
		// default color, but may be overridden for each window
		var color = this.getSpecificOrDefault(windowConfig.color, this.config.window.defaultColor);

		// prepare style with location and hide it!
		var style = "margin-left:" + windowConfig.left + "px;margin-top:" + windowConfig.top + "px;position:absolute;";
		if (!this.config.draft)
			style += "display:none;"; // hide by default, do not hide if all items should be shown

		// if radius is set, it's a wing with a radius
		if (typeof windowConfig.radius !== 'undefined') {
			var radius = windowConfig.radius;
			style += this.getRadiusStyle(radius, windowConfig.midPoint) + "height:" + radius + "px;width:" + radius + "px;";
		} else {
			// otherwise it's a rectengular window with width and height
			style += "height:" + windowConfig.height + "px;width:" + windowConfig.width + "px;";
		}

		// create div representing the window
		var windowDiv = document.createElement("div");
		windowDiv.id = 'pimatic_' + item;
		windowDiv.style.cssText = "background:" + color + ";" + style; // set color, location, and type-specific style
		return windowDiv
	},
	getRadiusStyle: function(radius, midPoint) {
		// example from: http://1stwebmagazine.com/css-quarter-circle
		var radiusBounds = "0 0 " + radius + "px 0;"; // default: top-left
		if (midPoint == "top-right") {
			radiusBounds = "0 0 0 " + radius + "px;";
		} else if (midPoint == "bottom-left") {
			radiusBounds = "0 " + radius + "px 0 0;";
		} else if (midPoint == "bottom-right") {
			radiusBounds = radius + "px 0 0 0;";
		}
		return "border-radius: " + radiusBounds + " -moz-border-radius: " + radiusBounds + " -webkit-border-radius: " + radiusBounds;
	},
	getSpecificOrDefault: function(specificValue, defaultValue) {
		if (typeof specificValue !== 'undefined')
			return specificValue; // specific value is defined, so use that one!
		return defaultValue; // no specific value defined, use default value
	},
});

