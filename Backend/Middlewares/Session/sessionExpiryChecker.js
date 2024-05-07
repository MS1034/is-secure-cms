// const session = require('./sessionMiddleware');

const sessionExpireMiddleware = (req, res, next) => {
    // Check if session exists and has a cookie with expiry time
    if (req.session && req.session.cookie && req.session.cookie.expires) {
      const currentTime = Date.now();
      const sessionExpiryTime = req.session.cookie.expires;
      console.log(convertMillisecondsToTime(currentTime), convertMillisecondsToTime(sessionExpiryTime));
      
      // Compare current time with session expiry time
      if (currentTime > sessionExpiryTime) {
        // Session has expired
        console.log('Session expired');
        // You can perform additional actions here, such as logging out the user or redirecting to a login page
      } else {
        // Session is still valid
        console.log('Session is still valid');
        next(); // Proceed to the next middleware
      }
    } else {
      // No session or no expiry time, session is invalid
      console.log('Invalid session');
      // Handle invalid session, such as logging out the user or redirecting to a login page
    }
};

  
  function convertMillisecondsToTime(ms) {
    // Convert milliseconds to seconds
    let seconds = Math.floor(ms / 1000);
    
    // Extract hours, minutes, and remaining seconds
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    
    // Format the time string
    let timeString = "";
    if (hours > 0) {
        timeString += hours + "h ";
    }
    if (minutes > 0 || hours > 0) {
        timeString += minutes + "m ";
    }
    timeString += seconds + "s";

    return timeString;
}




const sessionExpiredMiddleware = (req, res, next) => {
  const currentTime = Date.now();
  const sessionExpiryTime = parseInt(process.env.SESSION_EXPIRY_TIME, 10); // Retrieve stored expiry time
  console.log(convertMillisecondsToTime(currentTime), convertMillisecondsToTime(sessionExpiryTime));

  if (currentTime > sessionExpiryTime) {
    // Session has expired
    console.log('Session expired');
    // You can perform additional actions here, such as logging out the user or redirecting to a login page
  } else {
    // Session is still valid
    console.log('Session is still valid');
    next(); // Proceed to the next middleware
  }
};

module.exports = {
  sessionExpiredMiddleware
};
