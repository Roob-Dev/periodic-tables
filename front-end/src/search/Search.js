import React, { useEffect, useState } from "react";
// import { useHistory } from "react-router-dom";
import ReservationCard from "../reservations/ReservationCard";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import Loading from "../layout/Loading";

/**
 * search by mobile number page.
 *
 * @returns {JSX.Element}
 */
export default function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [reservations, setReservations] = useState("");
  const [displayReservations, setDisplayReservations] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    loadReservations();
  };

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
    } else if (reservations !== "") {
      setDisplayReservations(
        <div className="alert alert-info border border-info my-2">
          No reservations found
        </div>
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  // only allow numeric digits in search input
  const searchFieldHandler = (event) => {
    let input = event.target.value.replace(/\D/g, "");
    setSearchInput(input.slice(0, 10));
  };

  function loadReservations() {
    setDisplayReservations(<Loading />);
    const abortController = new AbortController();
    setSearchError(null);
    listReservations({ mobile_number: searchInput }, abortController.signal)
      .then(setReservations)
      .catch(setSearchError);
    return () => abortController.abort();
  }

  return (
    <>
      <h1>Search</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <label className="sr-only" htmlFor="searchInput">
            Mobile Number
          </label>
          <input
            className="form-control"
            style={{ maxWidth: "300px" }}
            id="searchInput"
            type="text"
            name="mobile_number"
            onChange={searchFieldHandler}
            value={searchInput}
            maxLength="50"
            required
            placeholder="Enter a customer's phone number"
          />
          <div className="input-group-append">
            <button className="btn btn-outline-info mb-3" type="submit">
              <span className="oi oi-magnifying-glass mr-2" />
              Find
            </button>
          </div>
        </div>
      </form>

      <div>
        <ErrorAlert error={searchError} />
        {displayReservations}
      </div>
    </>
  );
}
