/**
 * The OmniDate class provides functionality for different date systems.
 * The OmniDate class defines a bunch of methods for creating calendars
 * and navigating dates.  Most of these methods should never be modified
 * in child classes.  The only four methods that require modification
 * for a different style of calendar are setCalDate(), getCalDate(),
 * getShortMonthName(), and getMonthName().  The remainder of the methods
 * use the set/getCalDate() to do all necessary date manipulations.
 *
 * To create a new OmniDate object, OmniDate_setDefaultType() should first
 * be called to specify what type of calendar is to be used.  If the NRF
 * or QRS are being used, it might be wise to use OmniDate_setAnchor() as
 * well to set the first day of the year.  Once this is done, you can call
 * OmniDate_createInstance() to create a new instance of the default type
 * of date.
 *
 * There is another class which gives similar functionality in PHP.  If any
 * bugs are found in this class, it would be wise to make sure that the bugs
 * do not exist in the PHP version as well.
 *
 * Author:  Michael Bailey
 *   Date:  Jun 2004
 */

/*** GENERAL METHODS ***/

// specify the default type of OmniDate created by calls to
// OmniDate_createInstance().
// Gregorian:   	type=1
// NRF:				type=2
// QRS:				type=3
// Custom 4-5-4:	type=4
// Custom 4-4-5:	type=3
function OmniDate_setDefaultType(type) {
	var constructor = null;
	switch (type) {
		case 5: constructor = OmniDate_ModifiedGregorian; break;
		case 4: constructor = OmniDate_Custom445; break;
		case 3: constructor = OmniDate_Custom454; break;
		case 2: constructor = OmniDate_QRS; break;
		case 1: constructor = OmniDate_NRF; break;
		default:
		case 0: constructor = OmniDate; break;
	}
	OmniDate.prototype.defaultTypeId = type;
	OmniDate.prototype.defaultType = constructor;
}

// return an instance of the default OmniDate type
function OmniDate_createInstance() {
	return new OmniDate.prototype.defaultType(arguments);
}

// set the anchor date
function OmniDate_setAnchor(y,m,d) {
    OmniDate_Custom454.prototype.anchor_year   = OmniDate_Custom445.prototype.anchor_year = OmniDate_ModifiedGregorian.prototype.anchor_year = y;
    OmniDate_Custom454.prototype.anchor_day    = OmniDate_Custom445.prototype.anchor_day  = OmniDate_ModifiedGregorian.prototype.anchor_day = d;
    OmniDate_Custom454.prototype.anchor_month  = OmniDate_Custom445.prototype.anchor_month = OmniDate_ModifiedGregorian.prototype.anchor_month = m;
    OmniDate_Custom454.prototype.first_weekday = OmniDate_Custom445.prototype.first_weekday = OmniDate_ModifiedGregorian.prototype.first_weekday = new Date(y,m-1,d).getDay();
}

// return whether or not a custom calendar is being used
function OmniDate_isCustom() {
	return OmniDate.prototype.defaultTypeId > 0;
}

/*** class OmniDate ***/

// Constructor: set the date to now
function OmniDate() {
	// Pass argument list from create instance using arguments[0];
    this.setTime(this._getConstructorDate(arguments[0]));
}

