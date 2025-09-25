import React from "react";
import PreviousMeetings from "../../_components/PreviousMeetings";

const Previouspage = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-5xl font-extrabold mb-4">Previous Meetings</h1>
      <PreviousMeetings type="ended" />
    </section>
  );
};

export default Previouspage;
