sap.ui.define([], function() {
	"use strict";
	return {
		formatImageURL: function(m) {
			if (m && typeof m === "string") {
				var u = "",
					l = document.createElement("a"),
					e = function(S) {
						return S.replace(new RegExp("'", "g"), "%27");
					};
				l.href = m;
				u = (l.pathname.charAt(0) === "/") ? l.pathname : "/" + l.pathname;
				return e(u);
			}
			return "";
		},

		formatTextWithBrackets: function(t, T) {
			if (T) {
				return t + " (" + T + ")";
			}
			return t;
		},

		formatTextWithDash: function(t, T) {
			if (T instanceof Date && !isNaN(T.valueOf())) {
				var y = T.getFullYear();
			} else {
				y = T;
			}
			if (y) {
				return y + " - " + t;
			}
			return t;
		},

		formatEmpName: function(n, e) {
			if (sap.ui.Device.system.desktop && e) {
				if (e && e !== "00000000") {
					return n + " (" + e + ")";
				}
			}
			return n;
		},

		formatCertText: function(n) {
			return "Certification (" + n.toString() + ")";
		},

		formatAge: function(s) {
			var y = parseInt(s.substring(0, 2), 10),
				m = parseInt(s.substring(2, 4), 10);
			if (m === 0) {
				return y.toString() + " years";
			} else if (m === 1) {
				return y.toString() + " years and " + m.toString() + " month";
			} else {
				return y.toString() + " years and " + m.toString() + " months";
			}
		},

		formatEducation: function(e, s, i) {
			return e + " " + s + " " + " - " + i;
		},

		formatDevProgram: function(y, t, s) {
			return y + " - " + t + " (" + s + ")";
		},

		formatYos: function(s, d) {
			var y = parseInt(s.substring(0, 2), 10),
				m = parseInt(s.substring(2, 4), 10),
				dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "d MMM YYYY"
				}),
				D = dateFormat.format(d);
			if (m === 0) {
				return y.toString() + " years (Join in " + D + ")";
			} else if (m === 1) {
				return y.toString() + " years and " + m.toString() + " month (Join in " + D + ")";
			} else {
				return y.toString() + " years and " + m.toString() + " months (Join in " + D + ")";
			}
		},

		formatYosPos: function(s, d) {
			var y = parseInt(s.substring(0, 2), 10),
				m = parseInt(s.substring(2, 4), 10),
				dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "d MMM YYYY"
				}),
				D = dateFormat.format(d);
			if (m === 0) {
				return y.toString() + " years (From " + D + ")";
			} else if (m === 1) {
				return y.toString() + " years and " + m.toString() + " month (From " + D + ")";
			} else {
				return y.toString() + " years and " + m.toString() + " months (From " + D + ")";
			}
		},

		formatToNumber: function(n) {
			return parseFloat(n);
		},

		formatEdu: function(s, b1, b2, e) {
			var y = e.getFullYear();

			if (b2) {
				return y + " - " + s + " " + b1 + " & " + b2;
			} else {
				return y + " - " + s + " " + b1;
			}
		},

		formatPayScale: function(s, l) {
			var sS = s,
				sL = l;
			if (!s) {
				sS = "-";
			}
			if (!l) {
				sL = "-";
			}
			return sS + " / " + sL;
		},

		getColorHex: function(s) {
			switch (s) {
				default: return "#000000";
				case "Good":
						case "Success":
						return "#2B7D2B";
				case "Critical":
						case "Warning":
						return "#E78C07";
				case "Error":
						return "#BB0000";
				case "LightGrey":
						return "#e6e6e6";
			}
		}
	};
});