// OmniDate class definition
OmniDate.prototype = {


    /*** CONSTANTS ***/

	// title of calendar for preview
	title: "Gregorian Calendar",

	// date from which to calculate daystamps
    EPOCH: new Date(1984,0,1,0,0,0).getTime(),

	// names of the months both short and long form
	SHORT_MONTH_NAMES: _SHORT_MONTH_NAMES,
	MONTH_NAMES: _MONTH_NAMES,
	
	// Enum for date parts.
	e_date_parts: {YEAR: 0, MONTH: 1, DATE: 2},


	/*** STATIC FIELDS ***/

	// default OmniDate type used by OmniDate_createInstance()
	defaultType: OmniDate,

	// function used by OmniDate.createNew()
	constructor:  OmniDate,


    /*** MEMBER FIELDS ***/

	// daystamp, this is how OmniDate stores all dates: the
	// number of days since the EPOCH
    days: 0,

	// the first day of each week ( 0 = Sunday, 6 = Saturday)
	first_weekday: 0,


    /*** VIRTUAL METHODS ***/

    // get the year, month, and day
    getCalDate: function() {
        var d = this.getTime();
        return new Array(d.getFullYear(),d.getMonth()+1,d.getDate());
    },

    // set the internal day count from a year, month, and day
    setCalDate: function(y,m,d) {
		if (m == 0) { y -= 1; m = 12; } // handle Safari bug - see bug 1399
		this.setTime(new Date(y,m-1,d));
	},
	
	/*** JavaScript Date Type Methods **/
	/* These methods allow OmniDate to mimic standard JavaScript Date functionality. */
	
	// Gets the correct date to initialize an OmniDate with for the contructor.
	// Supported constructors are; OmniDate_createInstance(), OmniDate_createInstance(OmniDate),
	// OmniDate_createInstance(year, month, date), OmniDate_createInstance(milliseconds), and OmniDate_createInstance(dateString)
	// *Important note: When initializing using (year, month, date). You must use real date, and not omni date because of offset.
	_getConstructorDate: function(create_args) {
		var con_date = null;
		// If there are no creation arguments, get now date.
		if (create_args == null) {
			con_date = new Date();
		
		} // Try to construct date from arguments.
		else {
			// If date has three arguments, must be year, month, date.
			if (create_args.length == 3) {
				con_date = new Date(create_args[0], create_args[1], create_args[2]);
			
			} // Only other types have 3 arguments.
			else if (create_args.length == 1 && create_args[0] != null) {
			
				// Check if it is omnidate; otherwise must be a standard type.
				if (typeof create_args[0].getStandardDate != 'undefined') {
					con_date = create_args[0].getStandardDate();
				}
				else {
					con_date = new Date(create_args[0]);
				}
			
			} // Unable to use parameters, create date as today.
			else {
				con_date = new Date();
			}
		}
		
		// Make sure date is in first hour, for later rounding.
		if (con_date != null) {
			con_date.setHours(0, 0, 0);
		}	
		
		return con_date;
	},
	
	// Gets a standard JavaScript date of the current OmniDate.
	getStandardDate: function() {
		return this.getTime();
	},
	
	// Returns year in full 4 digit format (ie: 2004).
	getFullYear: function() {
		return this.getCalDate()[this.e_date_parts.YEAR];
	},
	
	// Sets the year of the Date object. (year: 4 digit year).
	setFullYear: function(year) {
		var cal_date = this.getCalDate();
		this.setCalDate(year, cal_date[this.e_date_parts.MONTH], cal_date[this.e_date_parts.DATE]); 
	},
	
	// Returns the month. (Range is 0-11)!
	getMonth: function() {
		return this.getCalDate()[this.e_date_parts.MONTH] - 1;
	},
	
	// Sets the month of the Date object. (month: 0-11)
	setMonth: function(month) {
		var cal_date = this.getCalDate();
		this.setCalDate(cal_date[this.e_date_parts.YEAR], month + 1, cal_date[this.e_date_parts.DATE]); 
	},	
	
	// Returns the day of the month (Range is 1-31)
	getDate: function() {
		return this.getCalDate()[this.e_date_parts.DATE];
	},
	
	// Sets the day of the month of the Date object. (day_of_month: 1-31).
	setDate: function(date) {
		var cal_date = this.getCalDate();
		this.setCalDate(cal_date[this.e_date_parts.YEAR], cal_date[this.e_date_parts.MONTH], date); 
	},		
	
	// Returns the custom day of the week (Range is 0-6). 0=Sunday, 1=Monday, etc, depending on calendar type.
	getDay: function() {
		return this.days - this.getStartOfCalWeek().days;
	},
	
	// Converts a Date to days since EPOCH.
	valueOf: function() {
		return this.days;
	},
	
	// Gets type of calendar.
	getCalendarType: function() {
		return this.defaultTypeId;
	},
	
	// Formats date in specified format, with localization.
	// format is optional
	// use_omni_date is optional, and date is formatted using the real date by default. 
	toString: function(format, use_omni_date) {
		var text_date = '';
		var omni_date = this;     
	    var in_date = this.getStandardDate();
	    
	    // Set format if there is none.
	    if (!format) {
	    	format = 'mm/dd/yyyy';
	    }
	    
	    // Check if real date, or omnidate should be used.
	    if (use_omni_date) {
	    	text_date =  format.replace(/(yyyy|yy|mmmm|mmm|mm|dddd|ddd|dd|d|hh|nn|ss|a)/gi,
		        function($1)
		        {
		            switch ($1.toLowerCase())
		            {
			            case 'yyyy': return omni_date.getFullYear();
			            case 'yy':	 return (omni_date.getFullYear() + '').substr(2, 2); 
			            case 'mmmm': return omni_date.getMonthName(omni_date.getMonth() + 1);
			            case 'mmm':  return omni_date.getShortMonthName(omni_date.getMonth() + 1);
			            // Use real date for month number only.
			            case 'mm':   return Omniture.util.pad((in_date.getMonth() + 1), '0', 2);
			            case 'dddd': return Omniture.util.DAY_NAMES[omni_date.getDay()];
			            case 'ddd':  return Omniture.util.DAY_NAMES[omni_date.getDay()].substr(0, 3);
			            case 'dd':   return Omniture.util.pad(omni_date.getDate(), '0', 2);
			            case 'd':    return omni_date.getDate();
		            }
		        }
		    );
		    	    
	    } // Format as standard date.
	    else {
	    	text_date =  format.replace(/(yyyy|yy|mmmm|mmm|mm|dddd|ddd|dd|d|hh|nn|ss|a)/gi,
		        function($1)
		        {
		            switch ($1.toLowerCase())
		            {
			            case 'yyyy': return in_date.getFullYear();
			            case 'yy':	 return (in_date.getFullYear() + '').substr(2, 2); 
			            case 'mmmm': return omni_date.MONTH_NAMES[in_date.getMonth()];
			            case 'mmm':  return omni_date.SHORT_MONTH_NAMES[in_date.getMonth()];
			            case 'mm':   return Omniture.util.pad((in_date.getMonth() + 1), '0', 2);
			            case 'dddd': return Omniture.util.DAY_NAMES[in_date.getDay()];
			            case 'ddd':  return Omniture.util.DAY_NAMES[in_date.getDay()].substr(0, 3);
			            case 'dd':   return Omniture.util.pad(in_date.getDate(), '0', 2);
			            case 'd':    return in_date.getDate();
		            }
		        }
		    );	    
	    }
	    
	    return text_date;
	},
	
	localized: function()
	{
		var locale = Omniture.Config.locale || 'en_US';
		switch (locale) {
			case 'en_US':
				return this.toString('mm/dd/yyyy');
			default:
				return this.toString('yyyy-mm-dd');
		}
	},

	/*** PUBLIC METHODS ***/
	
	// Gets the difference in days between two OmniDate objects.
	getDiffInDays: function(op_date) {
		return this.valueOf() - op_date.valueOf();
	},

    // return the timestamp for the current date in real time
    getTime: function() { return this.daysToTime(this.days); },

    // set the internal day count from a date object
	//timestamp should be midnight in the timezone of the user. See notes for timeToDays function.
    setTime: function(timestamp) { this.days = this.timeToDays(timestamp); },
    
    // Convert the date into YMD format
    // @return string YMD formated date
    toYMD: function() {
	ymd = this.getCalDate()
	return (ymd[0]-1900)*10000+(ymd[1]-1)*100+ymd[2];
    },
    
     // Set the date from a YMD, YM, or Y date string
     // @param string $str date string
    fromYMD: function(str) {

        // get the year, month, and day
        ymd = parseInt(str,10);
        
        // Convert to full digits.
        // Year only (107)
        if (ymd < 1000) {
        	ymd *= 10000;
        
        } // Month only (10706)
        else if (ymd < 100000) {
        	ymd *= 100;
        }        
        
        y = parseInt(ymd/10000,10)+1900;
        m = parseInt(ymd/100,10)%100+1;
        d = ymd%100;
        if (!d)  d = 1;

        // set the date
        this.days = this.timeToDays(new Date(y,m,d,0,0,0));
    },

	// set the calendar month
	setCalMonth: function(month) {
		this.setCalDate(this.getCalDate()[0],month,1);
	},

	// set the calendar year
	setCalYear: function(year) {
		this.setCalDate(year,this.getCalDate()[1],1);
	},
	
	// Gets the first day of the week for this type of calendar (0-6).
	getFirstDayOfWeek: function() {
		return this.first_weekday;
	},
	
	//Get the first day of the current custom week
    getStartOfCalWeek: function() {
	       days = this.days - (this.days%7 - this.first_weekday+7)%7;
	       return this.createNew(days);
	       //$days = $this->days - ($this->days%7-$this->first_weekday+7)%7;
	       //return $this->createInstance($days);
	},
      
	//Get the first day of the next current custom week
    getNextCalWeek: function() {
		var newDate = this.createNew();
		if ((this.days%7) != this.first_weekday){
			newDate.days = this.days + (this.first_weekday - (this.days%7)+7)%7;
		} else {
			newDate.days = this.days + 7;
		}
		return newDate;
		/*
		$date = $this->createInstance();
		if (($this->days%7) != $this->first_weekday) {
			$date->days = $this->days + ($this->first_weekday-($this->days%7)+7)%7;
		} else {
			$date->days = $this->days + 7;
		}
		return $date;
		*/
    },

	// get the start of this calendar month
	getStartOfCalMonth: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		newDate.setCalDate(ymd[0],ymd[1],1);
		return newDate;
	},

	// get the next calendar month
	getNextCalMonth: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		newDate.setCalDate(ymd[0],ymd[1]+1,1);
		return newDate;
	},

	// get the length of the current calendar month
	getCalMonthLength: function() {
		var thisMonth = this.getStartOfCalMonth();
		var nextMonth = this.getNextCalMonth();
		return nextMonth.days-thisMonth.days;
	},
	
	// Gets the end date of this month.
	getEndOfCalMonth: function() {
		var nextMonth = this.getNextCalMonth();
		nextMonth.days--;
		return nextMonth;	
	},
	
	// get the start of the next quarter
	getNextCalQuarter: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		newDate.setCalDate(ymd[0],ymd[1]+3,1);
		return newDate;
	},
	
	// Gets the start of this quarter.
	getStartOfCalQuarter: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		var month = ymd[this.e_date_parts.MONTH] - 1;
		month = month - (month % 3);
		newDate.setCalDate(ymd[this.e_date_parts.YEAR], month + 1, 1);
		return newDate;
	},
	
	// Gets the end of this quarter.
	getEndOfCalQuarter: function() {
		var newDate = this.getStartOfCalQuarter();
		var ymd = newDate.getCalDate();
		var month = ymd[this.e_date_parts.MONTH] + 2;
		newDate.setCalDate(ymd[this.e_date_parts.YEAR], month, 1);
		newDate = newDate.getEndOfCalMonth();
		return newDate;
	},	

	// get the start of this calendar year
	getStartOfCalYear: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		newDate.setCalDate(ymd[0],1,1);
		return newDate;
	},
	
	// Gets the end of this calendar year.
	getEndOfCalYear: function() {
		var newDate = this.getNextCalYear();
		newDate.days--;
		return newDate;	
	},

	// get the start of the next calendar year
	getNextCalYear: function() {
		var newDate = this.createNew();
		var ymd = this.getCalDate();
		newDate.setCalDate(ymd[0]+1,1,1);
		return newDate;
	},

	// get the length of the current calendar month
	getCalYearLength: function() {
		var thisYear = this.getStartOfCalYear();
		var nextYear = this.getNextCalYear();
		return nextYear.days-thisYear.days;
	},

	// create a new instance of this class
	createNew: function(days) {
		var newDate = new this.constructor();
		if (days != null)  newDate.days = days;
		return newDate;
	},


    /*** STATIC METHODS ***/

	// get the name of the given month
	getMonthName: function(month) {
		return this.MONTH_NAMES[month-1];
	},

	// get the short name of the given month
	getShortMonthName: function(month) {
		return this.SHORT_MONTH_NAMES[month-1];
	},

    // convert a date object to days. Note - in some cases it looks like an OmniDate object gets passed as param instead of a Date.
	// The return value is the numbers of days from Jan 1st 1984 00:00:00 in the timezone of the user to the timestamp param
	//
	// This function has a major bug. If you pass a timestamp that is on or after 12:00PM then it will round up and give you the number of days to the following day.
	// This bug has existed for many years and fixing it would break other classes that now depend on it working as is (ex. CalendarWidget.js)
	// For CalendarWidget.js it is passing some timestamps in midnight UTC (which is actually the previous day for users with a timezone that has a negative offset like all US Timezones)
	// Because Math.round rounds up when a value is greater than .5 it actually gives you the correct number of days in the timezone of the report suite when you pass midnight UTC for all timezones except New Zealand (UTC+12) which breaks because it is more than .5 days ahead of UTC.
	// Examples:
	// timestamp = Feb 25 2013 11:59PM UTC-6, browser timezone = UTC-6 will return the number of days to Feb 26 2013 instead of Feb 25 2013
	// timestamp = Feb 26 2013 11:59AM UTC-6, browser timezone = UTC-6 will return the number of days to Feb 26 2013
	// timestamp = Feb 26 2013 12:00PM UTC-6, browser timezone = UTC-6 will return the number of days to Feb 27 2013 instead of Feb 26 2013
	//
	// As long as this bug exists, the function should only be passed timestamps that are midnight in the timezone of the user.
	//
    timeToDays: function(timestamp) {
		var result_days = Math.round(((timestamp.getTime()-this.EPOCH)/86400000)); //Math.round should be Math.floor but fixing it would break dependent classes.
		// New Zealand fix - Done to fix inconsistent behavior in CalendarWidget.js that is difficult to refactor
		// If the timezone is UTC+12 or greater and the timestamp is 12PM or later then it results in the day being rounded up when it shouldn't, so subtract a day.
		if((timestamp instanceof Date) && (timestamp.getTimezoneOffset() / 60 ) <= -12 && timestamp.getHours() >= 12){
			result_days--;
		}
		return result_days;
    },

    // convert days to a date object
    daysToTime: function(days) {
        return new Date(13200000+days*86400000+this.EPOCH);
    }    
  
};


