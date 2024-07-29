'use client'

import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Stack, Container, Navbar, NavbarBrand, ListGroup, ListGroupItem, Accordion, AccordionItem, AccordionHeader, AccordionBody, Badge, Col, Row, Button, DropdownButton, DropdownItem } from "react-bootstrap";
import { fetchEventsAction } from "./actions";
import { useSearchParams } from "next/navigation";

export default function EventList() {
  const [events, setEvents] = useState<any[]>();
  const [showScores, setShowScores] = useState(false);
  const [filterUSA, setFilterUSA] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  // See if id was passed in query params
  const queryParams = useSearchParams();
  let currentDateStr = queryParams.get("date");

  if (currentDateStr === null)
  {
    const currentDate = new Date();
    const monthStr = currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`;
    const dayStr = currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : `${currentDate.getDate()}`;
    currentDateStr = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
  }

  useEffect(() => {
    const updateEvents = async () => {
      const updatedEvents = await fetchEventsAction(currentDateStr);
      setEvents(updatedEvents);
    };
 
    updateEvents()
  }, [currentDateStr]);

  const toggleScores = () => {
    console.log("toggling scores");
    setShowScores(!showScores);
  }

  const toggleUSA = () => {
    console.log("toggling USA filter");
    setFilterUSA(!filterUSA);
  }

  let content: any;
  let eventTypes: string[] = [];

  if (events === undefined)
  {
    content = <p>{`Fetching events for ${currentDateStr}...`}</p>
  }
  else if (events!.length === 0)
  {
    content = <p>{`Could not find any events for ${currentDateStr}`}</p>
  }
  else
  {
    content = events!.map(
      (event: any) => {
        if (event["competitors"].length < 1)
        {
          // Don't care about events with no competitors, some weird group stuff or something.
          return null;
        }

        // Apply filters
        if (
          filterUSA &&
          event["competitors"].every((comp: any) => comp["noc"] !== "USA")
        )
        {
          return null;
        }
        else if (eventTypeFilter !== "" && event["disciplineName"] !== eventTypeFilter)
        {
          return null
        }

        const startDateTimeUTC = new Date(event["startDate"]);
        let startHour = startDateTimeUTC.getHours();
        const startMinute = startDateTimeUTC.getMinutes();
  
        const startTime = `${startHour % 12 === 0 ? 12 : startHour % 12}:${startMinute < 10 ? '0' : ''}${startMinute}`;

        const statusBadge = event["status"] == "SCHEDULED"
          ? <Badge pill bg="primary" className="align-self-end">Upcoming</Badge>
          : event["status"] == "GETTING_READY"
            ? <Badge pill bg="success" className="align-self-end">Starting</Badge>
            : event["status"] == "RUNNING"
              ? <Badge pill bg="success" className="align-self-end">Live</Badge>
              : event["status"] == "FINISHED"
                ? <Badge pill bg="secondary" className="align-self-end">Finished</Badge>
                : event["status"] == "RESCHEDULED"
                  ? <Badge pill bg="warning" className="align-self-end">Rescheduled</Badge>
                  : event["status"] == "CANCELLED"
                    ? <Badge pill bg="danger" className="align-self-end">Cancelled</Badge>
                    : <Badge pill bg="secondary" className="align-self-end">{event["status"]}</Badge>

        return (
            <Card key={event["id"]}>
              <CardBody>
                <CardTitle>
                  <Row>
                    <Col>
                      {`${event["disciplineName"]} - ${startTime}${startHour < 12 ? "am" : "pm"}`}
                    </Col>
                    <Col xs="auto">
                      { statusBadge }
                    </Col>
                  </Row>
                </CardTitle>
                <CardSubtitle>{event["eventUnitName"]}</CardSubtitle>
                {
                  event["competitors"].length > 2
                  ? <Accordion>
                      <AccordionItem eventKey="0">
                        <AccordionHeader>Competitors</AccordionHeader>
                        <AccordionBody>
                          <ListGroup variant="flush">
                              {
                                event["competitors"].map((comp: any) => {
                                  let score: string | null = null;

                                  if (
                                    comp["results"] !== undefined &&
                                    comp["results"] !== null
                                  )
                                  {
                                    score = comp["results"]["position"] !== ""
                                      ? comp["results"]["position"]
                                      : comp["results"]["mark"];
                                  }

                                  return (
                                    <ListGroupItem key={comp["order"]}>
                                      <Row>
                                        <Col>
                                          {`${comp["noc"]} - ${comp["name"]}`}
                                        </Col>
                                        {
                                          showScores
                                          ? <Col xs="auto">
                                              {score}
                                            </Col>
                                          : null
                                        }
                                      </Row>
                                    </ListGroupItem>
                                  );
                                })
                              }
                          </ListGroup>
                        </AccordionBody>
                      </AccordionItem>
                    </Accordion>
                  : <ListGroup variant="flush">
                      {
                        event["competitors"].map((comp: any) => {
                          let score: string | null = null;

                          if (
                            comp["results"] !== undefined &&
                            comp["results"] !== null
                          )
                          {
                            score = comp["results"]["position"] !== ""
                              ? comp["results"]["position"]
                              : comp["results"]["mark"];
                          }

                          return (
                            <ListGroupItem key={comp["order"]}>
                            <Row>
                              <Col>
                                {`${comp["noc"]} - ${comp["name"]}`}
                              </Col>
                              {
                                showScores
                                ? <Col xs="auto">
                                    {score}
                                  </Col>
                                : null
                              }
                            </Row>
                            </ListGroupItem>
                          );
                        })
                      }
                    </ListGroup>
                }
              </CardBody>
            </Card>
        );
      }
    );

    // Populate list of event types for filtering by type
    eventTypes = Array.from(
      new Set(
        events.map((event) => event["disciplineName"])
      )
    );
  }

  return (
    <>
      <Navbar bg="light" variant="light" sticky="top">
        <Container>
          <Button variant={showScores ? "primary" : "outline-primary"} size="sm" onClick={toggleScores}>{showScores ? "Hide" : "Show"} Scores</Button>
          <DropdownButton size="sm" variant="outline-primary" id="event-type-filter" title="Event Filter">
            {
              eventTypes.map((type: string) => {
                return <DropdownItem key={type} onClick={() => setEventTypeFilter(type)}>{type}</DropdownItem>
              })
            }
          </DropdownButton>
          <Button variant={filterUSA ? "primary" : "outline-primary"} size="sm" onClick={toggleUSA}>USA Only</Button>
        </Container>
      </Navbar>
      <Container>
        <Stack gap={2} className="col-md-5 mx-auto">
          { content }
        </Stack>
      </Container>
    </>
  );
}
