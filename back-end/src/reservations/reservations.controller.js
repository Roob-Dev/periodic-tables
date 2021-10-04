const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

async function list(req, res) {
  const { date, mobileNumber } = res.locals;
  const data = mobileNumber
    ? await service.searchList(mobileNumber)
    : await service.list(date);
  res.json({ data });
}

async function create(req, res) {
  let reservation = req.body.data;
  reservation = { ...reservation, status: "booked" };
  const data = await service.create(reservation);
  res.status(201).json({ data });
}

function getDateFromQuery(req, res, next) {
  let today = new Date();
  today = `${today.getFullYear().toString(10)}-${(today.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${today.getDate().toString(10).padStart(2, "0")}`;
  const date = req.query.date || today;
  res.locals.date = date;
  next();
}

function getMobileNumberFromQuery(req, res, next) {
  const mobileNumber = req.query.mobile_number;
  if (mobileNumber) {
    res.locals.mobileNumber = mobileNumber;
  }
  next();
}

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "reservation_date",
  "reservation_time",
  "mobile_number",
  "status",
  "created_at",
  "updated_at",
  "reservation_id",
];
const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "people",
  "reservation_date",
  "reservation_time",
  "mobile_number",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function peopleIsPositiveInteger(req, res, next) {
  let { people } = req.body.data;

  if (people > 0 && Number.isInteger(people)) {
    return next();
  }
  return next({
    status: 400,
    message: `Invalid people field. People must be a positive integer greater than 0`,
  });
}

const hasRequiredProperties = hasProperties(...REQUIRED_PROPERTIES);

function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  if (
    new Date(reservation_date) !== "Invalid Date" &&
    !isNaN(new Date(reservation_date))
  ) {
    return next();
  }
  return next({
    status: 400,
    message: `reservation_date must be a valid date`,
  });
}

function timeIsValid(req, res, next) {
  const { reservation_time } = req.body.data;

  const pattern = /^[0-9]{2}:[0-9]{2}?(:[0-9]{2})$/;
  if (pattern.test(reservation_time));
  {
    let divided = reservation_time.split(":");

    const hour = Number(divided[0]);
    const minute = Number(divided[1]);
    const seconds = Number(divided[2]) || 0;

    if (
      hour >= 0 &&
      hour <= 23 &&
      minute >= 0 &&
      minute <= 59 &&
      seconds >= 0 &&
      seconds <= 59
    ) {
      return next();
    }
  }
  return next({
    status: 400,
    message: `reservation_time must be a valid time`,
  });
}

function dateIsFuture(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const [hour, minute] = reservation_time.split(":");
  let [year, month, date] = reservation_date.split("-");
  month -= 1;
  const reservationDate = new Date(year, month, date, hour, minute, 59, 59);
  const today = new Date();

  if (today <= reservationDate) {
    return next();
  }
  return next({
    status: 400,
    message: `reservation_date must be set in the future`,
  });
}

function dateIsNotTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  let [year, month, date] = reservation_date.split("-");
  month -= 1;
  const day = new Date(year, month, date).getDay();
  if (day !== 2) {
    return next();
  }
  return next({
    status: 400,
    message: `We are closed on Tuesdays`,
  });
}

function restaurantIsOpen(req, res, next) {
  let isOpen = false;
  const { reservation_time } = req.body.data;
  let [hour, minute] = reservation_time.split(":");
  hour = Number(hour);
  minute = Number(minute);

  if (hour > 10 && hour < 21) {
    isOpen = true;
  }
  if (hour === 10) {
    if (minute >= 30) {
      isOpen = true;
    }
  }
  if (hour === 21) {
    if (minute <= 30) {
      isOpen = true;
    }
  }

  if (isOpen) {
    return next();
  }
  return next({
    status: 400,
    message: `Reservations must be made between 10:30am to 9:30pm`,
  });
}

function statusIsBooked(req, res, next) {
  const { status } = req.body.data;
  if (status === "booked" || !status) {
    return next();
  }
  next({
    status: 400,
    message: `"${status}" is not a valid status. New Reservations must have a status of "booked"`,
  });
}

async function reservationExists(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`,
  });
}

async function read(req, res) {
  const { reservation } = res.locals;
  let date = reservation.reservation_date;
  date = `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
  const data = {
    ...reservation,
    reservation_date: date,
  };
  res.json({ data });
}

function hasOnlyStatusProperty(req, res, next) {
  const { data = {} } = req.body;
  const invalidFields = Object.keys(data).filter(
    (field) => !["status"].includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasStatusProperty(req, res, next) {
  const { data = {} } = req.body;
  if (data.status) {
    return next();
  }
  next({
    status: 400,
    message: `status is a required field`,
  });
}

function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  const validStatus = ["booked", "seated", "finished", "cancelled"];

  if (validStatus.includes(status)) {
    res.locals.status = status;
    return next();
  }
  next({
    status: 400,
    message: `${status} is not a valid status. Status must be booked, seated, or finished`,
  });
}

function currentStatusIsNotFinished(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "finished") {
    return next({
      status: 400,
      message: `Reservations that are finished cannot be updated.`,
    });
  }
  next();
}

async function updateStatus(req, res) {
  const { status, reservation } = res.locals;
  const updatedReservation = {
    ...reservation,
    status,
  };
  const result = await service.updateStatus(updatedReservation);
  const data = result[0];
  res.json({ data });
}

async function update(req, res) {
  const updatedReservation = {
    ...res.locals.reservation,
    ...req.body.data,
  };
  const result = await service.update(updatedReservation);
  const data = result[0];
  res.json({ data });
}

module.exports = {
  list: [getDateFromQuery, getMobileNumberFromQuery, asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    peopleIsPositiveInteger,
    dateIsValid,
    timeIsValid,
    dateIsNotTuesday,
    dateIsFuture,
    restaurantIsOpen,
    statusIsBooked,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  updateStatus: [
    hasOnlyStatusProperty,
    hasStatusProperty,
    statusIsValid,
    asyncErrorBoundary(reservationExists),
    currentStatusIsNotFinished,
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    hasRequiredProperties,
    peopleIsPositiveInteger,
    dateIsValid,
    timeIsValid,
    dateIsNotTuesday,
    dateIsFuture,
    restaurantIsOpen,
    statusIsBooked,
    asyncErrorBoundary(update),
  ],
};