/**
 * The NRF calendar is defined by the sequence 4-5-4,
 * where the first month has 4 weeks, second 5, third 4,
 * then we repeat.
 */

/*** class OmniDate_NRF ***/

// constructor and inheritance
function OmniDate_NRF() {
    this.setTime(this._getConstructorDate(arguments[0]));
}
OmniDate_NRF.prototype = new OmniDate();
OmniDate_NRF.prototype.constructor = OmniDate_NRF;
OmniDate_NRF.prototype.title = "4-5-4 Retail Calendar";


/*** FIELDS ***/

// length of first and second month.  This is the only
// difference between NRF and QRS calendars
OmniDate_NRF.prototype.second_month_length = 63;

// anchor
OmniDate_NRF.prototype.anchor_day    = 4;
OmniDate_NRF.prototype.anchor_month  = 2;
OmniDate_NRF.prototype.anchor_year   = 2001;
OmniDate_NRF.prototype.first_weekday = new Date(2001,1,4).getDay();


/*** PUBLIC METHODS ***/

// find the first day of a calendar year
OmniDate_NRF.prototype.calcFirstDay = function(year) {
    var month = this.anchor_month;
    var day   = this.anchor_day;
    var w0    = this.first_weekday
    var w1    = new Date(year,month-1,day).getDay();
    return this.timeToDays(new Date(year,month-1,day-(7+w1-w0)%7));
}

