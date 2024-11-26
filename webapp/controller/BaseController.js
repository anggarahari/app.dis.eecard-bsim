sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
	return Controller.extend("smm.hcmapp.dis.eecard3.controller.BaseController", {
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		getModel: function (n) {
			return this.getView().getModel(n);
		},

		setModel: function (m, n) {
			return this.getView().setModel(m, n);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		readEntity: function (sPath, sXp, aFilter) {
			return new Promise((resolved, rejected) => {
				this.getOwnerComponent().getModel().read(sPath, {
					async: false,
					urlParameters: {
						$expand: sXp,
					},
					filters: aFilter,
					success: (oData) => {
						resolved(oData);
					},
					error: (oError) => {
						if (oError) {
							if (oError.responseText) {
								if (oError.statusCode === 500) {
									rejected("In the context of Data Services an unknown internal server error occurred");
								} else {
									var oErrorMessage = JSON.parse(oError.responseText);
									rejected("Error: " + oErrorMessage.error.message.value);
								}
							}
						}
					},
				});
			});
		}
	});
});