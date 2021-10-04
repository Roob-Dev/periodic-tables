const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

// list tables that are not occupied (reservation_id is null)
async function listFree(req, res) {
  // const capacity = res.locals.capacity;  //filters list of tables by capacity. This functionality breaks testing but I want to implement it for portfolio.
  const data = await service.listFree(/* capacity */);
  res.json({ data });
}

async function create(req, res) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];
const REQUIRED_PROPERTIES = ["table_name", "capacity"];

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

const hasRequiredProperties = hasProperties(...REQUIRED_PROPERTIES);

// table name must be at least 2 characters long
function tableNameIsValid(req, res, next) {
  const { table_name } = req.body.data;
  const length = table_name.length;

  if (length >= 2) {
    return next();
  }
  return next({
    status: 400,
    message: `Invalid table_name field. table_name must be at least 2 characters long`,
  });
}

function capacityIsPositiveInteger(req, res, next) {
  let { capacity } = req.body.data;

  if (capacity > 0 && Number.isInteger(capacity)) {
    return next();
  }
  return next({
    status: 400,
    message: `Invalid capacity field. Capacity must be a positive integer greater than 0`,
  });
}

function getCapacity(req, res, next) {
  const capacity = req.query.capacity || 99999;
  res.locals.capacity = capacity;
  next();
}

async function tableExists(req, res, next) {
  const tableId = req.params.table_id;
  const table = await service.read(tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table ${tableId} cannot be found.`,
  });
}

//updates table and reservation at the same time.
//table is assigned a reservation_id
//reservation is given a status of "seated"
async function seat(req, res, next) {
  const updatedTable = {
    ...res.locals.table,
    ...req.body.data,
  };
  const updatedReservation = {
    ...res.locals.reservation,
    status: "seated",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
}

function hasOnlyReservationId(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !["reservation_id"].includes(field)
  );
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasReservationId(req, res, next) {
  const { data = {} } = req.body;
  if (data.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `reservation_id is a required field.`,
  });
}

async function reservationIdExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const reservation = await reservationService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`,
  });
}

async function findReservation(req, res, next) {
  const { reservation_id } = res.locals.table;
  const reservation = await reservationService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservation_id} cannot be found.`,
  });
}

function reservationIsBooked(req, res, next) {
  const { status } = res.locals.reservation;
  if (status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `Reservation status ${status} is not valid`,
  });
}

//checks if the tables capacity is enough for the reservaion's people
function hasCapacity(req, res, next) {
  const { capacity } = res.locals.table;
  const { people } = res.locals.reservation;

  if (capacity >= people) {
    return next();
  }
  next({
    status: 400,
    message: `This Reservation requires a capacity of at least ${people}.`,
  });
}

function tableIsFree(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next({
      status: 400,
      message: `This table is occupied.`,
    });
  }
  next();
}

function tableIsOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `This table is not occupied.`,
  });
}

async function unseat(req, res, next) {
  const { table } = res.locals;
  const updatedTable = {
    ...table,
    reservation_id: null,
  };
  const updatedReservation = {
    ...res.locals.reservation,
    status: "finished",
  };
  const data = await service.update(updatedTable, updatedReservation);
  res.json({ data });
}

module.exports = {
  list: [asyncErrorBoundary(list)],
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    tableNameIsValid,
    capacityIsPositiveInteger,
    asyncErrorBoundary(create),
  ],
  listFree: [getCapacity, asyncErrorBoundary(listFree)],
  seat: [
    hasOnlyReservationId,
    hasReservationId,
    asyncErrorBoundary(reservationIdExists),
    reservationIsBooked,
    asyncErrorBoundary(tableExists),
    hasCapacity,
    tableIsFree,
    asyncErrorBoundary(seat),
  ],
  unseat: [
    asyncErrorBoundary(tableExists),
    tableIsOccupied,
    asyncErrorBoundary(findReservation),
    asyncErrorBoundary(unseat),
  ],
};