// get the calendar year, month, and day
OmniDate_NRF.prototype.getCalDate = function() {

    // find the calendar year by first checking
    // the real year
    var y = this.getTime().getFullYear();
    var first = this.calcFirstDay(y);
    var next;

    // if the date is before the first day of the
    // calendar year, decrement the year by one
    if (this.days < first)  first = this.calcFirstDay(--y);

    // if the date is after the first day of the
    // following calendar year, increment the year by one
    else if (this.days >= (next = this.calcFirstDay(y+1))) {
        first = next;
        y++;
    }

    // find what year quarter it is by dividing the day offset
    // from the first of the calendar year by 4+5+4 weeks = 91 days
    var q = Math.floor((this.days-first)/91);
    if (q>3)  q = 3;

    // find the days past the quarter
    var d = this.days-q*91-first;

    // if the days are less than 4 weeks, it's the first month
    // of the quarter
    if (d < 28)  m = q*3+1;

    // less than 9 weeks makes it the second month of the quarter
    else if (d < this.second_month_length) {
        m = q*3+2;
        d -= 28;

    // otherwise, it must be the third month
    } else {
        m = q*3+3;
        d -= this.second_month_length;
    }

    // reindex the day so it starts at one
    d++;

    // return the results
    return new Array(y,m,d);
}

