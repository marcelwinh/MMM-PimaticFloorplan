# Magic Mirror Module: MMM-PimaticFloorplan
This [MagicMirror2](https://github.com/MichMich/MagicMirror) module allows you to show a floorplan of your house / apartment with the current state of lights, window contacts, and labels provided by a running [pimatic](https://pimatic.org/) server.


![Magic-Mirror Module MMM-PimaticFloorplan](https://github.com/marcelwinh/MMM-PimaticFloorplan/blob/master/example_view.PNG?raw=true)

## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/marcelwinh/MMM-PimaticFloorplan.git
````

## Preparing the Floorplan

First of all, you should create an image showing your individual floorplan.
You can use `MMM-PimaticFloorplan/images/floorplan-default.png` as template (shown [here](images/README.md)) and use an image editor like [paint.net](http://www.getpaint.net/index.html) to change it as you like.
Save it as `MMM-PimaticFloorplan/images/floorplan.png` (leave `floorplan-default.png` untouched).

## Configuring the Module

Now add the module to the modules array in the `config/config.js` file.
Yes, the configuration looks complicated, but there is quite a lot that can be configured.
The in-line comments should explain everything you need to know, so copy this sample configuration and adjust it to your individual pimatic server, pimatic items, and your floorplan.
When you are done adding all items and positioning them as you like, change `draft` to false.
````javascript
modules: [
	{
		module: 'MMM-PimaticFloorplan',
		position: 'bottom_left', // this can be any of the regions
		config: {
			draft: true, // if true, all lights, windows, and label names are shown; if false, get states from pimatic
			pimatic: {
				host :'host',
				port : 8080,
				user : '',
				passwd : '',
			},
			floorplan: {
				image: "floorplan.png", // image in subfolder 'images'; change to floorplan.png to avoid git repository changes
				width: 314, // this must be the width of the image above
				height: 419, // this must be the height of the image above
			},
			// light: { // this part shows default settings for lights; may optionally be overwritten
			//	image: "light.png", // located in subfolder 'images'
			//	width: 19, // image width
			//	height: 19, // image height
			// },
			// window: { // this part shows default settings for windows; may optionally be overwritten
			//	defaultColor: "red", // css format, i.e. color names or color codes
			// },
			// label: { // this part shows default settings for labels; may optionally be overwritten
			//	defaultColor: "grey", // css format
			//	defaultSize: "medium", // value of font-size style, e.g. xx-small, small, medium, large, x-large, 1.2em, 20px
			// },
			lights: { // list all light items to be shown (must be of pimatic type Switch or Dimmer)
				// format: "pimatic item (name is case-sensitive!): { left, top }"
				ikea_Light:      	{ left: 150,  top: 5, pimaticId: "ikeaLight.state" },
				led_bed:      	 	{ left: 80,  top: 280, pimaticId: "ledBed.state" },
				nightstand_light:	{ left: 50,  top: 280, pimaticId: "nightstandLight.state" },
				tv_backlight:      	{ left: 15,  top: 20, pimaticId: "tvBacklight.state" },
			},
			windows: { // list all window / door contacts to be shown (must be of pimatic type Switch or Contact)
				// pimatic item: left, top, radius (draws quadrant), midPoint, and optionally counterwindow and color
				Window_Kueche:      { left: 220, top: 395, radius: 25, midPoint: "bottom-left", pimaticId: "fenster-kueche.contact", default: true},
				Window_SZ_rechts:   { left: 72, top: 395, radius: 25, midPoint: "bottom-left", pimaticId: "fenster-rechts.contact", default: true},
				Window_SZ_links:    { left: 122, top: 395, radius: 25, midPoint: "bottom-right", pimaticId: "fenster-links.contact", default: true},
				Window_Bad_links:   { left: 1, top: 242, radius: 20, midPoint: "bottom-left", pimaticId: "fenster-bad.contact", default: true},
				Window_Bad_rechts:  { left: 1, top: 222, radius: 20, midPoint: "top-left", pimaticId: "badezimmer-rechtes-fenster.contact", default: true},
				Window_WZ_rechts:   { left: 1, top: 108, radius: 21, midPoint: "top-left", pimaticId: "wohnzimmer-rechtes-fenster.contact", default: true},
				Window_WZ_links:    { left: 1, top: 130, radius: 21, midPoint: "bottom-left", pimaticId: "wohnzimmer-linkes-fenster.contact", default: true},
				Window_WZ_balkon:   { left: 80, top: 1, radius: 40, midPoint: "top-right", pimaticId: "balkontuer.contact", default: true},
			},
			labels: { // list all strings to be shown (may probably be any pimatic type, resonable for String and Number)
				// pimatic item: left, top, and optionally color, font size, prefix, postfix, and number of decimals for floating numbers
				Temperature_Flur:          		{ left: 162, top: 200, decimals: 1, color: "white", size: "medium", pimaticId: "wandthermostat-flur.temperature"},
				Temperature_Flur_soll:          { left: 162, top: 225, decimals: 1, color: "grey", size: "medium", pimaticId: "thermostat-flur.temperatureSetpoint"},
				Temperature_Kueche:         	{ left: 250,  top: 325,  decimals: 1, color: "white", pimaticId: "wandthermostat-kuche.temperature"},
				Temperature_Kueche_soll:        { left: 250,  top: 350,  decimals: 1, color: "grey", pimaticId: "thermostat-kueche.temperatureSetpoint"},
				Temperature_Schlafzimmer:   	{ left: 80, top: 325, color: "white", decimals: 1, pimaticId: "wand-thermostat-schlafzimmer.temperature"},
				Temperature_Schlafzimmer_soll:  { left: 80, top: 350, color: "grey", decimals: 1, pimaticId: "thermostat-schlafzimmer.temperatureSetpoint"},
				Temperature_Bad:    			{ left: 50, top: 205,  color: "white", decimals: 1, pimaticId: "wandthmerostat-bad.temperature"},
				Temperature_Bad_soll:    		{ left: 50, top: 230,  color: "grey", decimals: 1, pimaticId: "thermostat-bad-new.temperatureSetpoint"},
				Temperature_Wohnzimmer:        	{ left: 80,  top: 60, color: "white", decimals: 1, pimaticId: "wand-thermostat-wohnzimmer.temperature"},
				Temperature_Wohnzimmer_soll:    { left: 80,  top: 85, color: "grey", decimals: 1, pimaticId: "thermostat-couch.temperatureSetpoint"},
			}
		}
	},
]
````

## Configuration options

The following properties needs to be configured:

|Option|Description|
|---|---|
|``host``|Hostname or IP of your [pimatic](https://pimatic.org/) home automation server.|
|``port``|Port to connect to your pimatic server, configured in ``config.json`` of your **pimatic installation**|
|``user``|User login name configured in ``config.json`` of your **pimatic installation**|
|``passwd``|Passwd of your specified pimatic user login name|
|``floorplan``|The name and size of the floorplan image|
|``light``|The name and size of the light image|
|``window``|Default color of the open windows and doors|
|``label``|Default color and size of the labels|
|``lights``|An array of lights in pimatic with their position on the floorplan and pimaticId|
|``windows``|An array of windows in pimatic with their position on the floorplan, orientation, defaultValue (closed) and pimaticId optional color|
|``labels``|An array of labels in pimatic with their position on the floorplan and pimaticId, optional color, size, decimals|


## Special Thanks
- [Michael Teeuw](https://github.com/MichMich) for creating the awesome [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) project that made this module possible.
- [MrDrago](https://raw.githubusercontent.com/mrdago/) for creating the [MMM-Pimatic](https://github.com/mrdago/MMM-Pimatic) module that I used as guidance in creating this module.
- [paphko](https://github.com/paphko/) for creating the [mmm-openhabfloorplan](https://github.com/paphko/mmm-openhabfloorplan/) module that I used as guidance in creating this module.
