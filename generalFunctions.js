export function convertDateTimeToHumanFormat(datetimeValue) {
    // Parse the datetime-local string into a Date object
    const date = new Date(datetimeValue);

    // Arrays for month and day of the week names
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsOfYear = [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Extract individual components from the Date object
    const dayOfWeek = daysOfWeek[date.getDay()]; // Get the name of the day (e.g., "Monday")
    const month = monthsOfYear[date.getMonth()]; // Get the name of the month (e.g., "December")
    const day = date.getDate(); // Get the day of the month (e.g., 24)
    const year = date.getFullYear(); // Get the full year (e.g., 2024)
    let hours = date.getHours(); // Get the hours (e.g., 10)
    const minutes = date.getMinutes(); // Get the minutes (e.g., 30)
    const ampm = hours >= 12 ? 'PM' : 'AM'; // Determine AM or PM
    hours = hours % 12; // Convert to 12-hour format
    if (hours === 0) hours = 12; // Handle midnight case (00:00 to 12:00)
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes; // Ensure minutes have leading zero if necessary

    // Construct the final human-readable date string
    const formattedDate = `${dayOfWeek}, ${month} ${day}, ${year}, ${hours}:${formattedMinutes} ${ampm}`;
    return formattedDate;
}
export function getMillisecondsFromDateTime(datetimeValue) {

    // Split the datetime-local value into date and time components
    const [datePart, timePart] = datetimeValue.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');

    // Create a new Date object using the extracted components
    // Note: JavaScript months are 0-indexed, so we subtract 1 from the month
    const date = new Date(year, month - 1, day, hours, minutes);

    // Return the milliseconds since the Unix epoch
    return date.getTime();
}

export function passesFilter(data, filter){
    let player1 = data.player1;
    let player2 = data.player2;
    let player3 = data.player3;
    let player4 = data.player4;
    let coach = data.coach;
    let court = data.court;
    let startTime = data.startTime;
    let endTime = data.endTime;
    
    let filterPlayer = filter.player;
    let filterCoach = filter.coach;
    let filterCourt = filter.court;
    let filterDate = filter.date;

    function passesPlayer(p1,p2,p3,p4, filter){
        if (filter == "All") return true;
        else if (p1 == filter || p2 == filter || p3 == filter || p4 == filter) return true;
        else return false;
    }
    function passesOther (c, filter){
        if (filter == "All" || c == filter) return true;
        else return false;
    }
    function dateFromInput(datetime){
        let s = datetime.split('T')[0];
        return s;
    }
    
    if (passesPlayer(player1, player2, player3, player4, filterPlayer) && 
    passesOther(coach, filterCoach) &&
    passesOther(court, filterCourt) &&
    (passesOther(filterDate == "All" || dateFromInput(startTime), filterDate) || passesOther(dateFromInput(endTime), filterDate))) return true;
    else return false;
}