// set the internal day countr from a calendar year, month, and day
OmniDate_NRF.prototype.setCalDate = function(y,m,d) {

    // zero index the month
    m--;

    // change year so that the month is between 0-11
    if (m<0) {
        y -= Math.floor(m/-12)+1;
        m = (m%12)+12;
    } else if (m>11) {
        y += Math.floor(m/12);
        m %= 12;
    }

    // find the first day of the year, and increment by the given
    // day of the month
    this.days = this.calcFirstDay(y);
    this.days += d-1;


    // increment the days by the quarter number of the month times
    // 4+5+4 weeks = 91 days
    this.days += Math.floor(m/3)*91;

    // adjust the days depending upon the day in the quarter
    if (m%3 == 1)      this.days += 28;
    else if (m%3 == 2)  this.days += this.second_month_length;
}

// get the name of the given month
OmniDate_NRF.prototype.getMonthName = function(month) {
	month += this.anchor_month + (this.anchor_day < 15 ? 10 : 11);
	return this.MONTH_NAMES[month%12];
};

// get the short name of the given month
OmniDate_NRF.prototype.getShortMonthName = function(month) {
	month += this.anchor_month + (this.anchor_day < 15 ? 10 : 11);
	return this.SHORT_MONTH_NAMES[month%12];
};


