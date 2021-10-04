import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Loading from "../layout/Loading";
import ReservationCard from "../reservations/ReservationCard";
import TableCard from "../tables/TableCard";
import { useHistory } from "react-router-dom";
import useQuery from "../utils/useQuery";
import { previous, next, getDisplayDate } from "../utils/date-time";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  let query = useQuery();
  date = query.get("date") || date;

  //will display the date as: Sunday, Oct 3 2021
  const displayDate = getDisplayDate(date);

  const history = useHistory();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesError] = useState(null);
  const [displayReservations, setDisplayReservations] = useState(<Loading />);
  const [displayTables, setDisplayTables] = useState(<Loading />);

  useEffect(loadReservations, [date]);
  useEffect(loadTables, [reservations]);

  //when reservations are loaded, display either list of reservations,
  //or alert that there are no reservations on this date
  useEffect(() => {
    if (reservations.length) {
      setDisplayReservations(
        reservations.map((reservation, index) => {
          return (
            <span key={index}>
              <ReservationCard
                reservation={reservation}
                loadReservations={loadReservations}
              />
            </span>
          );
        })
      );
    } else {
      setDisplayReservations(
        <div className="alert alert-info border border-info my-2">
          No Reservations on {displayDate.display}
        </div>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  //when tables are loaded, display either list of tables
  //or alert that no tables exist
  useEffect(() => {
    if (tables.length) {
      setDisplayTables(
        tables.map((table, index) => {
          return (
            <span key={index}>
              <TableCard table={table} loadReservations={loadReservations} />
            </span>
          );
        })
      );
    } else {
      setDisplayTables(
        <div className="alert alert-info border border-info my-2">
          No Tables Created
        </div>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables]);

  function loadReservations() {
    setDisplayReservations(<Loading />);
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  function loadTables() {
    const abortController = new AbortController();
    setTablesError(null);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  return (
    <div className="dash">
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h3 className="mb-0">{displayDate.display}</h3>
      </div>
      {/* button group (previous, Today, Next, and date picker) */}
      <div className="input-group input-group-sm mb-3">
        <div className="d-flex d-md-inline mb-3 btn-group input-group-prepend ">
          <button
            className="btn btn-outline-info btn-sm mb-3"
            onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
          >
            <span className="oi oi-chevron-left mr-2" />
            Previous
          </button>
          <button
            className="btn btn-outline-info btn-sm mb-3"
            onClick={() => history.push(`/dashboard`)}
          >
            <span className="oi oi-calendar mr-2" />
            Today
          </button>
          <button
            className="btn btn-outline-info btn-sm mb-3"
            onClick={() => history.push(`/dashboard?date=${next(date)}`)}
          >
            Next
            <span className="oi oi-chevron-right ml-2" />
          </button>
        </div>
        <input
          type="date"
          className="form-control"
          style={{ maxWidth: "150px" }}
          onChange={(event) =>
            history.push(`/dashboard?date=${event.target.value}`)
          }
          value={date}
        />
      </div>
      {/* Reservations section */}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations</h4>
      </div>
      <ErrorAlert error={reservationsError} />
      <div>{displayReservations}</div>
      {/* Tables Section */}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>
      <ErrorAlert error={tablesError} />
      <div className="">{displayTables}</div>
    </div>
  );
}

export default Dashboard;
