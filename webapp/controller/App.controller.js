sap.ui.define([
	"smm/hcmapp/dis/eecard3/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function (Controller, J) {
	"use strict";

	return Controller.extend("smm.hcmapp.dis.eecard3.controller.App", {
		onInit: function () {
			this.setModel(new J({
				busy: false,
				delay: this.getView().getBusyIndicatorDelay()
			}), "appView");

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});
});