/*** class OmniDate_QRS ***/
/**
 * The QRS calendar is defined by the sequence 4-4-5,
 * where the first month has 4 weeks, second 4, third 5,
 * then we repeat.
 */

// constructor and inheritance
function OmniDate_QRS() {
    this.setTime(this._getConstructorDate(arguments[0]));
	this.second_month_length = 56;
}
OmniDate_QRS.prototype = new OmniDate_NRF();
OmniDate_QRS.prototype.constructor = OmniDate_QRS;
OmniDate_QRS.prototype.title = "QRS Calendar";

// anchor
OmniDate_QRS.prototype.anchor_day    = 1;
OmniDate_QRS.prototype.anchor_month  = 1;
OmniDate_QRS.prototype.anchor_year   = 2006;
OmniDate_QRS.prototype.first_weekday = new Date(2006,0,1).getDay();


/*** class OmniDate_Custom454 */
/**
 * Same as NRF but with a custom anchor.
 */

// constructor and inheritance
function OmniDate_Custom454() { this.setTime(this._getConstructorDate(arguments[0])); }
OmniDate_Custom454.prototype = new OmniDate_NRF();
OmniDate_Custom454.prototype.constructor = OmniDate_Custom454;
OmniDate_Custom454.prototype.title = "Custom 4-5-4 Calendar";


/*** class OmniDate_Custom445 */
/**
 * Same as QRS but with a custom anchor.
 */

// constructor and inheritance
function OmniDate_Custom445() { this.setTime(this._getConstructorDate(arguments[0])); }
OmniDate_Custom445.prototype = new OmniDate_QRS();
OmniDate_Custom445.prototype.constructor = OmniDate_Custom445;
OmniDate_Custom445.prototype.title = "Custom 4-4-5 Calendar";


/*** class OmniDate_ModifiedGregorian */
/**
 * Same as OmniDate but with a custom start month and first day of week.
 */

// constructor and inheritance
function OmniDate_ModifiedGregorian() { this.setTime(this._getConstructorDate(arguments[0])); }
OmniDate_ModifiedGregorian.prototype = new OmniDate();
OmniDate_ModifiedGregorian.prototype.constructor = OmniDate_ModifiedGregorian;
OmniDate_ModifiedGregorian.prototype.title = "Modified Gregorian Calendar";


// get the calendar year, month, and day
OmniDate_ModifiedGregorian.prototype.getCalDate = function() {
	var d = this.getTime();
	var m = d.getMonth()+(2-this.anchor_month);
	var y = d.getFullYear();
	while( m <= 0 ) {
		m += 12;
		y--;
	}
	return new Array(y,m,d.getDate());
}

// set the internal day countr from a calendar year, month, and day
OmniDate_ModifiedGregorian.prototype.setCalDate = function(y,m,d) {
	m += this.anchor_month-2;
	while( m > 12 ) {
		m -= 12;
		y++;
	}
	this.setTime(new Date(y,m,d));
}

// get the name of the given month
OmniDate_ModifiedGregorian.prototype.getMonthName = function(month) {
	month += this.anchor_month-2;
	return this.MONTH_NAMES[month%12];
};

// get the short name of the given month
OmniDate_ModifiedGregorian.prototype.getShortMonthName = function(month) {
	month += this.anchor_month-2;
	return this.SHORT_MONTH_NAMES[month%12];
};
