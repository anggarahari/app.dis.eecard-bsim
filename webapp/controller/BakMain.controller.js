sap.ui.define([
	"smm/hcmapp/dis/eecard3/controller/BaseController",
	"sap/m/BusyDialog",
	"smm/hcmapp/dis/eecard3/utils/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function(B, D, f, J, ChartFormatter, Format) {
	"use strict";

	return B.extend("smm.hcmapp.dis.eecard3.controller.Main", {
		formatter: f,

		onInit: function() {
			var oView = this.getView();
			this._oComponent = this.getOwnerComponent();
			oView.addStyleClass(this._oComponent.getContentDensityClass());
			this._oBusy = new D();
			this._oODataModel = this._oComponent.getModel();
			this._oCompetencyModel = new J();
			this._oStemModel = new J();
			this._oVizFrame = this.getView().byId("idVizFrame");
			this.loadData();
			// var oPopOver = this.getView().byId("idPopOver");
			// oPopOver.connect(oVizFrame.getVizUid());
			// oPopOver.setFormatString(formatPattern.STANDARDFLOAT);
		},

		loadData: function() {
			var sPath = "/EmployeeDetailSet",
				oModel = new J(),
				that = this;
			this._oBusy.open();
			this._oODataModel.read(sPath, {
				async: false,
				urlParameters: {
					$expand: "toEmployeePicture,toEmployeeAddData,toCompetency,toPerformance,toTraining,toDevProgram"
				},
				success: function(oData, response) {
					oModel.setData(oData);
					that.getView().setModel(oModel, "employee");
					if (oData.results.length > 0) {
						if (oData.results[0].toCompetency.results.length > 0) {
							that.buildCompetency(oData.results[0].toCompetency.results);
						}
						that.build360(oData.results[0].toPerformance);
						that.buildStem(oData.results[0].toTraining.results);
					}
					that._oBusy.close();
				},
				error: function(oError) {
					that._oBusy.close();
				}
			});
		},

		build360: function(p) {
			var formatPattern = ChartFormatter.DefaultPattern;
			Format.numericFormatter(ChartFormatter.getInstance());
			this._oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: formatPattern.SHORTFLOAT_MFD2,
						visible: true
					},
					area: {
						visible: true,
						opacity: 0.7
					},
					gridline: {
						visible: false
					},
					drawingEffect: "glossy",
					polarAxis: {
						label: {
							formatString: formatPattern.SHORTFLOAT_MFD2
						},
						title: {
							visible: false
						}
					},
					valueAxis: {
						label: {
							visible: false,
							formatString: formatPattern.SHORTFLOAT_MFD2
						},
						title: {
							visible: false
						}
					}
				},
				title: {
					visible: true,
					text: "360 Feedback: " + p.Score
				},
				legend: {
					visible: false
				},
				general: {
					layout: {
						isFixedpadding: true
					}
				},
				interaction: {
					noninteractiveMode: true
				}
			});
			this._oVizFrame.setVizScales({
				valueAxis: {
					min: 5
				}
			});

			var dataModel = new J({
				"performa": [{
					"Performance Name": "Loyalty",
					"Score": p.Loyalty
				}, {
					"Performance Name": "Innovation",
					"Score": p.Innovation
				}, {
					"Performance Name": "Continous Improvement",
					"Score": p.ContinousImprovement
				}, {
					"Performance Name": "Commitment",
					"Score": p.Commitment
				}, {
					"Performance Name": "Positive Attitude",
					"Score": p.PositiveAttitude
				}, {
					"Performance Name": "Integrity",
					"Score": p.Integrity
				}]
			});
			this._oVizFrame.setModel(dataModel);
		},

		buildStem: function(t) {
			var S = 0,
				T = 0,
				E = 0,
				M = 0,
				N = 0,
				m = {};

			t.forEach(function(L) {
				if (L.Stem === "SCI") {
					S = S + 1;
				} else if (L.Stem === "TEC") {
					T = T + 1;
				} else if (L.Stem === "ENG") {
					E = E + 1;
				} else if (L.Stem === "MAT") {
					M = M + 1;
				} else {
					N = N + 1;
				}
			});

			m = {
				iS: S,
				iT: T,
				iE: E,
				iM: M,
				iN: N,
				iL: t.length
			};

			this._oStemModel.setData({
				data: m
			});
			this.setModel(this._oStemModel, "stem");
		},

		buildCompetency: function(r) {
			var m = {},
				x = false;

			r.forEach(function(E) {
				if (E.IsCurrent === true && x === false) {
					x = true;
					m = {
						JobtitleId: E.JobtitleId,
						JobtitleLongtext: E.JobtitleLongtext,
						JobtitleText: E.JobtitleText,
						OrgunitId: E.OrgunitId,
						OrgunitLongtext: E.OrgunitLongtext,
						OrgunitText: E.OrgunitText,
						PositionId: E.PositionId,
						PositionLongtext: E.PositionLongtext,
						PositionText: E.PositionText,
						SuitIconSoft: E.SuitIconSoft,
						SuitIconTech: E.SuitIconTech,
						SuitPercentSoft: E.SuitPercentSoft,
						SuitPercentTech: E.SuitPercentTech,
						SuitStateSoft: E.SuitStateSoft,
						SuitStateTech: E.SuitStateTech
					};
				}
			});
			this._oCompetencyModel.setData({
				data: m
			});
			this.setModel(this._oCompetencyModel, "competency");
		},

		pressStemBar: function(oEvent) {
			var t = oEvent.getSource().getTitle();
		},

		onPrint: function(oEvent) {
			// var $domTarget = this.byId("personalDataCard").$()[0],
			// 	sTargetContent = $domTarget.outerHTML,
			// 	sOriginalContent = document.body.innerHTML;
			// var hContent = "<html><head></head><body>";
			// var closeContent = "</body></html>";
			// var htmlpage = hContent + sOriginalContent + closeContent;
			// var win = window.open("", "PrintWindow");
			// console.log(document.styleSheets);
			// win.document.write(htmlpage);
			// $.each(document.styleSheets, function(index, oStyleSheet) {
			// 	if (oStyleSheet.href) {
			// 		var link = document.createElement("link");
			// 		link.type = oStyleSheet.type;
			// 		link.rel = "stylesheet";
			// 		link.href = oStyleSheet.href;
			// 		//win.document.head.appendChild(link); --> this doesn't work in IE
			// 		win.document.getElementsByTagName("head")[0].innerHTML = win.document.getElementsByTagName("head")[0].innerHTML + link.outerHTML;
			// 	}
			// });
			// setTimeout(function() {
			// 	win.print(); //Print it
			// }, 100);
			// win.stop();

			// console.log(this.byId("personalDataCard"));
			var $domTarget = this.byId("personalDataCard").$()[0],
				sTargetContent = $domTarget.innerHTML,
				sOriginalContent = document.body.innerHTML;
			document.body.innerHTML = sTargetContent;
			html2canvas(document.body).then(function(canvas) {
				document.body.innerHTML = ""; //Clear the html
				document.body.appendChild(canvas) //draw the canvas on page
				window.print(); //Print it
				document.body.innerHTML = sOriginalContent; //return the original content to page
			});
			// html2canvas(document.getElementById('__xmlview0--fullScreenPage-page-cont'), {
			// 	onrendered: function(canvasObj) {
			// 		console.log(canvasObj);
			// 		var pdf = new jsPDF('P', 'pt', 'a4'),
			// 			pdfConf = {
			// 				pagesplit: false,
			// 				backgroundColor: '#FFF'
			// 			};
			// 		document.body.appendChild(canvasObj); //appendChild is required for html to add page in pdf
			// 		pdf.addHTML(canvasObj, 0, 0, pdfConf, function() {
			// 			document.body.removeChild(canvasObj);
			// 			//pdf.addPage();
			// 			pdf.save('Test.pdf');
			// 		});
			// 	}
			// });
		}
	});
});