import React, { useState, useRef, useEffect } from "react";

import SelectedPlace from "../UI/SelectedPlace";
import Modal from "../UI/Modal";
import Header from "../UI/Header";
import {
  getCoordsFromAddress,
  getAddressFromCoords,
} from "../Utility/Location";
import "./SharePlace.css";

const SharePlace = () => {
  const [chosenCoords, setChosenCoords] = useState();
  const [chosenAddress, setChosenAddress] = useState();
  const [sharableLink, setSharableLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addressInputRef = useRef();
  const shareLinkRef = useRef();
  const isMounted = useRef(true); // To track if the component is mounted

  // Cleanup mechanism for async operations
  useEffect(() => {
    isMounted.current = true; // Mark as mounted
    return () => {
      isMounted.current = false; // Mark as unmounted on cleanup
    };
  }, []);

  // Update sharable link when chosen address or coordinates change
  useEffect(() => {
    if (chosenAddress && chosenCoords) {
      setSharableLink(
        `${window.location.origin}/my-place?address=${encodeURI(
          chosenAddress
        )}&lat=${chosenCoords.lat}&lng=${chosenCoords.lng}`
      );
    }
  }, [chosenAddress, chosenCoords]);

  const pickAddressHandler = async (event) => {
    event.preventDefault();
    const address = addressInputRef.current.value;

    if (!address || address.trim().length === 0) {
      alert("Invalid address entered - please try again!");
      return;
    }

    setIsLoading(true);

    try {
      const coordinates = await getCoordsFromAddress(address);

      // Ensure state updates only if the component is still mounted
      if (isMounted.current) {
        setChosenCoords(coordinates);
        setChosenAddress(address);
      }
    } catch (err) {
      if (isMounted.current) {
        alert(err.message);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const getUserLocationHandler = async () => {
    if (!navigator.geolocation) {
      alert(
        "Location feature is not available in your browser - please use a more modern browser or manually enter an address."
      );
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (successResult) => {
        const coordinates = {
          lat: successResult.coords.latitude + Math.random() * 50, // Simulate randomness (debugging purpose)
          lng: successResult.coords.longitude + Math.random() * 50,
        };

        try {
          const address = await getAddressFromCoords(coordinates);

          if (isMounted.current) {
            setChosenCoords(coordinates);
            setChosenAddress(address);
          }
        } catch (err) {
          if (isMounted.current) {
            alert(err.message);
          }
        } finally {
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      },
      (error) => {
        if (isMounted.current) {
          setIsLoading(false);
          alert(
            "Could not locate you unfortunately. Please enter an address manually!"
          );
        }
      }
    );
  };

  const sharePlaceHandler = () => {
    if (!navigator.clipboard) {
      shareLinkRef.current.select();
      return;
    }

    navigator.clipboard
      .writeText(sharableLink)
      .then(() => {
        alert("Copied into clipboard!");
      })
      .catch((err) => {
        console.log(err);
        shareLinkRef.current.select();
      });
  };

  return (
    <React.Fragment>
      {isLoading && (
        <Modal>
          <div className="modal__content centered">
            <div className="lds-dual-ring"></div>
          </div>
        </Modal>
      )}

      <Header title="Share a Place" />

      <SelectedPlace
        fallbackText="You haven't selected any place yet. Please enter an address or
            locate yourself!"
        centerCoords={chosenCoords}
      />

      <section id="share-controls">
        <input
          ref={shareLinkRef}
          value={sharableLink}
          type="text"
          readOnly
          placeholder="Select a place to get a sharable link."
        />
        <button disabled={!sharableLink} onClick={sharePlaceHandler}>
          Share Place
        </button>
      </section>

      <section id="place-data">
        <form onSubmit={pickAddressHandler}>
          <label htmlFor="address">Address</label>
          <input type="text" id="address" ref={addressInputRef} />
          <button type="submit">Find Place</button>
        </form>
        <button onClick={getUserLocationHandler}>Get Current Location</button>
      </section>
    </React.Fragment>
  );
};

export default SharePlace;

// import React, { useState, useRef, useEffect } from "react";

// import SelectedPlace from "../UI/SelectedPlace";
// import Modal from "../UI/Modal";
// import Header from "../UI/Header";
// import {
//   getCoordsFromAddress,
//   getAddressFromCoords,
// } from "../Utility/Location";
// import "./SharePlace.css";

// const SharePlace = () => {
//   const [chosenCoords, setChosenCoords] = useState();
//   const [chosenAddress, setChosenAddress] = useState();
//   const [sharableLink, setSharableLink] = useState("");
//   const [isLoading, setIsLoading] = useState();
//   const addressInputRef = useRef();
//   const shareLinkRef = useRef();
//   const isMounted = useRef(true);

//   useEffect(() => {
//     isMounted.current = true; // Mark as mounted
//     return () => {
//       isMounted.current = false; // Mark as unmounted on cleanup
//     };
//   }, []);

//   useEffect(() => {
//     if (chosenAddress && chosenCoords) {
//       setSharableLink(
//         `${window.location.origin}/my-place?address=${encodeURI(
//           chosenAddress
//         )}&lat=${chosenCoords.lat}&lng=${chosenCoords.lng}`
//       );
//     }
//   }, [chosenAddress, chosenCoords]);

//   const pickAddressHandler = async (event) => {
//     event.preventDefault();
//     const address = addressInputRef.current.value;
//     if (!address || address.trim().length === 0) {
//       alert("Invalid address entered - please try again!");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const coordinates = await getCoordsFromAddress(address);
//       setChosenCoords(coordinates);
//       setChosenAddress(address);

//       if (isMounted.current) {
//         setChosenCoords(coordinates);
//         setChosenAddress(address);
//       }
//     } catch (err) {
//       alert(err.message);
//     } finally {
//       if (isMounted.current) {
//         setIsLoading(false);
//       }
//     }

//     // setIsLoading(false);
//   };

//   const getUserLocationHandler = async () => {
//     if (!navigator.geolocation) {
//       alert(
//         "Location feature is not available in your browser - please use a more modern browser or manually enter an address."
//       );
//       return;
//     }
//     setIsLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (successResult) => {
//         const coordinates = {
//           lat: successResult.coords.latitude + Math.random() * 50,
//           lng: successResult.coords.longitude + Math.random() * 50,
//         };
//         const address = await getAddressFromCoords(coordinates);
//         setChosenCoords(coordinates);
//         setChosenAddress(address);
//         setIsLoading(false);
//       },
//       (error) => {
//         setIsLoading(false);
//         alert(
//           "Could not locate you unfortunately. Please enter an address manually!"
//         );
//       }
//     );
//   };

//   const sharePlaceHandler = () => {
//     if (!navigator.clipboard) {
//       shareLinkRef.current.select();
//       return;
//     }

//     navigator.clipboard
//       .writeText(sharableLink)
//       .then(() => {
//         alert("Copied into clipboard!");
//       })
//       .catch((err) => {
//         console.log(err);
//         shareLinkRef.current.select();
//       });
//   };

//   return (
//     <React.Fragment>
//       {isLoading && (
//         <Modal>
//           <div className="modal__content centered">
//             <div className="lds-dual-ring"></div>
//           </div>
//         </Modal>
//       )}

//       <Header title="Share a Place" />

//       <SelectedPlace
//         fallbackText="You haven't selected any place yet. Please enter an address or
//             locate yourself!"
//         centerCoords={chosenCoords}
//       />

//       <section id="share-controls">
//         <input
//           ref={shareLinkRef}
//           value={sharableLink}
//           type="text"
//           readOnly
//           placeholder="Select a place to get a sharable link."
//         />
//         <button disabled={!sharableLink} onClick={sharePlaceHandler}>
//           Share Place
//         </button>
//       </section>

//       <section id="place-data">
//         <form onSubmit={pickAddressHandler}>
//           <label htmlFor="address">Address</label>
//           <input type="text" id="address" ref={addressInputRef} />
//           <button type="submit">Find Place</button>
//         </form>
//         <button onClick={getUserLocationHandler}>Get Current Location</button>
//       </section>
//     </React.Fragment>
//   );
// };

// export default SharePlace;
