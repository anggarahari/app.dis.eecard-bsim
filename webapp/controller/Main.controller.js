/* global canvg, jsPDF, html2canvas */
jQuery.sap.require("sap.m.BusyDialog");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.define([
	"smm/hcmapp/dis/eecard3/controller/BaseController",
	"smm/hcmapp/dis/eecard3/utils/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (Controller, f, J, VizChartFormatter, VizFormat) {
	"use strict";

	return Controller.extend("smm.hcmapp.dis.eecard3.controller.Main", {
		formatter: f,

		onInit: function () {
			this._oComponent = this.getOwnerComponent();
			this._oView = this.getView();
			this._oView.addStyleClass(this._oComponent.getContentDensityClass());
			this._oBusy = new sap.m.BusyDialog();
			this._oODataModel = this._oComponent.getModel();
			this._oVizFrame360Perf = this._oView.byId("idVizFrame360");
			this._oVizFrame360Qua = this._oView.byId("idVizFrameQua");
			this.setModel(new J({
				Year: new Date().getFullYear()
			}), "appParams");
			this._loadData();
		},

		_loadData: function () {
			let sPath = "/EmployeeDetailSet",
				sXp = "toEmployeePicture,toPerformance,toTraining,toEducation,toDevProgram,toExperience,toAttribute,toCurrentRoles,toInsight,toQualification,toAspiration,toProfile,toAgility,toAspCategory,toValueHelpBuVisibility,toValueHelpTlMobility,toValueHelpTalentClass",
				oModel = new J();
			this._oBusy.open();
			this.readEntity(sPath, sXp).then(
				(result) => {
					if (result.results.length > 0) {
						result.results[0].toAspiration.results.splice(2, 2);
						oModel.setData(result.results[0]);
						this._oView.setModel(oModel, "tlCard");
						this._build360(result.results[0].toPerformance);
						this._buildCert(result.results[0].toTraining.results);
					}
					this._oBusy.close();
				},
				(error) => {
					this._oBusy.close();
				}
			);
		},

		_build360: function (p) {
			var formatPattern = VizChartFormatter.DefaultPattern;
			VizFormat.numericFormatter(VizChartFormatter.getInstance());
			this._oVizFrame360Perf.setVizProperties({
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
						isFixedpadding: false
					}
				},
				interaction: {
					noninteractiveMode: true
				}
			});
			this._oVizFrame360Perf.setVizScales({
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
					"Performance Name": this.getResourceBundle().getText("vizLabelContImp"), //"Continous Improvement",
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
			this._oVizFrame360Perf.setModel(dataModel);
		},

		_buildQuali: function (q) {
			var oQuaModel = new J(),
				aQua = [];

			this._oVizFrame360Qua.setVizProperties({
				plotArea: {
					gridline: {
						visible: true,
						color: "#bfbfbf"
					},
					gap: {
						visible: true
					},
					primaryScale: {
						autoMaxValue: false,
						autoMinValue: false,
						maxValue: 5,
						minValue: 5
					},
					dataPointSize: {
						max: 20,
						min: 20
					},
					forecastColor: "#f1f3f3",
					isFixedDataPointSize: true
				},
				interaction: {
					noninteractiveMode: true,
					selectability: {
						mode: "SINGLE"
					}
				},
				title: {
					visible: false,
					text: "Employee Qualification (Soft Competencies)"
				},
				legendGroup: {
					layout: {
						alignment: "center",
						position: "bottom"
					}
				},
				valueAxis: {
					title: {
						visible: false
					},
					label: {
						allowDecimals: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				}
			});

			this._oVizFrame360Qua.setVizScales({
				"feed": "actualValues",
				"max": 5,
				"min": 5
			}, {
				replace: true
			});

			q.forEach(function (E) {
				if (E.CompetencyType === "S") {
					aQua.push(E);
				}
			});
			oQuaModel.setData({
				qualific: aQua
			});
			this._oVizFrame360Qua.setModel(oQuaModel);
		},

		_buildCert: function (t) {
			var oParamModel = this.getModel("appParams"),
				sYear = oParamModel.getProperty("/Year"),
				dMin = new Date(sYear - 2, 0, 1),
				aCert = [],
				aTrain = [],
				oCertModel = new J(),
				oTrainModel = new J(),
				oS = {},
				oStemModel = new J();

			t.forEach(function (E) {
				if (E.BeginDate >= dMin) {
					// if (E.Jenis === "CERTI") {
					// aCert.push(E);
					// } else 
					if (E.Jenis === "CERTI" || E.Jenis === "TRAIN" || E.Jenis === "EXT" || E.Jenis === "INH") {
						aTrain.push(E);
					}
				}
				oS[E.Stem] = {
					Stem: E.Stem,
					StemText: E.StemText,
					Count: oS[E.Stem] ? oS[E.Stem].Count + 1 : 1
				};
			});
			oCertModel.setData({
				data: aCert
			});
			this.setModel(oCertModel, "certification");
			oTrainModel.setData({
				data: aTrain
			});
			this.setModel(oTrainModel, "training");
			oStemModel.setData({
				data: oS
			});
			this.setModel(oStemModel, "stem");
		},

		grouperEdu: function (oGroup) {
			return {
				key: oGroup.oModel.oData.toEducation.results[oGroup.sPath.split("/")[3]].CategoryText
			};
		},

		grouperExp: function (oGroup) {
			return {
				key: oGroup.oModel.oData.toExperience.results[oGroup.sPath.split("/")[3]].GroupText
			};
		},

		grouperAtt: function (oGroup) {
			return {
				key: oGroup.oModel.oData.toAttribute.results[oGroup.sPath.split("/")[3]].CategoryText
			};
		},

		getGroupHeader: function (oGroup) {
			return new sap.m.GroupHeaderListItem({
				title: oGroup.key,
				upperCase: false
			});
		},

		onPdfPrint: function (oEvent) {
			var oData = this.getModel("tlCard").getProperty("/"),
				oDateF = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddTHH:mm:ss"
				}),
				sUrl = "/sap/opu/odata/sap/ZHCM_TLPROF_MAN_SRV/PdfFormSet(EmployeeNumber='" + oData.EmployeeNumber + "',EndDate=datetime'" +
					jQuery.sap.encodeURL(oDateF.format(oData.toProfile.ValidTo)) + "',BeginDate=datetime'" +
					jQuery.sap.encodeURL(oDateF.format(oData.toProfile.ValidFrom)) + "',TemplateId='1')/$value";

			sap.m.URLHelper.redirect(sUrl, true);
		},

		onPdfExport: function (oEvent) {
			this._oBusy.open();
			var that = this,
				oC = this.getModel("tlCard"),
				oP = this.getModel("appParams"),
				// oD = this.getModel("talentDetail"),
				oT = this.getModel("training"),
				oS = this.getModel("stem"),

				aCData = oC.getProperty("/"),
				// aDData = oD.getProperty("/"),
				aTData = oT.getProperty("/data"),
				aSData = oS.getProperty("/data"),

				oVizFrame360 = this._oView.byId("idVizFrame360"),
				sSVG360 = oVizFrame360.exportToSVGString({
					width: 1392,
					height: 912
				}).replace(/translate /gm, "translate"),
				oCanvasHTML360 = document.createElement("canvas");
			canvg(oCanvasHTML360, sSVG360);
			var sViz360 = oCanvasHTML360.toDataURL("image/png");

			var getImageFromUrl = function (url, callback) {
				var img = new Image();
				img.crossOrigin = 'Anonymous';
				img.onload = function () {
					// callback(img);
					var canvas = document.createElement('CANVAS');
					// Create a 2d context
					var ctx = canvas.getContext('2d');
					var dataURL;
					// Resize the canavas to the original image dimensions
					canvas.height = this.naturalHeight;
					canvas.width = this.naturalWidth;
					// Draw the image to a canvas
					ctx.drawImage(this, 0, 0);
					// Convert the canvas to a data url
					dataURL = canvas.toDataURL();
					// Return the data url via callback
					callback(dataURL);
					// Mark the canvas to be ready for garbage 
					// collection
					canvas = null;
				};
				img.onerror = function () {
					callback(null);
				};
				img.src = url;
				// make sure the load event fires for cached images too
				if (img.complete || img.complete === undefined) {
					// Flush cache
					img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
					// Try again
					img.src = src;
				}
			};

			var createPDF = function (imgEmpPic) {
				try {
					var oDoc = new jsPDF("landscape");
				} catch (t) {
					that._oBusy.close();
					sap.m.MessageBox.show("Error loading PDF library, please try again later..", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Oops!"
					});
					return;
				}
				var iTopL = 0,
					iTopLStart = 0,
					iTopC = 0,
					iTopCStart = 0,
					iTopR = 0,
					iTopRStart = 0,
					iH = 0,
					iC = 0,
					iChartHeight = 0,
					iL = 0,
					aText = [],
					aData = [],
					aImg = [],
					oImg = {};

				/***************Personal Data***************/
				oDoc.setFont("helvetica");
				// oDoc.setFillColor(242, 242, 242);
				if (imgEmpPic !== null) {
					oDoc.addImage(imgEmpPic, "JPEG", 9, 6, 15, 15, "monkey"); // Cache the image using the alias 'monkey'
				}
				oDoc.setFontSize(11);
				iTopL = 10;
				iH = 5;
				oDoc.setFontStyle("bold");
				oDoc.text(aCData.EmployeeName.FormattedName, 26, iTopL);
				oDoc.setFontSize(9);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.setFontStyle("italic");
				oDoc.setFontStyle("bold");
				oDoc.text(aCData.EmployeePositionLongtext, 26, iTopL);
				oDoc.setFontStyle("normal");
				// iTopL = iTopL + 5;
				// iH = iH + 5;
				// oDoc.text(f.formatClass(oP.getProperty("/Year"), false) + ": " + oD.getProperty("/TalentClassOriText"), 26, iTopL);
				// iTopL = iTopL + 5;
				// iH = iH + 5;
				// oDoc.text(f.formatClass(oP.getProperty("/Year"), true) + ": " + oD.getProperty("/TalentClassCaliText"), 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Age: " + f.formatAge(aCData.Age), 26, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Years of Service:", 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("- Group: " + f.formatYos(aCData.Yos, aCData.HireDate), 10, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("- Current Position: " + f.formatYosPos(aCData.YosPosition, aCData.PositionDate), 10, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Job Grade / PS Level: " + f.formatPayScale(aCData.PayScaleGroup, aCData.PayScaleLevel), 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Directorate: " + aCData.DirectorateText, 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Division: " + aCData.DivisionText, 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Department: " + aCData.DepartmentText, 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Org. Structure: " + aCData.BusUnitText, 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Group: " + aCData.BusinessAreaText, 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Last Promotion: " + that.byId("txLastPromo").getText(), 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Last Rotation: " + that.byId("txLastRotat").getText(), 9, iTopL);
				iTopL = iTopL + 5;
				iH = iH + 5;
				oDoc.text("Position Before Current: " + aCData.BeforePositionText, 9, iTopL);
				oDoc.roundedRect(8, 5, 93, iH + 2, 2, 2, "S");

				/***************Development Program***************/
				oDoc.setFontSize(11);
				iTopL = iTopL + 3;
				iH = 7;
				iTopLStart = iTopL;
				iTopL = iTopL + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Development Program", 9, iTopL);
				oDoc.setFontStyle("normal");
				oDoc.setFontSize(9);
				iTopL = iTopL + 7;
				aData = aCData.toDevProgram.results;
				iL = 0;
				for (i = 0; i < aData.length; i++) {
					iL = iL + 1;
					if (iL > 5) {
						break;
					}
					aText = oDoc.splitTextToSize(f.formatDevProgram(aData[i].TahunAngkatan, aData[i].Name, aData[i].SubtypeId), 91);
					if (aText) {
						oDoc.text(aText, 9, iTopL);
						iTopL = iTopL + (5 * aText.length);
						iH = iH + (5 * aText.length);
					}
				}
				if (iL === 0) {
					// iTopL = iTopL + 5;
					iH = iH + 5;
					oDoc.text("N/A", 9, iTopL);
				} else {
					iTopL = iTopL - (5 * aText.length);
				}
				oDoc.roundedRect(8, iTopLStart, 93, iH + 2, 2, 2, "S");
				oDoc.line(8, iTopLStart + 7, 101, iTopLStart + 7);

				/***************Performance 360***************/
				oDoc.setFontSize(11);
				iTopL = iTopL + 3;
				iH = 7;
				iTopLStart = iTopL;
				iTopL = iTopL + 5;
				oDoc.setTextColor(f.getColorHex(""));
				oDoc.setFontStyle("bold");
				oDoc.text("Performance - 360\xB0", 9, iTopL);
				oDoc.setFontStyle("normal");
				oDoc.setFontSize(9);
				iTopL = iTopL + 1;
				oDoc.addImage(sViz360, "PNG", 9, iTopL, 92, 60);
				iTopL = iTopL + 62;
				iH = iH + 55;
				oDoc.roundedRect(8, iTopLStart, 93, iH + 2, 2, 2, "S");
				oDoc.line(8, iTopLStart + 7, 101, iTopLStart + 7);

				/***************Knowledge***************/
				oDoc.setFontSize(11);
				iTopC = 10;
				iH = 8;
				oDoc.setFontStyle("bold");
				oDoc.text("Knowledge", 103, iTopC);
				oDoc.setFontStyle("normal");
				iTopC = iTopC + 4;
				iL = Object.keys(aSData).length;
				if (iL > 0) {
					if (iL > 4) {
						iChartHeight = 6 * 4;
					} else {
						iChartHeight = 6 * iL;
					}
					oImg = {
						// Element: document.getElementById("application-HCMFioriApps-displayEmployeeCard-component---main--mchartStem"),
						Element: document.getElementById(that.byId("mchartStem").getId()),
						xAxis: 127,
						yAxis: 14,
						Width: 42,
						Height: iChartHeight
					};
					aImg.push(oImg);
					iTopC = iTopC + iChartHeight;
				}
				iH = iH + iChartHeight;
				iTopC = iTopC + 4;
				iH = iH + 5;
				oDoc.setFontSize(9);
				oDoc.setFontStyle("bold");
				oDoc.text("Certification:", 103, iTopC);
				oDoc.setFontStyle("normal");
				iL = 0;
				for (i = 0; i < aTData.length; i++) {
					if (aTData[i].Jenis === "CERTI") {
						iL = iL + 1;
						if (iL > 5) {
							break;
						}
						iTopC = iTopC + 5;
						iH = iH + 5;
						oDoc.text(f.formatTextWithBrackets(aTData[i].TrainingName, aTData[i].Tahun), 105, iTopC);
					}
				}
				if (iL === 0) {
					iTopC = iTopC + 5;
					iH = iH + 5;
					oDoc.text("N/A", 105, iTopC);
				}

				iTopC = iTopC + 5;
				iH = iH + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Training:", 103, iTopC);
				oDoc.setFontStyle("normal");
				iL = 0;
				for (i = 0; i < aTData.length; i++) {
					if (aTData[i].Jenis === "TRAIN") {
						iL = iL + 1;
						if (iL > 5) {
							break;
						}
						iTopC = iTopC + 5;
						iH = iH + 5;
						oDoc.text(f.formatTextWithBrackets(aTData[i].TrainingName, aTData[i].Tahun), 105, iTopC);
					}
				}
				if (iL === 0) {
					iTopC = iTopC + 5;
					iH = iH + 5;
					oDoc.text("N/A", 105, iTopC);
				}

				iTopC = iTopC + 5;
				iH = iH + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Education Background:", 103, iTopC);
				oDoc.setFontStyle("normal");
				iL = 0;
				aCData.toEducation.results.forEach(function (E) {
					iTopC = iTopC + 5;
					iH = iH + 5;
					oDoc.text(f.formatEdu(E.EstablishmentText, E.StudyBranch1Text, E.StudyBranch2Text, E.EndDate), 105, iTopC);
					if (E.Institute) {
						iTopC = iTopC + 5;
						iH = iH + 5;
						oDoc.text(E.Institute, 105, iTopC);
					}
					iL = iL + 1;
				});
				if (iL === 0) {
					iTopC = iTopC + 5;
					iH = iH + 5;
					oDoc.text("N/A", 105, iTopC);
				}
				oDoc.roundedRect(102, 5, 93, iH + 2, 2, 2, "S");
				oDoc.line(102, 12, 195, 12);

				/***************PAT Record***************/
				oDoc.setFontSize(11);
				iTopC = iTopC + 3;
				iH = 7;
				iTopCStart = iTopC;
				iTopC = iTopC + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("PAT Record", 103, iTopC);
				oDoc.setFontStyle("normal");
				oDoc.setFontSize(9);
				oImg = {
					// Element: document.getElementById("application-HCMFioriApps-displayEmployeeCard-component---main--mchartPat"),
					Element: document.getElementById(that.byId("mchartPat").getId()),
					xAxis: 124,
					yAxis: iTopCStart + 9,
					Width: 48,
					Height: 24
				};
				aImg.push(oImg);

				iTopC = iTopC + 27;
				iH = iH + 25;

				oDoc.roundedRect(102, iTopCStart, 93, iH + 2, 2, 2, "S");
				oDoc.line(102, iTopCStart + 7, 195, iTopCStart + 7);

				/***************Competency***************/
				// oDoc.setFontSize(11);
				// iTopR = 10;
				// iH = 7;
				// oDoc.setFontStyle("bold");
				// oDoc.text("Competency", 197, iTopR);
				// oDoc.setFontStyle("normal");
				// oDoc.setFontSize(9);
				// iTopR = iTopR + 7;
				// iH = iH + 5;
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.text("Technical Competency: ", 197, iTopR);
				// oDoc.setTextColor(f.getColorHex(oD.getProperty("/SuitStateTech")));
				// oDoc.text(oD.getProperty("/SuitPercentTech") + "%", 257, iTopR, "right");
				// iTopR = iTopR + 5;
				// iH = iH + 5;
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.text("Soft Competency: ", 197, iTopR);
				// oDoc.setTextColor(f.getColorHex(oD.getProperty("/SuitStateSoft")));
				// oDoc.text(oD.getProperty("/SuitPercentSoft") + "%", 257, iTopR, "right");
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.roundedRect(196, 5, 93, iH + 2, 2, 2, "S");
				// oDoc.line(196, 12, 289, 12);

				/***************Experience***************/
				oDoc.setFontSize(11);
				iTopR = 10;
				iH = 7;
				iTopRStart = iTopR;
				oDoc.setFontStyle("bold");
				oDoc.text("Experience", 197, iTopR);
				oDoc.setFontStyle("normal");
				oDoc.setFontSize(9);
				aData = aCData.toExperience.results;

				iTopR = iTopR + 7;
				iH = iH + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Within Group", 197, iTopR);
				oDoc.setFontStyle("normal");
				iL = 0;
				iTopR = iTopR + 5;
				for (var i = 0; i < aData.length; i++) {
					if (aData[i].Group === "01") {
						iL = iL + 1;
						if (iL > 5) {
							break;
						}
						aText = oDoc.splitTextToSize(f.formatTextWithDash(aData[i].PositionText, aData[i].BeginDate), 89);
						if (aText) {
							oDoc.text(aText, 199, iTopR);
						}
						if (aData[i].Employer) {
							iTopR = iTopR + (5 * aText.length);
							iH = iH + (5 * aText.length);
							oDoc.setDrawColor(224, 224, 224);
							oDoc.line(196, iTopR + 1, 289, iTopR + 1);
							oDoc.setDrawColor(0, 0, 0);
							oDoc.text(aData[i].Employer, 199, iTopR);
							iTopR = iTopR + 5;
							iH = iH + 5;
						} else {
							oDoc.setDrawColor(224, 224, 224);
							oDoc.line(196, iTopR + 1, 289, iTopR + 1);
							oDoc.setDrawColor(0, 0, 0);
							iTopR = iTopR + 5;
							iH = iH + 5;
						}
					}
				}
				if (iL === 0) {
					// iTopR = iTopR + 5;
					iH = iH + 5;
					oDoc.text("N/A", 199, iTopR);
				}

				// iTopR = iTopR + 5;
				iH = iH + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Outside Group", 197, iTopR);
				oDoc.setFontStyle("normal");
				iL = 0;
				iTopR = iTopR + 5;
				for (i = 0; i < aData.length; i++) {
					if (aData[i].Group === "02") {
						iL = iL + 1;
						if (iL > 5) {
							break;
						}
						aText = oDoc.splitTextToSize(f.formatTextWithDash(aData[i].PositionText, aData[i].BeginDate), 89);
						if (aText) {
							oDoc.text(aText, 199, iTopR);
						}
						if (aData[i].Employer) {
							iTopR = iTopR + (5 * aText.length);
							iH = iH + (5 * aText.length);
							oDoc.setDrawColor(224, 224, 224);
							oDoc.line(196, iTopR + 1, 289, iTopR + 1);
							oDoc.setDrawColor(0, 0, 0);
							oDoc.text(aData[i].Employer, 199, iTopR);
							iTopR = iTopR + 5;
							iH = iH + 5;
						} else {
							oDoc.setDrawColor(224, 224, 224);
							oDoc.line(196, iTopR + 1, 289, iTopR + 1);
							oDoc.setDrawColor(0, 0, 0);
						}
					}
				}
				if (iL === 0) {
					// iTopR = iTopR + 5;
					iH = iH + 5;
					oDoc.text("N/A", 199, iTopR);
				} else {
					iTopR = iTopR - 5;
				}

				oDoc.roundedRect(196, 5, 93, iH + 2, 2, 2, "S");
				oDoc.line(196, 12, 289, 12);

				/***************Current Roles***************/
				oDoc.setFontSize(11);
				iTopR = iTopR + 3;
				iH = 7;
				iTopRStart = iTopR;
				iTopR = iTopR + 5;
				oDoc.setFontStyle("bold");
				oDoc.text("Current Roles", 197, iTopR);
				oDoc.setFontStyle("normal");
				oDoc.setFontSize(9);
				aData = aCData.toCurrentRoles.results;
				iTopR = iTopR + 7;
				iL = 0;
				for (i = 0; i < aData.length; i++) {
					iL = iL + 1;
					if (iL > 5) {
						break;
					}
					aText = oDoc.splitTextToSize(aData[i].KpiName, 91);
					oDoc.setFontStyle("bold");
					oDoc.text(aText, 197, iTopR);
					oDoc.setFontStyle("normal");
					iTopR = iTopR + (4 * aText.length);
					iH = iH + (4 * aText.length);
					aText = oDoc.splitTextToSize(aData[i].KpiDesc, 91);
					oDoc.text(aText, 197, iTopR);
					iTopR = iTopR + (4 * aText.length);
					iH = iH + (4 * aText.length);
					iTopR = iTopR + 1;
					iH = iH + 1;
				}
				if (iL === 0) {
					iH = iH + 5;
					oDoc.text("N/A", 197, iTopR);
					iTopR = iTopR + 1;
				} else {
					iTopR = iTopR - (4 * aText.length);
				}
				oDoc.roundedRect(196, iTopRStart, 93, iH + 2, 2, 2, "S");
				oDoc.line(196, iTopRStart + 7, 289, iTopRStart + 7);

				// /***************Aspiration***************/
				// oDoc.setFontSize(11);
				// iTopR = iTopR + 2;
				// iH = 7;
				// iTopRStart = iTopR;
				// iTopR = iTopR + 5;
				// oDoc.setFontStyle("bold");
				// oDoc.text("Aspiration", 197, iTopR);
				// oDoc.setFontSize(9);
				// iTopR = iTopR + 7;
				// // iH = iH + 1;
				// oDoc.setFontStyle("normal");
				// aData = aCData.toAspiration.results;
				// iL = 0;
				// for (i = 0; i < aData.length; i++) {
				// 	iL = iL + 1;
				// 	oDoc.text("Q:", 197, iTopR);
				// 	aText = oDoc.splitTextToSize(aData[i].Question, 85);
				// 	oDoc.text(aText, 202, iTopR);
				// 	iTopR = iTopR + (4 * aText.length);
				// 	iH = iH + (4 * aText.length);
				// 	oDoc.text("A:", 197, iTopR);
				// 	aText = oDoc.splitTextToSize(aData[i].Answer, 85);
				// 	oDoc.text(aText, 202, iTopR);
				// 	iTopR = iTopR + (4 * aText.length);
				// 	iH = iH + (4 * aText.length);
				// 	iTopR = iTopR + 1;
				// 	iH = iH + 1;
				// }
				// if (iL === 0) {
				// 	iH = iH + 5;
				// 	oDoc.text("N/A", 197, iTopR);
				// 	iTopR = iTopR + 1;
				// } else {
				// 	iTopR = iTopR - (4 * aText.length);
				// }
				// oDoc.roundedRect(196, iTopRStart, 93, iH + 2, 2, 2, "S");
				// oDoc.line(196, iTopRStart + 7, 289, iTopRStart + 7);

				// /***************Attribute***************/
				// oDoc.setFontSize(11);
				// iTopR = iTopR + 3;
				// iH = 7;
				// iTopRStart = iTopR;
				// iTopR = iTopR + 5;
				// oDoc.setFontStyle("bold");
				// oDoc.text("Attribute", 197, iTopR);
				// oDoc.setFontStyle("normal");
				// oDoc.setFontSize(9);
				// iTopR = iTopR + 2;
				// aData = aCData.toAttribute.results;

				// iTopR = iTopR + 5;
				// iH = iH + 5;
				// oDoc.setFontStyle("bold");
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.text("Key Leadership", 197, iTopR);
				// oDoc.setFontStyle("normal");
				// iL = 0;
				// for (i = 0; i < aData.length; i++) {
				// 	if (aData[i].CategoryId === "01") {
				// 		iL = iL + 1;
				// 		iTopR = iTopR + 5;
				// 		iH = iH + 5;
				// 		oDoc.setTextColor(f.getColorHex(""));
				// 		oDoc.text(aData[i].AttributeText, 199, iTopR);
				// 		oDoc.setTextColor(f.getColorHex(aData[i].State));
				// 		oDoc.text(aData[i].Value, 286, iTopR, "right");
				// 	}
				// }
				// if (iL === 0) {
				// 	iTopR = iTopR + 5;
				// 	iH = iH + 5;
				// 	oDoc.text("N/A", 199, iTopR);
				// }

				// iTopR = iTopR + 5;
				// iH = iH + 5;
				// oDoc.setFontStyle("bold");
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.text("Level of Engagement", 197, iTopR);
				// oDoc.setFontStyle("normal");
				// iL = 0;
				// for (i = 0; i < aData.length; i++) {
				// 	if (aData[i].CategoryId === "02") {
				// 		iL = iL + 1;
				// 		iTopR = iTopR + 5;
				// 		iH = iH + 5;
				// 		oDoc.setTextColor(f.getColorHex(""));
				// 		oDoc.text(aData[i].AttributeText, 199, iTopR);
				// 		oDoc.setTextColor(f.getColorHex(aData[i].State));
				// 		oDoc.text(aData[i].Value, 286, iTopR, "right");
				// 	}
				// }
				// if (iL === 0) {
				// 	iTopR = iTopR + 5;
				// 	iH = iH + 5;
				// 	oDoc.text("N/A", 199, iTopR);
				// }

				// iTopR = iTopR + 5;
				// iH = iH + 5;
				// oDoc.setFontStyle("bold");
				// oDoc.setTextColor(f.getColorHex(""));
				// oDoc.text("Talent Risk", 197, iTopR);
				// oDoc.setFontStyle("normal");
				// iL = 0;
				// for (i = 0; i < aData.length; i++) {
				// 	if (aData[i].CategoryId === "03") {
				// 		iL = iL + 1;
				// 		iTopR = iTopR + 5;
				// 		iH = iH + 5;
				// 		oDoc.setTextColor(f.getColorHex(""));
				// 		oDoc.text(aData[i].AttributeText, 199, iTopR);
				// 		oDoc.setTextColor(f.getColorHex(aData[i].State));
				// 		oDoc.text(aData[i].Value, 286, iTopR, "right");
				// 	}
				// }
				// if (iL === 0) {
				// 	iTopR = iTopR + 5;
				// 	iH = iH + 5;
				// 	oDoc.text("N/A", 199, iTopR);
				// }
				// oDoc.roundedRect(196, iTopRStart, 93, iH + 2, 2, 2, "S");
				// oDoc.line(196, iTopRStart + 7, 289, iTopRStart + 7);

				aImg.forEach(async function (E, index) {
					try {
						var l = true,
							canvasCreated = await html2canvas(E.Element, {
								backgroundColor: null,
								scale: 5
							});
					} catch (t) {
						l = false;
						sap.m.MessageToast.show("Error loading HTML2CANVAS library, image might be not available in PDF file");
					} finally {
						if (l) {
							oDoc.addImage(canvasCreated.toDataURL("image/png"), "PNG", E.xAxis, E.yAxis, E.Width, E.Height);
						}
					}
					if (index === (aImg.length - 1)) {
						that._onPdfExport2(oDoc, aCData);
					}
				});
			};

			getImageFromUrl(this.byId("idPersDataCard").getIconSrc(), createPDF);
		},

		_onPdfExport2: function (oDoc, aCData) {
			var that = this,
				iTopL = 0,
				iTopLStart = 0,
				iTopC = 0,
				iTopCStart = 0,
				iTopR = 0,
				iTopRStart = 0,
				iH = 0,
				iC = 0,
				iChartHeight = 0,
				iL = 0,
				aText = [],
				aData = [],
				aImg = [],
				oImg = {};

			// 	oVizFrameQua = this._oView.byId("idVizFrameQua"),
			// 	sSVGQua = oVizFrameQua.exportToSVGString({
			// 		width: 1968,
			// 		height: 912
			// 	}).replace(/translate /gm, "translate"),
			// 	oCanvasHTMLQua = document.createElement("canvas");
			// canvg(oCanvasHTMLQua, sSVGQua);
			// var sVizQua = oCanvasHTMLQua.toDataURL("image/png");

			oDoc.addPage("landscape");

			/***************Leadership Assessment***************/
			// oDoc.setFontSize(11);
			// iTopL = 10;
			// iH = 5;
			// iTopLStart = iTopL;
			// oDoc.setFontStyle("bold");
			// oDoc.text("Leadership Assessment", 9, iTopL);
			// oDoc.setFontSize(9);
			// iTopL = iTopL + 2;
			// // iH = iH + 5;
			// oDoc.setFontStyle("normal");
			// oDoc.addImage(sVizQua, "PNG", 12, iTopL, 131, 61);
			// iTopL = iTopL + 60;
			// iH = iH + 60;
			// oDoc.roundedRect(8, 5, 140, iH + 2, 2, 2, "S");
			// oDoc.line(8, iTopLStart + 2, 148, iTopLStart + 2);

			/***************Aspiration***************/
			oDoc.setFontSize(11);
			iTopL = 10;
			iH = 7;
			iTopLStart = iTopL;
			// iTopL = iTopL + 5;
			oDoc.setFontStyle("bold");
			oDoc.text("Aspiration", 9, iTopL);
			oDoc.setFontSize(9);
			iTopL = iTopL + 7;
			// iH = iH + 1;
			oDoc.setFontStyle("normal");
			aData = aCData.toAspiration.results;
			iL = 0;
			for (i = 0; i < aData.length; i++) {
				iL = iL + 1;
				oDoc.text("Q:", 9, iTopL);
				aText = oDoc.splitTextToSize(aData[i].Question, 276);
				oDoc.text(aText, 14, iTopL);
				iTopL = iTopL + (4 * aText.length);
				iH = iH + (4 * aText.length);
				oDoc.text("A:", 9, iTopL);
				if (!aData[i].IsCheckbox) {
					aText = oDoc.splitTextToSize(aData[i].Answer, 276);
					oDoc.text(aText, 14, iTopL);
					iTopL = iTopL + (4 * aText.length);
					iH = iH + (4 * aText.length);
				} else {
					oDoc.text(aData[i].Answer01 + ", " + aData[i].Answer02 + ", " + aData[i].Answer03, 14, iTopL);
					iTopL = iTopL + 4;
					iH = iH + 4;
				}
				iTopL = iTopL + 1;
				iH = iH + 1;
			}
			if (iL === 0) {
				iH = iH + 5;
				oDoc.text("N/A", 9, iTopL);
				iTopL = iTopL + 5;
			} else {
				// iTopL = iTopL - (4 * aText.length);
			}
			oDoc.roundedRect(8, 5, 281, iH + 2, 2, 2, "S");
			oDoc.line(8, iTopLStart + 2, 289, iTopLStart + 2);

			iTopR = iTopL;

			/***************Positive Insight***************/
			oDoc.setFontSize(11);
			iTopLStart = iTopL - 2;
			iTopL = iTopL + 2;
			iH = 7;
			oDoc.setFontStyle("bold");
			oDoc.text("Positive Insight", 9, iTopL);
			oDoc.setFontStyle("normal");
			oDoc.setFontSize(9);
			aData = aCData.toInsight.results;
			iTopL = iTopL + 7;
			iL = 0;
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].SubtypeId === "0001") {
					iL = iL + 1;
					aText = oDoc.splitTextToSize(aData[i].Comments, 138);
					oDoc.text(aText, 9, iTopL);
					iTopL = iTopL + (4 * aText.length);
					iH = iH + (4 * aText.length);
					iTopL = iTopL + 1;
					iH = iH + 1;
				}
			}
			if (iL === 0) {
				iH = iH + 5;
				oDoc.text("N/A", 9, iTopL);
				iTopL = iTopL + 1;
			} else {
				iTopL = iTopL - (4 * aText.length);
			}
			oDoc.roundedRect(8, iTopLStart, 140, iH + 2, 2, 2, "S");
			oDoc.line(8, iTopLStart + 7, 148, iTopLStart + 7);

			/***************Constructive Insight***************/
			oDoc.setFontSize(11);
			iTopRStart = iTopR - 2;
			iTopR = iTopR + 2;
			iH = 7;
			oDoc.setFontStyle("bold");
			oDoc.text("Constructive Insight", 150, iTopR);
			oDoc.setFontStyle("normal");
			oDoc.setFontSize(9);
			iTopR = iTopR + 7;
			iL = 0;
			for (i = 0; i < aData.length; i++) {
				if (aData[i].SubtypeId === "0002") {
					iL = iL + 1;
					aText = oDoc.splitTextToSize(aData[i].Comments, 138);
					oDoc.text(aText, 150, iTopR);
					iTopR = iTopR + (4 * aText.length);
					iH = iH + (4 * aText.length);
					iTopR = iTopR + 1;
					iH = iH + 1;
				}
			}
			if (iL === 0) {
				iH = iH + 5;
				oDoc.text("N/A", 150, iTopR);
				iTopR = iTopR + 1;
			} else {
				iTopR = iTopR - (4 * aText.length);
			}
			oDoc.roundedRect(149, iTopRStart, 140, iH + 2, 2, 2, "S");
			oDoc.line(149, iTopRStart + 7, 289, iTopRStart + 7);

			// if (iTopL > iTopR) {
			// 	iTopC = iTopL;
			// 	iTopR = iTopL;
			// } else {
			// 	iTopC = iTopR;
			// 	iTopL = iTopR;
			// }

			/***************Supervisor Insight***************/
			// oDoc.setFontSize(11);
			// iTopL = iTopL + 2;
			// iH = 7;
			// iTopLStart = iTopL;
			// iTopL = iTopL + 5;
			// oDoc.setFontStyle("bold");
			// oDoc.text("Supervisor Insight", 9, iTopL);
			// oDoc.setFontStyle("normal");
			// oDoc.setFontSize(9);
			// iTopL = iTopL + 7;
			// iH = iH + 5;
			// oDoc.setFontStyle("bold");
			// oDoc.text("Strength", 9, iTopL);
			// oDoc.setFontStyle("normal");
			// iTopL = iTopL + 4;
			// iH = iH + 4;
			// oDoc.text(aDData.Strength, 11, iTopL);
			// iTopL = iTopL + 16;
			// iH = iH + 16;
			// iTopL = iTopL + 5;
			// iH = iH + 5;
			// oDoc.setFontStyle("bold");
			// oDoc.text("Weakness", 9, iTopL);
			// oDoc.setFontStyle("normal");
			// iTopL = iTopL + 4;
			// iH = iH + 4;
			// oDoc.text(aDData.Weakness, 11, iTopL);
			// iTopL = iTopL + 16;
			// iH = iH + 16;
			// oDoc.roundedRect(8, iTopLStart, 140, iH + 2, 2, 2, "S");
			// oDoc.line(8, iTopLStart + 7, 148, iTopLStart + 7);

			// jQuery.sap.delayedCall(2500, that, function() {
			oDoc.save(aCData.EmployeeNumber + ".pdf");
			that._oBusy.close();
			// });
		}
	});
});