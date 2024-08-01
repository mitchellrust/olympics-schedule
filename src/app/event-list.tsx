'use client'

import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Stack, Container, Navbar, NavbarBrand, ListGroup, ListGroupItem, Accordion, AccordionItem, AccordionHeader, AccordionBody, Badge, Col, Row, Button, DropdownButton, DropdownItem, DropdownMenu, DropdownToggle, Dropdown, DropdownDivider } from "react-bootstrap";
import { fetchEventsAction } from "./actions";
import { useSearchParams } from "next/navigation";

const STATUS_MAP = {
  "SCHEDULED": "Upcoming",
  "GETTING_READY": "Starting",
  "RUNNING": "Live",
  "FINISHED": "Finished",
  "RESCHEDULED": "Rescheduled",
  "CANCELLED": "Cancelled"
}

export default function EventList() {
  const [events, setEvents] = useState<any[]>();
  const [showScores, setShowScores] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // See if id was passed in query params
  const queryParams = useSearchParams();
  let currentDate: Date;
  let currentDateStr = queryParams.get("date");

  if (currentDateStr === null)
  {
    currentDate = new Date();
    const monthStr = currentDate.getMonth() + 1 < 10 ? `0${currentDate.getMonth() + 1}` : `${currentDate.getMonth() + 1}`;
    const dayStr = currentDate.getDate() < 10 ? `0${currentDate.getDate()}` : `${currentDate.getDate()}`;
    currentDateStr = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
  }
  else
  {
    currentDate = new Date(currentDateStr);
  }

  //TODO: Add dropdown date picker

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

  let content: any;
  let eventTypes: string[] = [];
  let countryCodes: string[] = [];

  if (events === undefined)
  {
    content = <>
      <h2>{`Fetching events for ${currentDateStr}...`}</h2>
    </>
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
        if (eventTypeFilter !== "" && event["disciplineName"] !== eventTypeFilter)
        {
          return null
        }
        else if (countryFilter !== "" && event["competitors"].every((comp: any) => comp["noc"] !== countryFilter))
        {
          return null
        }

        const startDateTimeUTC = new Date(event["startDate"]);
        let startHour = startDateTimeUTC.getHours();
        const startMinute = startDateTimeUTC.getMinutes();
  
        const startTime = `${startHour % 12 === 0 ? 12 : startHour % 12}:${startMinute < 10 ? '0' : ''}${startMinute}`;

        const statusBadge = event["status"] == "SCHEDULED"
          ? <Badge pill bg="primary" className="align-self-end">{STATUS_MAP.SCHEDULED}</Badge>
          : event["status"] == "GETTING_READY"
            ? <Badge pill bg="success" className="align-self-end">{STATUS_MAP.GETTING_READY}</Badge>
            : event["status"] == "RUNNING"
              ? <Badge pill bg="success" className="align-self-end">{STATUS_MAP.RUNNING}</Badge>
              : event["status"] == "FINISHED"
                ? <Badge pill bg="secondary" className="align-self-end">{STATUS_MAP.FINISHED}</Badge>
                : event["status"] == "RESCHEDULED"
                  ? <Badge pill bg="warning" className="align-self-end">{STATUS_MAP.RESCHEDULED}</Badge>
                  : event["status"] == "CANCELLED"
                    ? <Badge pill bg="danger" className="align-self-end">{STATUS_MAP.CANCELLED}</Badge>
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
                                  let variant: string | undefined;

                                  if (
                                    comp["results"] !== undefined &&
                                    comp["results"] !== null
                                  )
                                  {
                                    score = comp["results"]["position"] !== ""
                                      ? comp["results"]["position"]
                                      : comp["results"]["mark"];
                                    
                                    if (showScores)
                                    {
                                      if (comp["results"]["medalType"] === "ME_BRONZE")
                                      {
                                        variant = "bronze";
                                      }
                                      else if (comp["results"]["medalType"] === "ME_SILVER")
                                      {
                                        variant = "silver";
                                      }
                                      else if (comp["results"]["medalType"] === "ME_GOLD")
                                      {
                                        variant = "gold";
                                      }
                                      else if (comp["results"]["winnerLoserTie"] === "W")
                                      {
                                        variant = "success";
                                      }
                                      else if (comp["results"]["winnerLoserTie"] === "L")
                                      {
                                        variant = "danger";
                                      }
                                    }
                                  }

                                  return (
                                    <ListGroupItem variant={variant} key={comp["order"]}>
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
                          let variant: string | undefined;

                          if (
                            comp["results"] !== undefined &&
                            comp["results"] !== null
                          )
                          {
                            score = comp["results"]["position"] !== ""
                              ? comp["results"]["position"]
                              : comp["results"]["mark"];
                            
                            if (showScores)
                            {
                              if (comp["results"]["medalType"] === "ME_BRONZE")
                              {
                                variant = "bronze";
                              }
                              else if (comp["results"]["medalType"] === "ME_SILVER")
                              {
                                variant = "silver";
                              }
                              else if (comp["results"]["medalType"] === "ME_GOLD")
                              {
                                variant = "gold";
                              }
                              else if (comp["results"]["winnerLoserTie"] === "W")
                              {
                                variant = "success";
                              }
                              else if (comp["results"]["winnerLoserTie"] === "L")
                              {
                                variant = "danger";
                              }
                            }
                          }

                          return (
                            <ListGroupItem variant={variant} key={comp["order"]}>
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
      new Set<string>(
        events.map((event: any) => event["disciplineName"])
      )
    ).sort();

    // Populate list of country codes for filtering
    countryCodes = Array.from(
      new Set<string>(
        events.flatMap((event: any) => {
          return event["competitors"].map((comp: any) => comp["noc"])
        })
      )
    ).sort();
  }

  return (
    <>
      <style type="text/css">
        {`
          .list-group-item-gold {
            background-color: gold;
          }

          .list-group-item-silver {
            background-color: silver;
          }

          .list-group-item-bronze {
            background-color: #CD7F32;
          }
        `}
      </style>
      <Navbar bg="light" variant="light" sticky="top">
        <Container>
          <Button variant={showScores ? "primary" : "outline-primary"} size="sm" onClick={toggleScores}>{showScores ? "Hide" : "Show"} Scores</Button>
          <Dropdown>
            <DropdownToggle size="sm" variant="outline-primary" id="event-type-filter">
              {
                eventTypeFilter !== ""
                  ? eventTypeFilter
                  : "Event Filter"
              }
            </DropdownToggle>

            <DropdownMenu style={{ 
                maxHeight: "80vh", 
                overflowY: "auto", 
              }}>
                {
                  eventTypeFilter !== ""
                  ? <>
                      <DropdownItem key="clear" onClick={() => setEventTypeFilter('')}>Clear Filter</DropdownItem>
                      <DropdownDivider />
                    </>
                  : null
                }
              {
                eventTypes.map((type: string) => {
                  return <DropdownItem key={type} onClick={() => setEventTypeFilter(type)}>{type}</DropdownItem>
                })
              }
            </DropdownMenu>
          </Dropdown>
          <Dropdown>
            <DropdownToggle size="sm" variant="outline-primary" id="country-filter">
              {
                countryFilter !== ""
                  ? countryFilter
                  : "Country Filter"
              }
            </DropdownToggle>

            <DropdownMenu style={{ 
                maxHeight: "80vh", 
                overflowY: "auto", 
              }}>
                {
                  countryFilter !== ""
                  ? <>
                      <DropdownItem key="clear" onClick={() => setCountryFilter('')}>Clear Filter</DropdownItem>
                      <DropdownDivider />
                    </>
                  : null
                }
              {
                countryCodes.map((code: string) => {
                  return <DropdownItem key={code} onClick={() => setCountryFilter(code)}>{code}</DropdownItem>
                })
              }
            </DropdownMenu>
          </Dropdown>
          {
            countryCodes.includes("USA") &&
            countryFilter !== "USA"
              ? <Button variant="outline-primary" size="sm" onClick={() => setCountryFilter("USA")}>USA Only</Button>
              : null
          }
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
