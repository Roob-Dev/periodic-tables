import React, { useEffect, useState } from "react";
import { getDisplayDate, getDisplayTime } from "../utils/date-time";
import { Link } from "react-router-dom";
import { changeStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import formatReservationTime from "../utils/format-reservation-time";

/**
 * Defines how each reservation will be displayed on the dashboard and search pages.
 * @param reservation
 * the reservation to display
 *
 * @param loadReservations
 * function that triggers the reservations to be updated.
 *
 * @returns {JSX.Element}
 */
export default function ReservationCard({ reservation, loadReservations }) {
  reservation = formatReservationTime(reservation);

  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;

  // display date and time formatted as Friday, January 1 2021, and 3:30pm
  const displayDate = getDisplayDate(reservation_date);
  const displayTime = getDisplayTime(reservation_time);

  const [buttons, setButtons] = useState("");
  const [cancelError, setCancelError] = useState(null);

  // defines the bootstrap class names for color based on the status of the reservation
  const statusColor = {
    booked: "success",
    seated: "primary",
    finished: "secondary",
    cancelled: "danger",
  };

  // create JSX buttons for seat, edit, and cancel (only if status is "booked")
  useEffect(() => {
    if (status === "booked") {
      setButtons(
        <div className="btn-group my-2">
          <Link
            className="btn btn-sm btn-outline-info"
            to={`/reservations/${reservation_id}/seat`}
          >
            <span className="oi oi-people mr-2" />
            Seat
          </Link>
          <Link
            to={`/reservations/${reservation_id}/edit`}
            className="btn btn-sm btn-outline-secondary"
          >
            <span className="oi oi-pencil mr-2" />
            Edit
          </Link>
          <button
            data-reservation-id-cancel={reservation_id}
            to={`/reservations/${reservation_id}/edit`}
            className="btn btn-sm btn-outline-danger"
            onClick={handleCancel}
          >
            <span className="oi oi-trash mr-2" />
            Cancel
          </button>
        </div>
      );
    } else {
      setButtons("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleCancel = (event) => {
    event.preventDefault();
    const message = `Do you want to cancel this reservation? This cannot be undone.`;
    if (window.confirm(message)) {
      const abortController = new AbortController();
      setCancelError(null);
      changeStatus(reservation_id, "cancelled", abortController.signal)
        .then(() => {
          loadReservations();
        })
        .catch(setCancelError);
      return () => abortController.abort();
    }
  };

  return (
    <>
      <ErrorAlert error={cancelError} />
      <div
        className={`row flex-column flex-md-row bg-light border mx-1 my-3 px-2 py-2`}
      >
        {/* status badge */}
        <div
          className={`col text-center text-md-left align-self-center mr-3`}
          style={{ maxWidth: "100px" }}
        >
          <span
            className={`my-2 badge text-white bg-${statusColor[status]}`}
            data-reservation-id-status={reservation_id}
          >
            {status}
          </span>
        </div>
        {/* --------------------Party Size Information-------------------- */}
        <div className={`col align-self-center`}>
          <h5 className="mb-1">{`${first_name} ${last_name}`}</h5>
          <p className="mb-0">
            {`Party of ${people}`}
            <span className="ml-3">{mobile_number}</span>
          </p>
        </div>
        {/* --------------------Date and Time-------------------- */}
        <div className={`col align-self-center`}>
          <p className="mb-0">{displayDate.display}</p>
          <p className="mb-0">{displayTime}</p>
        </div>
        <div className={`col text-center text-md-right align-self-center`}>
          {buttons}
        </div>
      </div>
    </>
  );
}
