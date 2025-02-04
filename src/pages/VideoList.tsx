import React, { useEffect } from "react";
import firebase from "firebase";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/modules";
import { setvideoCollectionFromDB } from "../redux/modules/videoCollection";
import { List, Button, Tooltip } from "antd";

import "./videoList.css";
import {
  CheckOutlined,
  ExclamationOutlined,
  StarFilled,
  HourglassOutlined,
  StarOutlined,
} from "@ant-design/icons";

interface AppProps {
  history?: any;
  user: any;
  registerNum: string;
  approved: boolean;
}

const VideoList: React.FC<AppProps> = ({
  history,
  user,
  registerNum,
  approved,
}) => {
  const videoCollection = useSelector(
    (state: RootState) => state.setVideoCollection.videoCollection
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setvideoCollectionFromDB(registerNum));
  }, [registerNum]);

  const unmark = (video: any) => {
    const collection = firebase.firestore().collection("videos");
    collection
      .doc(video.id)
      .update({ complete: false })
      .then(() => {
        console.log("Incomplete video");
        dispatch(setvideoCollectionFromDB(registerNum));
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  };

  const countAll = (collection: any[]) => {
    var res = 0;
    collection.forEach((c) => {
      if (c.assign === registerNum) res++;
    });
    return res;
  };
  const countComplete = (collection: any[]) => {
    var res = 0;
    collection.forEach((c) => {
      if (c.complete && c.assign === registerNum) res++;
    });
    return res;
  };

  const icon = (type: string) => {
    if (type === "tutorial")
      return (
        <Tooltip placement="right" title="Tutorial">
          <div
            className="icon-wrapper"
            style={{ backgroundColor: "rgb(241, 201, 19)" }}
          >
            <StarOutlined style={{ color: "white" }} />
          </div>
        </Tooltip>
      );
    else if (type === "tutorialComplete")
      return (
        <Tooltip placement="right" title="Completed Tutorial">
          <div
            className="icon-wrapper"
            style={{ backgroundColor: "rgb(241, 201, 19)" }}
          >
            <StarFilled style={{ color: "white" }} />
          </div>
        </Tooltip>
      );
    else if (type === "complete")
      return (
        <Tooltip placement="right" title="Complete">
          <div className="icon-wrapper" style={{ backgroundColor: "#1a90ff" }}>
            <CheckOutlined style={{ color: "white" }} />
          </div>
        </Tooltip>
      );
    else if (type === "incomplete")
      return (
        <Tooltip placement="right" title="Incomplete">
          <div className="icon-wrapper" style={{ backgroundColor: "#777777" }}>
            <ExclamationOutlined style={{ color: "white" }} />
          </div>
        </Tooltip>
      );
    else if (type === "wait")
      return (
        <Tooltip placement="right" title="Waiting">
          <div className="icon-wrapper" style={{ backgroundColor: "#777777" }}>
            <HourglassOutlined style={{ color: "white" }} />
          </div>
        </Tooltip>
      );
  };

  return (
    <div className="list-container">
      <h1 style={{ fontWeight: "bold", marginTop: "50px", lineHeight: "20px" }}>
        Nice to meet you, {user.displayName}!
      </h1>
      {approved ? (
        <h3 style={{ marginBottom: "20px" }}>
          You've completed {countComplete(videoCollection)}/
          {countAll(videoCollection)} videos
        </h3>
      ) : (
        <h3 style={{ marginBottom: "20px" }}>
          Complete tutorials and wait for approval.
        </h3>
      )}
      <List
        itemLayout="horizontal"
        dataSource={videoCollection}
        renderItem={(video: any) => {
          if (video.assign === registerNum) {
            if (video.id.includes("tutorial"))
              return (
                <List.Item>
                  <List.Item.Meta
                    style={{ alignItems: "center" }}
                    avatar={
                      video.complete
                        ? icon("tutorialComplete")
                        : icon("tutorial")
                    }
                    title={<Link to={"/video/" + video.id}>{video.title}</Link>}
                    description={video.author}
                  />
                </List.Item>
              );
            else if (approved) {
              return (
                <List.Item>
                  <List.Item.Meta
                    style={{ alignItems: "center" }}
                    avatar={
                      video.complete ? icon("complete") : icon("incomplete")
                    }
                    title={<Link to={"/video/" + video.id}>{video.title}</Link>}
                    description={video.author}
                  />
                  {video.complete && (
                    <div>
                      <Button onClick={() => unmark(video)}>
                        Mark as imcomplete
                      </Button>
                    </div>
                  )}
                </List.Item>
              );
            } else {
              return (
                <List.Item>
                  <List.Item.Meta
                    style={{ alignItems: "center" }}
                    avatar={icon("wait")}
                    title={
                      <Tooltip
                        placement="bottomLeft"
                        title="Please wait for tutorial approval"
                      >
                        <div
                          style={{
                            width: video.title.length * 5 + "px",
                            height: "12px",
                            margin: "4px 0",
                            borderRadius: "1px",
                            backgroundColor: "lightgray",
                          }}
                        />
                      </Tooltip>
                    }
                    description={
                      <div
                        style={{
                          width: video.author.length * 5 + "px",
                          height: "8px",
                          marginTop: "12px",
                          marginBottom: "4px",
                          borderRadius: "1px",
                          backgroundColor: "lightgray",
                        }}
                      />
                    }
                  />
                </List.Item>
              );
            }
          }
        }}
      />
    </div>
  );
};

export default VideoList;
