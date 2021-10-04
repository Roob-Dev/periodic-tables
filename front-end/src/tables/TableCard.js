import React, { useEffect, useState } from "react";
import { unassignTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines how each table will be displayed on the dashboard page.
 * @param table
 * the table to display
 *
 * @param loadReservations
 * function that triggers the reservations and tables to be updated.
 *
 * @returns {JSX.Element}
 */
export default function TableCard({ table, loadReservations }) {
  const { table_id, table_name, capacity, reservation_id } = table;

  const [tableStatus, setTableStatus] = useState("Loading...");
  const [finishButtonDisplay, setFinishButtonDisplay] = useState("");
  const [seatError, setSeatError] = useState(null);

  // defines the bootstrap class names for color based on the status of the table
  const statusColor = {
    Occupied: "primary",
    Free: "success",
  };

  useEffect(() => {
    if (reservation_id) {
      setTableStatus("Occupied");
      setFinishButtonDisplay(
        <button
          className="btn btn-sm btn-secondary"
          data-table-id-finish={table_id}
          to={`/reservations/`}
          onClick={handleSubmit}
        >
          <span className="oi oi-check mr-2" />
          Finish
        </button>
      );
    } else {
      setTableStatus("Free");
      setFinishButtonDisplay("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, reservation_id, table_id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = `Is this table ready to seat new guests? This cannot be undone.`;
    if (window.confirm(message)) {
      const abortController = new AbortController();
      setSeatError(null);
      unassignTable(table_id, abortController.signal)
        .then(() => {
          loadReservations();
        })
        .catch(setSeatError);
      return () => abortController.abort();
    }
  };

  return (
    <>
      <ErrorAlert error={seatError} />
      <div className="row flex-column flex-md-row bg-light border mx-1 my-3 px-2 py-2">
        {/* status badge */}
        <div
          className={`col text-center text-md-left align-self-center`}
          style={{ maxWidth: "100px" }}
        >
          <span
            className={`my-2 badge text-white bg-${statusColor[tableStatus]}`}
            data-table-id-status={table.table_id}
          >
            {tableStatus}
          </span>
        </div>
        {/* Table Name */}
        <div className="col align-self-center text-center text-md-left">
          <h5 className="mb-1">{table_name}</h5>
        </div>
        {/* Table Capacity */}
        <div className="col align-self-center text-center text-md-left">
          <p className="mb-0">{`${capacity} Top`}</p>
        </div>
        {/* Finish button*/}
        <div className="col align-self-center text-center text-md-right my-2">
          {finishButtonDisplay}
        </div>
      </div>
    </>
  );
}
