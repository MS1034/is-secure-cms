const EventLog = require('../Models/EventLog');

// Controller to add a new event log
exports.addEventLog = async (event) => {
  try {
    // const { eventLog } = req.body;
    // const newEventLog = await EventLog.create({ eventType, eventData });
    await event.save();
    console.log("Activity Logged: ", event.eventType)
  } catch (error) {
    console.log(error);
  }
};

// Controller to get all event logs
exports.getAllEventLogs = async (req, res, next) => {
  try {
    const eventLogs = await EventLog.find();
    res.status(200).json({ success: true, data: eventLogs });
  } catch (error) {
    console.log(error);
  }
};

