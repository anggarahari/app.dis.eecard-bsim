sap.ui.define([
	"smm/hcmapp/dis/eecard3/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(Controller, J) {
	"use strict";

	return Controller.extend("smm.hcmapp.dis.eecard3.controller.App", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf smm.hcmapp.dis.eecard3.view.App
		 */
		onInit: function() {
			var v, o = this.getView().getBusyIndicatorDelay();
			v = new J({
				busy: false, //true,
				delay: o
			});
			this.setModel(v, "appView");

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf smm.hcmapp.dis.eecard3.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf smm.hcmapp.dis.eecard3.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf smm.hcmapp.dis.eecard3.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});