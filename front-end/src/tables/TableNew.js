import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * New table form.
 *
 * @returns {JSX.Element}
 */
export default function TableNew() {
  const history = useHistory();

  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newTable = {
      table_name: tableName,
      capacity: Number(capacity),
    };
    createTable(newTable)
      .then((result) => {
        history.push(`/dashboard`);
      })
      .catch(setError);
  };

  return (
    <>
      <h1> New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon1">
              <span className="oi oi-layers mr-2"></span>
            </span>
          </div>
          <label className="sr-only" htmlFor="table_name">
            Table Name
          </label>
          <input
            className="form-control"
            aria-label="table_name"
            placeholder="Table Name"
            id="table_name"
            type="text"
            name="table_name"
            onChange={(event) => {
              setTableName(event.target.value);
            }}
            value={tableName}
            maxLength="50"
            required
          />
        </div>

        <div className="input-group mb-3">
          <div className="input-group-prepend">
            <span className="input-group-text" id="basic-addon1">
              <span className="oi oi-people mr-2"></span>
              Capacity
            </span>
          </div>
          <label className="sr-only" htmlFor="capacity">
            Capacity
          </label>
          <input
            className="form-control"
            aria-label="table_name"
            id="capacity"
            type="number"
            name="capacity"
            onChange={(event) => {
              setCapacity(event.target.value);
            }}
            value={capacity}
            min="1"
            required
          />
        </div>

        {/*cancel button*/}
        <button
          className="btn btn-outline-danger mr-1 mb-3"
          to="/"
          onClick={() => history.goBack()}
        >
          <span className="oi oi-circle-x mr-2" />
          Cancel
        </button>
        {/*submit button*/}
        <button className="btn btn-outline-info mx-1 mb-3" type="submit">
          <span className="oi oi-circle-check mr-2" />
          Submit
        </button>
      </form>
    </>
  );
}
