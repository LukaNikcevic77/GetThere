import { useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function LocationInput(props) {
  const waypointRef = useRef();

  const updateValues = () => {
    const updatedArray = props.wayPointsArray.map((waypoint) => {
      if (waypoint.id === props.id) {
        return {
          ...waypoint,
          location: waypointRef.current.value,
          stopover: true,
        };
      }
      return waypoint;
    });

    props.setWayPointsArray(updatedArray);
  };

  return (
    <>
      <span className="w-auto h-auto">
        <InputText
          ref={waypointRef}
          onBlur={updateValues}
          className="p-4 text-s text-black
             sm:text-md
             tablet:text-lg tablet:w-auto tablet:p-3 rounded-full shadow-none focus:border-none focus:outline-none  focus:shadow-none focus:bg-green-500 focus:text-black"
        />
        <Button
          label="X"
          severity="warning"
          rounded
          className="bg-red-400 text-white h-6 w-6 text-s ml-2 mb-2
            tablet:text-lg tablet:w-10 tablet:h-10"
          onClick={() => props.removeStop(props.id)}
        />
      </span>
    </>
  );
}

export default LocationInput;
