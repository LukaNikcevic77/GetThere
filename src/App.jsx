import { useState, useEffect, useMemo, useRef } from 'react'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/themes/tailwind-light/theme.css";
import LocationInput from './components/LocationInput';
import { Button } from 'primereact/button';
import { GoogleMap, useLoadScript, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { InputText } from 'primereact/inputtext';
function App() {

  const {isLoaded} = useLoadScript({
    googleMapsApiKey: 'AIzaSyBBe0NIpQxuhr2_ObZ0bARcHT_4lRHJApE',
    libraries: ['places']
  })
  const [wayPointsArray, setWayPointsArray] = useState([]);
  const [canGetDirections, setCanGetDirections] = useState(true);
  const [directions, setDirections] = useState(null);  
  const [nextId, setNextId] = useState(1);
  const startPoint = useRef();
  const endPoint = useRef();

  

  const checkAvailability = () => {
    if (
      startPoint.current === undefined ||
      endPoint.current === undefined ||
      (startPoint.current.value.trim() === '' || endPoint.current.value.trim() === '')
    ) {
      setCanGetDirections(true);
    } else {
      console.log(startPoint.current.value, endPoint.current.value);
      setCanGetDirections(false);
    }
  }
  

  const getRoute = async () => {
    console.log("I got called", wayPointsArray);
    const directionService = new google.maps.DirectionsService()
    const filteredArray = wayPointsArray
    .filter(waypoint => waypoint.location !== '') 
    .map(({ location }) => ({ location }));

    const results = await directionService.route({
      origin: startPoint.current.value,
      destination: endPoint.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
      waypoints: filteredArray

    })
    setDirections(results);
  }
/* */
 

  const addStop = () => {
    const newWaypoint = { id: nextId, location: '', stopover: true };
    setWayPointsArray([...wayPointsArray, newWaypoint]);
    setNextId(nextId + 1); 
  }

  const removeStop = (id) => {
    const updatedArray = wayPointsArray.filter(waypoint => waypoint.id !== id);
    setWayPointsArray(updatedArray);
  }

   return(
    <>
    
    {isLoaded &&
    <div className='bg-slate-500 h-full desktop:flex'>

    <GoogleMap zoom={10} center={{lat: 55, lng: 35}} mapContainerClassName='h-3/5 w-full desktop:h-full desktop:w-3/5 desktop:order-2'>
      {directions && <DirectionsRenderer directions={directions}/>}
    </GoogleMap>
    <div className='h-2/5 w-full flex flex-col items-center justify-start gap-4 bg-green-600 overflow-y-auto
    desktop:h-full desktop:w-2/5'>
      <h1 className='text-3xl pt-5
      tablet:text-5xl '>GetThere</h1>
   
    <Autocomplete>

<InputText ref={startPoint} onBlur={checkAvailability} className='p-2 text-xl
 sm:text-md
 tablet:text-xl tablet:w-auto tablet:p-6' />
</Autocomplete>
<Autocomplete>

<InputText ref={endPoint} onBlur={checkAvailability}  className='p-2 text-xl
 sm:text-md
 tablet:text-xl tablet:w-auto tablet:p-6' />
</Autocomplete>
    {wayPointsArray.map((waypoint) => (
    <span key={waypoint.id}>

    <Autocomplete>

<LocationInput wayPointsArray={wayPointsArray} setWayPointsArray={setWayPointsArray} removeStop={removeStop} id={waypoint.id}/>
</Autocomplete>
    </span>
))}
    <Button label="Add stop" severity="info" rounded className='bg-blue-500 text-white h-6 w-auto px-10 py-5 text-xs -ml-20 
    sm:-mt-1 
    tablet:text-3xl tablet:py-8' 
    onClick={addStop} /> 
    <Button label="View Route" severity="info" rounded className='bg-blue-500 text-white h-6 w-auto px-10 py-5 text-xl
     sm:-mt-3 
     md:mt-20 md:-mt-0
     tablet:text-4xl tablet:py-10' 
     disabled={canGetDirections} onClick={getRoute} />     
 
    </div>
    </div>
    
}

    </>
   )
}

export default App
