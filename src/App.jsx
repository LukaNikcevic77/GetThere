import React, { useState, useEffect, useRef } from "react";
import LocationInput from "./components/LocationInput";
import {
  GoogleMap,
  useLoadScript,
  Autocomplete,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import { getGeocode, getLatLng } from "use-places-autocomplete";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { ProgressSpinner } from "primereact/progressspinner";
import { ToastContainer, toast } from "react-toastify";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/themes/tailwind-light/theme.css";
import "react-toastify/dist/ReactToastify.css";

const googleLibaries = ["places"];

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyBBe0NIpQxuhr2_ObZ0bARcHT_4lRHJApE",
    libraries: googleLibaries,
  });

  const [wayPointsArray, setWayPointsArray] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [msgSettings, setMsgSettings] = useState([]);

  const [directions, setDirections] = useState(null);
  const mapReference = useRef(null);
  const direcitonsRef = useRef(null);
  const [currentStartAddressMarker, setCurrentStartAddressMarker] =
    useState(null);
  const [currentEndAddressMarker, setCurrentEndAddresMarker] = useState(null);

  const [nextId, setNextId] = useState(1);
  const [center, setCenter] = useState({ lat: 42.7804735, lng: 18.9561661 });
  const [canGetDirections, setCanGetDirections] = useState(true);

  const [startSearch, setStartSearch] = useState("");
  const [currentStartValidAddress, setCurrentStartValidAddress] = useState("");
  const [typedValueStart, setTypedValueStart] = useState("");
  const [endSearch, setEndSearch] = useState("");
  const [currentEndValidAddress, setCurrentEndValidAddress] = useState("");
  const [typedValueEnd, setTypedValueEnd] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING");

  function notifyText() {
    switch (msgSettings[2]) {
      case "error":
        toast.error(msgSettings[0], msgSettings[1]);
        break;
      case "warning":
        toast.warn(msgSettings[0], msgSettings[1]);
        break;
      default:
        break;
    }
  }

  function Loading() {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-600 animated slideInDown">
        <div className="text-center">
          <ProgressSpinner
            style={{ width: "100px", height: "100px" }}
            strokeWidth="5"
            animationDuration="2s"
          />

          <div className="spinner text-xl text-white">Loading...</div>
        </div>
      </div>
    );
  }

  function onStartLoad(autocomplete) {
    setStartSearch(autocomplete);
  }

  function onStartChanged() {
    if (startSearch != null) {
      const place = startSearch.getPlace();
      const formattedAddress = place.formatted_address;
      setCurrentStartValidAddress(formattedAddress);
      setTypedValueStart(formattedAddress);
    }
  }

  function onEndLoad(autocomplete) {
    setEndSearch(autocomplete);
  }

  function onEndChanged() {
    if (endSearch != null) {
      const place = endSearch.getPlace();
      const formattedAddress = place.formatted_address;
      setCurrentEndValidAddress(formattedAddress);
      setTypedValueEnd(formattedAddress);
    }
  }

  useEffect(() => {
    if (currentStartValidAddress !== "" && currentEndValidAddress !== "") {
      setCanGetDirections(false);
    } else {
      setCanGetDirections(true);
    }
  }, [currentStartValidAddress, currentEndValidAddress]);

  useEffect(() => {
    if (
      typedValueStart === currentStartValidAddress &&
      typedValueEnd === currentEndValidAddress &&
      currentEndValidAddress !== "" &&
      currentStartValidAddress !== ""
    ) {
      setCanGetDirections(false);
    } else {
      setCanGetDirections(true);
    }
  }, [typedValueStart, typedValueEnd]);

  useEffect(() => {
    if (msgSettings.length > 0) {
      notifyText();
    }
  }, [msgSettings]);

  useEffect(() => {
    const updateMarkers = async () => {
      const newMarkers = await Promise.all(
        wayPointsArray.map((location) => getLocationGeocode(location.location)),
      );
      setMarkers(newMarkers);
    };
    updateMarkers();
  }, [wayPointsArray]);

  useEffect(() => {
    if (markers.length > 0) {
      setCenter(markers[markers.length - 1]);
    }
  }, [markers]);
  useEffect(() => {
    if (currentStartValidAddress !== "") {
      const getGeocodedValue = async () => {
        const results = await getLocationGeocode(currentStartValidAddress);
        return results;
      };

      const setCenterFromGeocode = async () => {
        const center = await getGeocodedValue();
        if (center !== null && center !== undefined) {
          setCenter(center);
          setCurrentStartAddressMarker(center);
        }
      };

      setCenterFromGeocode();
    }
  }, [currentStartValidAddress]);

  useEffect(() => {
    if (currentEndValidAddress !== "") {
      const getGeocodedValue = async () => {
        const results = await getLocationGeocode(currentEndValidAddress);
        return results;
      };

      const setCenterFromGeocode = async () => {
        const center = await getGeocodedValue();
        if (center !== null && center !== undefined) {
          setCenter(center);
          setCurrentEndAddresMarker(center);
        }
      };

      setCenterFromGeocode();
    }
  }, [currentEndValidAddress]);

  const getLocationGeocode = async (a) => {
    const geocodeResults = await getGeocode({ address: a });
    const { lat, lng } = await getLatLng(geocodeResults[0]);
    return { lat, lng };
  };

  const addStop = () => {
    const newWaypoint = { id: nextId, location: "", stopover: true };
    setWayPointsArray([...wayPointsArray, newWaypoint]);
    setNextId(nextId + 1);
  };

  const removeStop = (id) => {
    const updatedArray = wayPointsArray.filter(
      (waypoint) => waypoint.id !== id,
    );
    setWayPointsArray(updatedArray);
  };

  const getRoute = async () => {
    const direcitonsReferenta = new google.maps.DirectionsRenderer();
    const directionService = new google.maps.DirectionsService();
    const filteredArray = wayPointsArray
      .filter((waypoint) => waypoint.location !== "")
      .map(({ location }) => ({ location }));

    try {
      const results = await directionService.route({
        origin: currentStartValidAddress,
        destination: currentEndValidAddress,
        travelMode: travelMode,
        waypoints: filteredArray,
      });
      const newMap = new google.maps.Map(mapReference.current.mapRef, {
        mapContainerClassName:
          "h-3/5 w-full desktop:h-full desktop:w-3/5 desktop:order-2",
      });
      setDirections(results);
      direcitonsReferenta.setDirections(results);
      direcitonsReferenta.setMap(newMap);

      direcitonsRef.current.context = newMap;
      direcitonsRef.current = direcitonsReferenta;
    } catch (error) {
      switch (error.message) {
        case "DIRECTIONS_ROUTE: ZERO_RESULTS: No route could be found between the origin and destination.":
          setMsgSettings([
            "Nemoguce je naci rutu na odabran nacin",
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            },
            "error",
          ]);

          break;
        case "DIRECTIONS_ROUTE: NOT_FOUND: At least one of the origin, destination, or waypoints could not be geocoded.":
          setMsgSettings([
            "Provjerite unose u polja",
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            },
            "warning",
          ]);
          break;
        default:
          break;
      }
    }
  };

  return (
    <>
      {!isLoaded && <Loading />}
      {isLoaded && (
        <div className="bg-slate-500 h-full desktop:flex text-white">
          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />

          <GoogleMap
            ref={mapReference}
            zoom={25}
            center={center}
            mapContainerClassName="h-3/5 w-full desktop:h-full desktop:w-3/5 desktop:order-2"
          >
            {directions !== null && <DirectionsRenderer ref={direcitonsRef} />}
            {markers.map((position, index) => (
              <Marker key={index} position={position} />
            ))}
            {currentStartAddressMarker && (
              <Marker position={currentStartAddressMarker} />
            )}
            {currentEndAddressMarker && (
              <Marker position={currentEndAddressMarker} />
            )}
          </GoogleMap>

          <div
            className={
              directions === null
                ? "h-2/5 w-full pb-4 flex flex-col items-center justify-start gap-4 bg-blue-400 overflow-y-auto desktop:h-full desktop:w-2/5"
                : "h-2/5 w-full pb-4 flex flex-col items-center justify-start gap-4 bg-white overflow-y-auto desktop:h-full desktop:w-2/5"
            }
          >
            <h1
              className={
                directions === null
                  ? "text-3xl pt-5 tablet:text-5xl font-bold "
                  : "text-3xl pt-5 tablet:text-5xl font-bold bg-blue-400 w-full text-center py-4"
              }
            >
              GetThere
            </h1>
            {directions === null ? (
              <>
                <Autocomplete
                  onPlaceChanged={onStartChanged}
                  onLoad={onStartLoad}
                  className="text-black"
                >
                  <InputText
                    className="p-4 text-lg 
   sm:text-md
   tablet:text-xl tablet:w-auto tablet:p-6 rounded-full shadow-none focus:border-none focus:outline-none  focus:shadow-none focus:bg-green-500 focus:text-black"
                    onChange={(e) => setTypedValueStart(e.target.value)}
                  />
                </Autocomplete>
                <Autocomplete
                  onPlaceChanged={onEndChanged}
                  onLoad={onEndLoad}
                  className="text-black"
                >
                  <InputText
                    className="p-4 text-lg
   sm:text-md
   tablet:text-xl tablet:w-auto tablet:p-6 rounded-full shadow-none focus:border-none focus:outline-none  focus:shadow-none focus:bg-green-500 focus:text-black"
                    onChange={(e) => setTypedValueEnd(e.target.value)}
                  />
                </Autocomplete>
                {wayPointsArray.map((waypoint) => (
                  <span key={waypoint.id}>
                    <Autocomplete>
                      <LocationInput
                        wayPointsArray={wayPointsArray}
                        setWayPointsArray={setWayPointsArray}
                        removeStop={removeStop}
                        id={waypoint.id}
                      />
                    </Autocomplete>
                  </span>
                ))}
                <Button
                  label="Add stop"
                  severity="info"
                  rounded
                  className="bg-blue-500 text-white h-6 w-auto px-10 py-5 text-s -ml-20 
      sm:-mt-1 
      tablet:text-3xl tablet:py-8"
                  onClick={addStop}
                />
                <div className="flex flex-wrap gap-3 justify-center text-lg font-bold">
                  <div className="flex items-center justify-center">
                    <RadioButton
                      inputId="ingredient1"
                      name="Car"
                      value="DRIVING"
                      onChange={(e) => setTravelMode(e.value)}
                      checked={travelMode === "DRIVING"}
                    />
                    <label htmlFor="ingredient1" className="ml-2 ">
                      Car
                    </label>
                  </div>
                  <div className="flex items-center justify-center">
                    <RadioButton
                      inputId="ingredient2"
                      name="Bicycle"
                      value="BICYCLING"
                      onChange={(e) => setTravelMode(e.value)}
                      checked={travelMode === "BICYCLING"}
                    />
                    <label htmlFor="ingredient2" className="ml-2">
                      Bicycle
                    </label>
                  </div>
                  <div className="flex items-center justify-center">
                    <RadioButton
                      inputId="ingredient3"
                      name="Public"
                      value="TRANSIT"
                      onChange={(e) => setTravelMode(e.value)}
                      checked={travelMode === "TRANSIT"}
                    />
                    <label htmlFor="ingredient3" className="ml-2">
                      Public Transport
                    </label>
                  </div>
                  <div className="flex items-center justify-center">
                    <RadioButton
                      inputId="ingredient4"
                      name="Walk"
                      value="WALKING"
                      onChange={(e) => setTravelMode(e.value)}
                      checked={travelMode === "WALKING"}
                    />
                    <label htmlFor="ingredient4" className="ml-2">
                      Take a walk
                    </label>
                  </div>
                </div>
                <Button
                  label="View Route"
                  severity="info"
                  rounded
                  className="bg-blue-500 text-white h-6 w-auto px-10 py-5 text-xl
       sm:-mt-3 
       md:mt-20 md:-mt-0
       tablet:text-4xl tablet:py-10"
                  disabled={canGetDirections}
                  onClick={getRoute}
                />
              </>
            ) : (
              <>
                {directions.routes && (
                  <>
                    <div className="w-full h-auto text-4xl -mt-4 ">
                      <span
                        className="w-full h-auto text-xl grid grid-cols-6 gap-4 p-8 py-2 border-b-4 border-white bg-green-500 text-white
          tablet:py-4 tablet:text-2xl"
                      >
                        <p className="col-span-1 flex items-center justify-center font-bold">
                          From:
                        </p>
                        <p className="col-span-5 flex items-center justify-center">
                          {`${directions.routes[0].legs[0].start_address}`}
                        </p>
                      </span>
                      <span
                        className="w-full h-auto text-xl grid grid-cols-6 gap-4 p-8 py-2 bg-green-500 text-white
          tablet:py-4 tablet:text-2xl"
                      >
                        <p className="col-span-1 flex justify-start font-bold">
                          To:
                        </p>
                        <p
                          className="col-span-5 flex items-center justify-center
            tablet:-ml-10"
                        >
                          {`${directions.routes[0].legs[0].end_address}`}
                        </p>
                      </span>
                    </div>
                    <div className="w-full h-auto text-4xl flex flex-col ">
                      <span
                        className="w-full h-auto text-xl flex flex-row gap-4  text-blue-800 py-2 pt-0
          tablet:pl-11 tablet:pt-0"
                      >
                        {" "}
                        <p className="text-green-500 font-bold">
                          Distance:
                        </p>{" "}
                        <b>{directions.routes[0].legs[0].distance.text}</b>
                      </span>
                      <span
                        className="w-full h-auto text-xl flex flex-row gap-4 text-blue-800 border-b-green-500 border-t-green-500 border-b-4 border-t-4 py-2
          tablet:pl-11"
                      >
                        <p className="text-green-500 font-bold">Duration:</p>{" "}
                        <b>{directions.routes[0].legs[0].duration.text}</b>
                      </span>
                    </div>
                  </>
                )}
                {directions.routes &&
                  directions.routes[0].legs.map((step, stepIndex) =>
                    step.steps.map((direction, index) => {
                      let iconComponent;

                      switch (direction.maneuver) {
                        case "turn-slight-left":
                        case "turn-sharp-left":
                        case "uturn-left":
                        case "turn-left":
                        case "ramp-left":
                        case "fork-left":
                        case "roundabout-left":
                          iconComponent =
                            "pi pi-arrow-left text-xl text-blue-800 font-bold mr-8 tablet:text-3xl";
                          break;

                        case "turn-slight-right":
                        case "turn-sharp-right":
                        case "uturn-right":
                        case "turn-right":
                        case "ramp-right":
                        case "fork-right":
                        case "roundabout-right":
                          iconComponent =
                            "pi pi-arrow-right text-xl text-blue-800 font-bold mr-8 tablet:text-3xl";
                          break;

                        default:
                          iconComponent =
                            "pi pi-arrow-up text-xl text-blue-800 font-bold mr-8 tablet:text-3xl";
                          break;
                      }

                      return (
                        <div
                          key={index}
                          className="w-full h-auto text-xl flex items-center justify-center p-9 py-2 border-b-green-500 border-b-4 text-green-500
          tablet:py-4 tablet:pt-0"
                        >
                          <i className={iconComponent}></i>
                          <span
                            key={index}
                            className="w-full h-auto text-xl
          tablet:text-2xl"
                            dangerouslySetInnerHTML={{
                              __html: direction.instructions,
                            }}
                          ></span>
                        </div>
                      );
                    }),
                  )}
                <Button
                  label="Choose new route"
                  severity="danger"
                  rounded
                  className="bg-red-500 text-white h-6 w-auto px-10 py-5 text-xs -ml-20 
      sm:-mt-1 
      tablet:text-3xl tablet:py-8 ml-2"
                  onClick={() => window.location.reload()}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default App;
