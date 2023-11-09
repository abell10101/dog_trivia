import React, { useState, useEffect, useRef } from "react";
import { Button, ProgressBar, Card } from "react-bootstrap";
import axios from "axios";
import barkSound from "../../server/barking-123909.mp3";

const bark = new Audio(barkSound);

function Dog(props) {
  const { dogObj, setClick, click } = props;
  const [dog, setDog] = useState(dogObj);
  const [userId, setUserId] = useState("");
  const [coinCount, setCoin] = useState(0);
  const [hungry, setHunger] = useState(true);
  const [happy, setHappy] = useState(false);
  const [feedStatus, setFeedStatus] = useState("");
  const [walkStatus, setWalkStatus] = useState("");
  const [feedTimer, setFeedTimer] = useState(0);
  const [walkTimer, setWalkTimer] = useState(0);

  const hungryRef = useRef(null);
  const happyRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    setUserId(user._id);
    setCoin(user.coinCount);
  }, []);

  const getDog = () => {
    axios
      .get(`/dog/id/${dog._id}`)
      .then(({ data }) => setDog(data))
      .catch((err) => {
        console.error(err);
      });
  };

  const handleClick = (e) => {
    const status = {};
    if (coinCount < 5) {
      alert("Not enough coins!");
    } else if (e === "feed") {
      setHunger(false);
      hungryRef.current = hungry;
      const feedDeadline = Date.parse(dog.feedDeadline) + 12 * 60 * 60 * 1000;
      status.feedDeadline = feedDeadline;
      setFeedTimer(feedDeadline)
    } else if (e === "walk") {
      setHappy(true);
      happyRef.current = happy;
      const walkDeadline = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      status.walkDeadline = walkDeadline;
      setWalkTimer(walkDeadline)
    } else {
      bark.play();
    }
    axios
      .put(`/dog/${dog._id}`, { status, cost: -5 })
      .then(({ data }) => setCoin(data.coinCount))
      .catch((err) => {
        console.error(err);
      });
      setClick(click + 1);
  };

  useEffect(() => {
    setDog(dog);
  }, [happy, hungry]);

  useEffect(() => {
    const x = setInterval(() => {
      const now = new Date().getTime();

      const feedTimer = ((Date.parse(dog.feedDeadline) - now) / 86400000) * 100;
      const walkTimer = ((Date.parse(dog.walkDeadline) - now) / 86400000) * 100;

      setFeedTimer(feedTimer);
      setWalkTimer(walkTimer);

      if (feedTimer < 25) {
        setFeedStatus("danger");
        if (hungryRef.current !== true) {
          setHunger(true);
          hungryRef.current = hungry;
        }
      } else if (feedTimer < 50) {
        setFeedStatus("warning");
        if (hungryRef.current !== true) {
          setHunger(true);
          hungryRef.current = hungry;
        }
      } else {
        setFeedStatus("success");
        if (hungryRef.current !== false) {
          setHunger(false);
          hungryRef.current = hungry;
        }
      }

      if (walkTimer < 25) {
        setWalkStatus("danger");
        if (happyRef.current !== false) {
          setHappy(false);
          happyRef.current = happy;
        }
      } else if (walkTimer < 50) {
        setWalkStatus("warning");
        if (happyRef.current !== false) {
          setHappy(false);
          happyRef.current = happy;
        }
      } else {
        setWalkStatus("success");
        if (happyRef.current !== true) {
          setHappy(true);
          happyRef.current = happy;
        }
      }
    }, 1000);
    return () => clearInterval(x);
  }, [happy, hungry, dog]);

  return (
    <Card>
      <Card.Img
        src={dog.img}
        alt="Sorry, your dog is in another kennel."
        style={{ maxWidth: 300, maxHeight: "auto", overflow: "hidden" }}
      />
      <Card.Header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "large",
        }}
      >
        {dog.name}
      </Card.Header>
      <Card.Body>
        <div className="dog-status">
          <div className="hunger-bar">
            <ProgressBar
              animated={true}
              striped
              variant={feedStatus}
              now={feedTimer}
              label="HUNGER"
              style={{ height: "35px" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hungry ? (
              <Button
                variant="info"
                onClick={() => handleClick("feed")}
              >
                🍖
              </Button>
            ) : (
              <Button
              variant="info"
              onClick={() => handleClick("bark")}
              >
                🦴
              </Button>
            )}
          </div>
          <div className="happy-bar">
            <ProgressBar
              animated={true}
              striped
              variant={walkStatus}
              now={walkTimer}
              label="HAPPINESS"
              style={{ height: "35px" }}
              />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {happy ? (
              <Button
              variant="info"
              onClick={() => handleClick("bark")}
              >
                🐶
              </Button>
            ) : (
              <Button
                variant="info"
                onClick={() => handleClick("walk")}
              >
                🐕‍🦺
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Dog;
