import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { listFreeTables, readReservation, assignTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { useParams } from "react-router-dom";
import Loading from "../layout/Loading";

/**
 * Form for seating a reservation at a table.
 *
 * @returns {JSX.Element}
 */
export default function SeatForm() {
  const history = useHistory();
  const reservation_id = useParams().reservation_id;

  const [table_id, setTable_id] = useState("");
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [reservationError, setReservationError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [seatError, setSeatError] = useState(null);
  const [tableOptions, setTableOptions] = useState(null);
  const [displaySubHead, setDisplaySubHead] = useState(<Loading />);

  useEffect(loadReservation, [reservation_id]);
  useEffect(loadTables, [reservation]);
  useEffect(() => {
    setTableOptions(
      tables.map((table, index) => {
        return (
          <option key={index} value={table.table_id}>
            {table.table_name} - {table.capacity}
          </option>
        );
      })
    );
  }, [tables]);
  useEffect(() => {
    if (reservation.reservation_id) {
      setDisplaySubHead(
        <h3>{`${reservation.first_name} ${reservation.last_name}, Party of ${reservation.people}`}</h3>
      );
    }
  }, [reservation]);

  function loadReservation() {
    const abortController = new AbortController();
    setReservationError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setReservationError);
    return () => abortController.abort();
  }

  function loadTables() {
    if (reservation.reservation_id) {
      const abortController = new AbortController();
      setTablesError(null);
      listFreeTables({ capacity: reservation.people }, abortController.signal)
        .then(setTables)
        .catch(setTablesError);
      return () => abortController.abort();
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    setSeatError(null);
    assignTable(reservation_id, table_id, abortController.signal)
      .then(() => {
        history.push(`/dashboard`);
      })
      .catch(setSeatError);
    return () => abortController.abort();
  };

  return (
    <>
      <h1> {`Seat Reservation`}</h1>
      {displaySubHead}
      <ErrorAlert error={reservationError} />
      <ErrorAlert error={tablesError} />
      <ErrorAlert error={seatError} />

      <form onSubmit={handleSubmit}>
        {/*name input*/}
        <div className="input-group mb-3">
          <label className="sr-only" htmlFor="table_id">
            Table
          </label>
          <select
            className="custom-select"
            style={{ maxWidth: "300px" }}
            id="table_id"
            type="text"
            name="table_id"
            onChange={(event) => {
              setTable_id(event.target.value);
            }}
            value={table_id}
            maxLength="50"
            required
          >
            <option value="">--select one--</option>
            {tableOptions}
          </select>
          <div className="input-group-append">
            {/*cancel button*/}
            <button
              className="btn btn-outline-danger mb-3"
              to="/"
              onClick={() => history.goBack()}
            >
              <span className="oi oi-circle-x mr-2" />
              Cancel
            </button>
            {/*submit button*/}
            <button className="btn btn-outline-info mb-3" type="submit">
              <span className="oi oi-circle-check mr-2" />
              Submit
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
