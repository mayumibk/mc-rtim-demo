Date.K = Date.K || {};

Date.K.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
Date.K.shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
Date.K.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Date.K.shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
Date.K.abbreviatedDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

Date.K.shortForm = '%m/%d/%Y';
Date.K.mediumForm = '%d %b %Y';
Date.K.mediumShortYearForm = '%d %b %y';
Date.K.longForm = '%e %B %Y';
Date.K.fullForm = '%A, %B %e, %Y';

Date.K.parseLocalized = function(str) {
	var date = str.split(/[\/\. -]/, 3);
	return (date[0] && date[1] && date[2]) ? new Date(+date[2], +date[0]-1, +date[1]) : 0;
};

OWL.Requirement.met('Localization.Date');
