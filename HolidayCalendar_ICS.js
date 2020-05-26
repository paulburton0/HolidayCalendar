ics = require('ics');
const {writeFileSync } = require('fs');

// This script populates an ICS file with events throughout the year 
// on the US Public Holidays Calendar.

const year = 2020;

var events = new Array();

function createEvent(year, month, day, title){
    var endDay = day;
    var endMonth = month;
    var endYear = year;
    if( day == daysInMonth(month, year) ){
        endDay = 1;
	if (month == 12){
	    endMonth = 1;
	    endYear = year+1;
        } else {
	    endMonth = month+1;
        }
    } else {
        endDay = day+1;
    }
    var event = {
        start: [year, month, day],
	end: [endYear, endMonth, endDay],
        title: title
    }
    return(event);
}

function leap(year){
    var by4 = !(year % 4);           // divisible by 4?
    var by100 = !(year % 100);       // divisible by 100?
    var by400 = !(year % 400);       // divisible by 400?
    return ( (by4 && !by100) || by400 );
}

function daysInMonth(month, year){
    month = month-1;
    var days = new Array ( 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 );
    if (leap(year)) days[1] = 29;
    return days[month];
}

function dayOfYear(month, date, year){
   var x;
   doy = 0;
   for (x = 1 ; x < month; x++){
       doy += parseInt(daysInMonth(x, year));
   }
   doy = doy + date;
   return doy;
}

function cartersQ(year){
   var b, d, e, q;
   b = 225 - 11 * (year % 19);
   d = ((b - 21) % 30) + 21;
   if (d > 48) d-=1;
   e = (year + parseInt(year/4) + d + 1) % 7;
   q = d + 7 - e;
   return q;
}

function calcEaster(year){
  var q = cartersQ(year);
  var month, date;
  if (q < 32){
    month = 3;        // Easter is in March
    date = q;
  }else{
    month = 4;        // Easter is in April
    date = parseInt(q - 31);
  }
  return dayOfYear(month, date, year);
}

function extractMonth(dayOfYear, year){
   var total = dayOfYear;
   var month = 1;  
   while(total > daysInMonth(month, year)){
     total -= daysInMonth(month, year);
     month++;       
   }
   return month;
}

function extractDate(dayOfYear, year){
   var day = dayOfYear;
   var x;
   month = extractMonth(dayOfYear, year);
   for(x = 1; x < month; x++){
     day -= daysInMonth(x, year);
   }
   return day;
}

function numToMonth(month){
  var list = new Array
    ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
  return (list[month]);
}

var easter = calcEaster(year);
events.push(createEvent(year, extractMonth(easter, year), extractDate(easter, year), "Easter"));

var x, fixedCount;
var month, day, name, offset;

var fixedHolidays = new Array
  (
  "New Years Day", 1, 1,
  "Valentine's Day", 2, 14,
  "St. Patrick's Day", 3, 17,
  "Independence Day", 7, 4,
  "Halloween", 10, 31,
  "Veterans Day", 11, 11,
  "Christmas Eve", 12, 24,
  "Christmas", 12, 25,
  "New Years Eve", 12, 31
  );

// MLK Jr. Day - 3rd Monday in January
// Presidents' Day - 3nd Monday is February
// Memorial Day - Last Monday in May
// Labor Day - 1st Monday in September
// Columbus Day - 2nd Monday in October
// Thankgiving Day - 4th Thursday in November


function populateCalendar(){
  
  fixedCount = fixedHolidays.length;
  
  for(x = 0; x < fixedCount; x+=3){
    var title = fixedHolidays[x];
    var month = fixedHolidays[x+1];
    var day = fixedHolidays[x+2];
    events.push(createEvent(year, month, day, title));
  }

} 

populateCalendar();

ics.createEvents(events, function(error, value){
    if (error) {
        console.error(error);
        return;
    }
    writeFileSync('./HolidayCal_'+year+'.ics', value);
});
