/** FILE Functions **/
export function dataURItoBlob(dataURI) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for(var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

export function formatFilename(str) {
  return str.replace(/^\w+-/, "");
}

/** DATE Functions **/

export function getNumberOfDaysSince(datetimeStr) {
  var now = new Date();
  var datefromAPITimeStamp = (new Date(datetimeStr)).getTime();
  var nowTimeStamp = now.getTime();

  var microSecondsDiff = Math.abs(datefromAPITimeStamp - nowTimeStamp );
  // Number of milliseconds per day =
  //   24 hrs/day * 60 minutes/hour * 60 seconds/minute * 1000 msecs/second
  var daysDiff = Math.floor(microSecondsDiff/(1000 * 60 * 60  * 24));

  return(daysDiff);
}