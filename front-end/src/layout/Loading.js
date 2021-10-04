import React from "react";

/**
 * Spinning wheel and "Loading..." displays on pages while waiting for api fetch
 *
 * @returns {JSX.Element}
 */
export default function Loading() {
  return (
    <div>
      <span className="spinner-border spinner-border-sm float-left mt-1 mr-2"></span>{" "}
      <h5 className="mt-1">Loading...</h5>
    </div>
  );
}
