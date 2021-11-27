import React, { useState, useEffect } from "react";
import firebase from "./firebase";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./redux/modules";
import { setSelected } from "./redux/modules/selectedSegment";
import { key2color } from "./variables/label-info";

import PlayCircleFilledIcon from "@material-ui/icons/PlayCircleFilled";

import { setSegmentListFromDB } from "./redux/modules/segmentList";

import "./segment.css";
import toTimeString from "./totimeString";

interface IProps {
  totalTime: number;
}

const Segment: React.FC<IProps> = (props) => {
  const segmentList = useSelector(
    (state: RootState) => state.setSegmentList.segmentList
  );
  const zoomRangeStartTime = useSelector(
    (state: RootState) => state.setZoomRange.startTime
  );
  const zoomRangeEndTime = useSelector(
    (state: RootState) => state.setZoomRange.endTime
  );
  const videoTime = useSelector(
    (state: RootState) => state.setVideoTime.videoTime
  );
  const selectedSegment = useSelector(
    (state: RootState) => state.setSelectedSegment.selectedSegment
  );
  // console.log(
  //   "[Segment.tsx] zoom range " + zoomRangeStartTime + " " + zoomRangeEndTime
  // );
  // console.log("[Segment.tsx] videoTime " + videoTime);

  const dispatch = useDispatch();

  const [indicatorPosition, setIndicatorPosition] = useState<number>(0);
  // const [delButtonVisible, setDelButtonVisible] = useState<boolean>(false);

  const changeSegment = (id: string) => {
    dispatch(setSelected(id));
  };

  // useEffect(() => {
  //   console.log("Adding key event listener");
  //   document.addEventListener("keydown", handleKeyEvent, false);
  // }, []);

  useEffect(() => {
    changeSegment("");
    if (props.totalTime !== 0)
      dispatch(setSegmentListFromDB("testvideo1", props.totalTime));
  }, [props.totalTime]);

  const time2width = (startTime: number, endTime: number) => {
    const fullWidth = zoomRangeEndTime - zoomRangeStartTime;
    var result;
    if (startTime >= zoomRangeStartTime && endTime <= zoomRangeEndTime)
      result = ((endTime - startTime) / fullWidth) * 100;
    else if (startTime <= zoomRangeStartTime && endTime <= zoomRangeEndTime)
      result = ((endTime - zoomRangeStartTime) / fullWidth) * 100;
    else if (startTime >= zoomRangeStartTime && endTime >= zoomRangeEndTime)
      result = ((zoomRangeEndTime - startTime) / fullWidth) * 100;
    else if (startTime <= zoomRangeStartTime && endTime >= zoomRangeEndTime)
      result = 100;
    else if (startTime > zoomRangeEndTime || endTime < zoomRangeStartTime)
      result = 0;
    // console.log(startTime + " " + endTime + " " + result);
    return result;
  };

  const time2position = (timestamp: number) =>
    ((timestamp - zoomRangeStartTime) * 100) /
    (zoomRangeEndTime - zoomRangeStartTime);
  const position2time = (position: number) =>
    position * (zoomRangeEndTime - zoomRangeStartTime) - zoomRangeStartTime;

  const displayHoverIndicator = (e: any) => {
    var rect = e.target.parentNode.getBoundingClientRect();
    var x = e.clientX - rect.left;
    if (x <= rect.width)
      x >= 0 ? setIndicatorPosition(x) : setIndicatorPosition(0);
  };
  const divideSegment = (e: any) => {
    var rect = e.target.parentNode.getBoundingClientRect();
    const timestamp = position2time(indicatorPosition / rect.width);
    console.log(timestamp);

    const collection = firebase
      .firestore()
      .collection("videos")
      .doc("testvideo1")
      .collection("segments");

    segmentList.forEach((segment: any) => {
      if (segment.startTime < timestamp && segment.endTime > timestamp) {
        console.log(segment);
        collection
          .add({
            startTime: timestamp,
            endTime: segment.endTime,
            label: segment.label,
          })
          .then(() => {
            console.log("Added");
            collection
              .doc(segment.id)
              .update({ endTime: timestamp })
              .then(() => {
                console.log("Updated");
                dispatch(setSegmentListFromDB("testvideo1", props.totalTime));
              })
              .catch((error) => {
                console.error("Error updating document: ", error);
              });
          })
          .catch((error) => {
            console.error("Error updating document: ", error);
          });
      }
    });
  };

  const deleteSegment = (id: string) => {
    console.log("delete " + id);

    const delIndex = segmentList.findIndex((s: any) => s.id === id);
    const delSegment = segmentList.at(delIndex);

    const collection = firebase
      .firestore()
      .collection("videos")
      .doc("testvideo1")
      .collection("segments");

    if (delIndex === 0) {
      const updateSegment = segmentList.at(delIndex + 1);
      collection
        .doc(updateSegment.id)
        .update({ startTime: delSegment.startTime })
        .then(() => {
          console.log("Updated");
          collection
            .doc(delSegment.id)
            .delete()
            .then(() => {
              console.log("Deleted");
              dispatch(setSegmentListFromDB("testvideo1", props.totalTime));
            })
            .catch((error) => {
              console.error("Error updating document: ", error);
            });
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      const updateSegment = segmentList.at(delIndex - 1);
      collection
        .doc(updateSegment.id)
        .update({ endTime: delSegment.endTime })
        .then(() => {
          console.log("Updated");
          collection
            .doc(delSegment.id)
            .delete()
            .then(() => {
              console.log("Deleted");
              dispatch(setSegmentListFromDB("testvideo1", props.totalTime));
            })
            .catch((error) => {
              console.error("Error updating document: ", error);
            });
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    }
  };

  const handleKeyEvent = (e: any) => {
    console.log("keyEvent:" + e.keyCode + " selected: " + selectedSegment);
    var keycode = e.keyCode;
    if (keycode === 8 && selectedSegment !== "") deleteSegment(selectedSegment);
  };

  return (
    <div className="segment-container">
      <div style={{ position: "relative" }}>
        <div className="timestamp-container">
          <div className="timestamp">{toTimeString(zoomRangeStartTime)}</div>
          <div className="timestamp">
            {toTimeString((zoomRangeStartTime + zoomRangeEndTime) / 4)}
          </div>
          <div className="timestamp">
            {toTimeString((zoomRangeStartTime + zoomRangeEndTime) / 2)}
          </div>
          <div className="timestamp">
            {toTimeString(((zoomRangeStartTime + zoomRangeEndTime) * 3) / 4)}
          </div>
          <div className="timestamp">{toTimeString(zoomRangeEndTime)}</div>
        </div>
        <div className="segments">
          {segmentList.map((segment: any) => {
            if (
              segment.startTime < zoomRangeEndTime &&
              segment.endTime > zoomRangeStartTime
            ) {
              if (segment.id === selectedSegment)
                return (
                  <div
                    id={"surch-segment-" + segment.id}
                    className="surch-segment selected"
                    style={{
                      width:
                        time2width(segment.startTime, segment.endTime) + "%",
                      backgroundColor: key2color(segment.label),
                    }}
                    onClick={() => changeSegment("")}
                  >
                    <div className="segment-name">
                      {segment.label === null ? "undefined" : segment.label}
                    </div>
                  </div>
                );
              else
                return (
                  <div
                    id={"surch-segment-" + segment.id}
                    className="surch-segment"
                    style={{
                      width:
                        time2width(segment.startTime, segment.endTime) + "%",
                      backgroundColor: key2color(segment.label),
                    }}
                    onClick={() => changeSegment(segment.id)}
                  >
                    <div className="segment-name">
                      {segment.label === null ? "undefined" : segment.label}
                    </div>
                  </div>
                );
            }
          })}
          <div
            className="curr-timestamp-container"
            style={{ left: time2position(videoTime) + "%" }}
          >
            <PlayCircleFilledIcon />
            <div className="curr-timestamp"></div>
          </div>
          <div
            className="hover-container"
            onMouseMove={(e) => displayHoverIndicator(e)}
            onClick={(e) => divideSegment(e)}
          >
            <div
              className="hoverIndicator"
              style={{ left: indicatorPosition }}
            ></div>
          </div>
          <button onClick={() => deleteSegment(selectedSegment)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default Segment;
