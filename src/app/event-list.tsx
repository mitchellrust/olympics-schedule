'use client'

import { useEffect, useState, Suspense } from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Stack, Container, Navbar, NavbarBrand, ListGroup, ListGroupItem, Accordion, AccordionItem, AccordionHeader, AccordionBody } from "react-bootstrap";
import { fetchEventsAction } from "./actions";
import { useSearchParams } from "next/navigation";

export default function EventList() {
  const [events, setEvents] = useState<any[]>();

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

  let content: any;

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
        const startDateTimeUTC = new Date(event["startDate"]);
        let startHour = startDateTimeUTC.getHours();
        const startMinute = startDateTimeUTC.getMinutes();
  
        const startTime = `${startHour % 12 === 0 ? 12 : startHour % 12}:${startMinute < 10 ? '0' : ''}${startMinute}`;
  
        return (
            <Card key={event["id"]}>
              <CardBody>
                <CardTitle>{`${event["disciplineName"]} - ${startTime}${startHour < 12 ? "am" : "pm"}`}</CardTitle>
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
                                  return (
                                    <ListGroupItem key={comp["order"]}>{`${comp["noc"]} - ${comp["name"]}`}</ListGroupItem>
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
                          return (
                            <ListGroupItem key={comp["order"]}>{`${comp["noc"]} - ${comp["name"]}`}</ListGroupItem>
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
  }

  // statusDescriptions
  // Scheduled
  // Running
  // Finished
  // Getting Ready

  return (
    <>
      <Navbar bg="light" variant="light">
                  <Container>
                      <NavbarBrand className="mx-auto">Schedule</NavbarBrand>
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
