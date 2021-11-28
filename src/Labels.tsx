import React, { useState, useEffect } from "react";
import firebase from "./firebase";

// import { setLabel } from "./Segment";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./redux/modules";

import "./labels.css";

import { labels } from "./variables/label-info";
import { setSegmentListFromDB } from "./redux/modules/segmentList";
import { Alert, Input, Modal } from "antd";
import { setLabelListFromDB } from "./redux/modules/labelList";

interface IProps {
  totalTime: number;
}

const Labels: React.FC<IProps> = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelKey, setNewLabelKey] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#FFFFFF");
  const [cautionMessage, setCautionMessage] = useState("");

  const selectedSegment = useSelector(
    (state: RootState) => state.setSelectedSegment.selectedSegment
  );
  const labelList = useSelector(
    (state: RootState) => state.setLabelList.labelList
  );
  const dispatch = useDispatch();

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        var uid = user.uid;
        dispatch(setLabelListFromDB(uid));
      } else {
        console.error("User Not Exist!");
      }
    });
  }, [props.totalTime]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    var isValidKey = true;
    labelList.forEach((label: any) => {
      console.log(label.label + " " + newLabelKey);
      console.log(label.label === newLabelKey);
      if (label.label === newLabelKey) isValidKey = false;
    });
    if (isValidKey) {
      addCustomLabel(newLabelName, newLabelKey, newLabelColor);
      setIsModalVisible(false);
    } else {
      setCautionMessage(
        "The key " + newLabelKey + " is already used! Please use another key."
      );
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCautionMessage("");
  };

  const updateLabel = (id: string, label: any) => {
    console.log("[Label.tsx] Update " + id + " into " + label);

    const collection = firebase
      .firestore()
      .collection("videos")
      .doc("testvideo1")
      .collection("segments");
    const document = collection.doc(id);
    document
      .update({ label: label })
      .then(() => {
        dispatch(setSegmentListFromDB("testvideo1", props.totalTime));
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  };

  const setLabelonSegment = (key: string) => {
    if (selectedSegment !== "") updateLabel(selectedSegment, key);
  };

  const addAllLabels = () => {
    const collection = firebase.firestore().collection("labels");
    labels.forEach((label) => {
      collection
        .add(
          Object.assign(
            {
              user: "global",
              created: firebase.firestore.FieldValue.serverTimestamp(),
            },
            label
          )
        )
        .then(() => {
          console.log("Added " + label.label);
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    });
  };

  const addCustomLabel = (name: string, label: string, color: string) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        var uid = user.uid;
        const collection = firebase.firestore().collection("labels");
        collection
          .add({
            name,
            label,
            color,
            user: uid,
            created: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            console.log("Added " + label);
            dispatch(setLabelListFromDB(uid));
          })
          .catch((error) => {
            console.error("Error updating document: ", error);
          });
      } else {
        console.error("User Not Exist!");
      }
    });
  };

  return (
    <div className="label-container">
      <h1 style={{ textAlign: "center" }}>
        Map labels for each video part/segment
      </h1>
      <div className="labels">
        {labelList.map((l: any) => (
          <div
            className="surch-label"
            style={{ backgroundColor: l.color }}
            onClick={() => setLabelonSegment(l.label)}
          >
            {l.name}
          </div>
        ))}
        {/* <Button onClick={addAllLabels}>Add all labels</Button> */}
        <div className="surch-label" onClick={showModal}>
          + Add New Label
        </div>
        <Modal
          title="Add New Label"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <label className="modalLabel" htmlFor="labelName">
            Label Name
          </label>
          <Input
            id="labelName"
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label Name (ex. Bladder + Release)"
          />
          <label className="modalLabel" htmlFor="labelKey">
            Label Key
          </label>
          <Input
            id="labelKey"
            onChange={(e) => setNewLabelKey(e.target.value)}
            placeholder="Label Key (ex. BR)"
          />
          <label className="modalLabel" htmlFor="labelcolor">
            Label Color
          </label>
          <input
            id="labelcolor"
            onChange={(e) => setNewLabelColor(e.target.value)}
            type="color"
          />
          {cautionMessage !== "" && (
            <Alert message={cautionMessage} type="error" />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Labels;
